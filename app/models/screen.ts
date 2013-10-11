import $ = require('jquery');
import Backbone = require('backbone');

import Page = require('models/page');
import Pages = require('collections/pages');
import Builder = require('models/builder');
import Events = require('models/events');

export = _Screen;

module _Screen {
  export interface Content extends HTMLElement {}

  export enum Status { Success, Error, Loading, }
  export enum ViewMode { OnePage, TwoPage, }
  export enum ReadingDirection { Forward = +1, Backward = -1 }

  export interface Setting {
    detectsSpreadPage(): boolean;
    viewMode(): ViewMode;
    isSpreadPage(content: Page.Content): boolean;
  }

  export interface UpdateParams {
    currentPageNum: number;
    readingDirection: ReadingDirection;
  }

  export interface UpdateResult { }

  export interface Size {
    width: number;
    height: number;
  }

  export interface Screen extends Events.Events {
    status(): Status;
    content(): Content;

    pages(): Page.Page[];
    update(pages: Pages.Collection, params: UpdateParams): JQueryPromise<UpdateResult>;
    resize(width: number, height: number): void;
  }

  export interface Factory {
    create(size: Size): Screen;
  }

  export function createScreen(size: Size, builder: Builder.Builder, setting: Setting): Screen {
    return new ScreenModel(size, builder, setting);
  }

  export function createFactory(builder: Builder.Builder, setting: Setting): Factory {
    return {
      create: (size: Size) => createScreen(size, builder, setting),
    };
  }
}

// private
class ScreenModel extends Backbone.Model implements _Screen.Screen {
  private _builder: Builder.Builder;
  private _size: _Screen.Size;
  private _setting: _Screen.Setting;
  private _pages: Page.Page[];
  private _pageContents: Page.Content[];
  private _deferred: JQueryDeferred<_Screen.UpdateResult>;

  constructor(size: _Screen.Size, builder: Builder.Builder, setting: _Screen.Setting) {
    this._builder = builder;
    this._size = size;
    this._setting = setting;
    this._pages = [];
    this._pageContents = [];
    this._deferred = null;
    super();
  }

  defaults() {
    return {
      status: _Screen.Status.Loading,
      content: null,
    };
  }

  status() { return <_Screen.Status>this.get('status'); }
  content() { return <_Screen.Content>this.get('content'); }
  setStatus(status: _Screen.Status) { this.set('status', status); }
  setContent(content: _Screen.Content) { this.set('content', content); }
  pages() { return this._pages; }

  resize(width: number, height: number): void {
    this._size = { width: width, height: height };
    this.setContent(this._builder.build(this._pageContents, this._size));
  }

  update(pages: Pages.Collection, params: _Screen.UpdateParams)
  : JQueryPromise<_Screen.UpdateResult> {
    if (this._deferred !== null) { this._deferred.reject(); }
    var deferred = this._deferred = $.Deferred<_Screen.UpdateResult>();
    this.setStatus(_Screen.Status.Loading);

    var successFirstPage: boolean = false;
    var pageNum = params.currentPageNum;
    var direction = params.readingDirection;
    var newPageContents: Page.Content[] = [];
    var promise = pages.at(pageNum).content().then((content: Page.Content) => {
      successFirstPage = true;
      newPageContents.push(content);
    });
    this._pages = [pages.at(pageNum)];

    if (this._setting.viewMode() === _Screen.ViewMode.TwoPage) {
      promise = promise.then(() => {
        var content = newPageContents[0];
        var nextPageNum = pageNum + direction;
        if (nextPageNum < 0
            || pages.length <= nextPageNum
            || (this._setting.detectsSpreadPage()
                && this._setting.isSpreadPage(content))) {
          return $.Deferred<void>().resolve().promise();
        }
        var nextPromise = pages.at(nextPageNum).content()
          .then<void>((nextContent: Page.Content) => {
            if (!this._setting.detectsSpreadPage()
                || !this._setting.isSpreadPage(nextContent)) {
              if (direction === _Screen.ReadingDirection.Backward) {
                newPageContents.unshift(nextContent);
                this._pages.unshift(pages.at(nextPageNum));
              } else {
                newPageContents.push(nextContent);
                this._pages.push(pages.at(nextPageNum));
              }
            }
          });
        return nextPromise;
      });
    }
    promise.then(() => {
      this._pageContents = newPageContents;
      this.setContent(this._builder.build(this._pageContents, this._size));
      this.setStatus(_Screen.Status.Success);
      deferred.resolve({});
    }).fail(() => {
      if (successFirstPage) {
        this._pageContents = newPageContents;
        this.setContent(this._builder.build(this._pageContents, this._size));
        this.setStatus(_Screen.Status.Success);
      } else {
        this.setStatus(_Screen.Status.Error);
      }
      deferred.resolve({});
    });;
    return deferred.promise();;
  }
}
