import $ = require('jquery');
import Backbone = require('backbone');

import Events = require('models/events');
import Page = require('models/page');
import Pages = require('collections/pages');
import Scaler = require('models/scaler');

export = _Screen;

module _Screen {
  export interface Content extends HTMLElement {}

  export enum Status { Success, Error, Loading, }
  export enum ViewMode { OnePage, TwoPage, }
  export enum ReadingDirection { Forward = +1, Backward = -1 }
  export enum PageDirection { L2R, R2L, }

  export interface Setting extends Events.Events {
    detectsSpreadPage(): boolean;
    viewMode(): ViewMode;
    isSpreadPage(content: Page.Content): boolean;
    pageDirection(): PageDirection;
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

  export function createScreen(size: Size, scaler: Scaler.Scaler, setting: Setting): Screen {
    return new ScreenModel(size, scaler, setting);
  }

  export function createFactory(scaler: Scaler.Scaler, setting: Setting): Factory {
    return {
      create: (size: Size) => createScreen(size, scaler, setting),
    };
  }
}

// private
class ScreenModel extends Backbone.Model implements _Screen.Screen {
  private _builder: Scaler.Scaler;
  private _size: _Screen.Size;
  private _setting: _Screen.Setting;
  private _pages: Page.Page[];
  private _pageContents: Page.Content[];
  private _deferred: JQueryDeferred<_Screen.UpdateResult>;

  constructor(size: _Screen.Size, builder: Scaler.Scaler, setting: _Screen.Setting) {
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

  updateContent(contents: Page.Content[]): void {
    this._pageContents = contents;
    if (this._setting.pageDirection() === _Screen.PageDirection.L2R) {
      contents = contents.slice(0);
      contents.reverse();
    }
    this.setContent(this._builder.scale(contents, this._size));
  }

  status() { return <_Screen.Status>this.get('status'); }
  content() { return <_Screen.Content>this.get('content'); }
  setStatus(status: _Screen.Status) { this.set('status', status); }
  setContent(content: _Screen.Content) { this.set('content', content); }
  pages() { return this._pages; }

  resize(width: number, height: number): void {
    this._size = { width: width, height: height };
    this.updateContent(this._pageContents);
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
    var displayedPages = [pages.at(pageNum)];
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
                displayedPages.unshift(pages.at(nextPageNum));
              } else {
                newPageContents.push(nextContent);
                displayedPages.push(pages.at(nextPageNum));
              }
            }
          });
        return nextPromise;
      });
    }
    promise.then(() => {
      if (deferred.state() === 'rejected') { return; }
      this._pages = displayedPages;
      this.updateContent(newPageContents);
      this.setStatus(_Screen.Status.Success);
      deferred.resolve({});
      this._deferred = null;
    }).fail(() => {
      if (deferred.state() === 'rejected') { return; }
      this._pages = displayedPages;
      if (successFirstPage) {
        this.updateContent(newPageContents);
        this.setStatus(_Screen.Status.Success);
      } else {
        this.setStatus(_Screen.Status.Error);
      }
      deferred.resolve({});
      this._deferred = null;
    });
    return deferred.promise();;
  }
}
