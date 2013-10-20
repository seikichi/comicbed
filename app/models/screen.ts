import Backbone = require('backbone');
import Promise = require('promise');

import Events = require('models/events');
import Page = require('models/page');
import Pages = require('collections/pages');
import Scaler = require('models/scaler');

export = _Screen;

module _Screen {
  export interface Content extends Node {}

  export enum Status { Success, Error, Interrupted, Loading, }
  export enum ViewMode { OnePage = 1, TwoPage = 2, }
  export enum ReadingDirection { Forward = +1, Backward = -1 }
  export enum PageDirection { L2R = +1, R2L = -1, }

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
    cancel(): void;

    pages(): Page.Page[];
    update(pages: Pages.Collection, params: UpdateParams): Promise<UpdateResult>;
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
  private _previousUpdatePromise: Promise<_Screen.UpdateResult>;

  constructor(size: _Screen.Size, builder: Scaler.Scaler, setting: _Screen.Setting) {
    this._builder = builder;
    this._size = size;
    this._setting = setting;
    this._pages = [];
    this._pageContents = [];
    this._previousUpdatePromise = Promise.fulfilled({});
    super();
  }

  defaults() {
    return {
      status: _Screen.Status.Loading,
      content: null,
    };
  }

  cancel(): void {
    this._previousUpdatePromise.cancel();
  }

  updateContent(contents: Page.Content[]): void {
    this._pageContents = contents;
    if (this._setting.pageDirection() === _Screen.PageDirection.L2R) {
      contents = contents.slice(0);
      contents.reverse();
    }
    this._builder.scale(contents, this._size);
    this.trigger('change:content');
  }

  status() { return <_Screen.Status>this.get('status'); }
  content() {
    var frag = document.createDocumentFragment();
    for (var i = 0, len = this._pageContents.length; i < len; ++i) {
      frag.appendChild(this._pageContents[i]);
    }
    return frag;
  }
  setStatus(status: _Screen.Status) { this.set('status', status); }
  pages() { return this._pages; }
  setPages(pages: Page.Page[]) { this._pages = pages; }

  resize(width: number, height: number): void {
    this._size = { width: width, height: height };
    if (this.status() !== _Screen.Status.Success) { return; }
    this.updateContent(this._pageContents);
  }

  update(pages: Pages.Collection, params: _Screen.UpdateParams) : Promise<_Screen.UpdateResult> {
    this._previousUpdatePromise.cancel();
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
          return Promise.fulfilled<void>(null);
        }

        return pages.at(nextPageNum).content().then<void>((nextContent: Page.Content) => {
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
          return Promise.fulfilled<void>(null);
        });
      });
    }
    this._previousUpdatePromise = promise.then(() => {
      this._pages = displayedPages;
      this.updateContent(newPageContents);
      this.setStatus(_Screen.Status.Success);
    }).catch((reason: any) => {
      if (reason && reason && 'name' in reason && reason.name === 'CancellationError') {
        this.setStatus(_Screen.Status.Error);
        return Promise.rejected(reason);
      }

      this._pages = displayedPages;
      if (successFirstPage) {
        this.updateContent(newPageContents);
        this.setStatus(_Screen.Status.Interrupted);
      } else {
        this.setStatus(_Screen.Status.Error);
      }
    });
    return this._previousUpdatePromise.uncancellable();
  }
}
