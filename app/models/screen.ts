import $ = require('jquery');
import Page = require('models/page');
import Events = require('models/events');
import Backbone = require('backbone');

export = _Screen;

module _Screen {
  export interface Content extends HTMLElement {}

  export enum Status { Success, Error, Loading, }
  export enum ViewMode { OnePage, TwoPage, }
  export enum PageDirection { L2R, R2L, }
  export enum ReadingDirection { Forward = +1, Backward = -1 }

  export interface  ScreenSetting {
    detectsSpreadPage(): boolean;
    viewMode(): ViewMode;
    isSpreadPage(content: Page.Content): boolean;
  }

  export interface ScreenUpdateParams {
    currentPageNum: number;
    totalPageNum: number;
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
    update(pages: Page.Collection, params: ScreenUpdateParams): JQueryPromise<UpdateResult>;
    resize(width: number, height: number): void;
  }

  export interface ContentBuilderParams {
    width: number;
    height: number;
  }

  export interface ContentBuilder {
    build(pages: Page.Content[], params: ContentBuilderParams): Content;
  }

  export function createScreen(size: Size, builder: ContentBuilder, setting: ScreenSetting): Screen {
    return new ScreenModel(size, builder, setting);
  }
}

// private
class ScreenModel extends Backbone.Model implements _Screen.Screen {
  private _builder: _Screen.ContentBuilder;
  private _size: _Screen.Size;
  private _setting: _Screen.ScreenSetting;
  private _pages: Page.Page[];
  private _pageContents: Page.Content[];
  private _deferred: JQueryDeferred<_Screen.UpdateResult>;

  constructor(size: _Screen.Size, builder: _Screen.ContentBuilder, setting: _Screen.ScreenSetting) {
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

  update(pages: Page.Collection, params: _Screen.ScreenUpdateParams)
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
            || params.totalPageNum <= nextPageNum
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


  // export interface Setting {
  //   prevScreenNum(): number;
  //   nextScreenNum(): number;
  //   detectsSpreadPage(): boolean;
  //   viewMode(): ViewMode;
  //   pageDirection(): PageDirection;
  //   isSpreadPage(content: Page.Content): boolean;
  // }

  // export interface ReadingInfo {
  //   currentPageNum: number;
  //   totalPageNum: number;
  //   readingDirection: ReadingDirection;
  // }


  // export interface Collection extends Events.Events {
  //   length: number;
  //   at(index: number): Screen;
  //   focusedScreenIndex(): number;
  //   update(pages: Page.Collection, readingInfo: ReadingInfo): JQueryPromise<void>;
  //   // resize(width: number, height: number): void;
  // }

  // export interface ContentBuilderSetting {
  //   width: number;
  //   height: number;
  //   direction: PageDirection;
  // }

  // export interface ContentBuilder {
  //   build(pages: Page.Content[], setting: ContentBuilderSetting): Content;
  // }

  // export interface Size {
  //   width: number;
  //   height: number;
  // }

  // export function createCollection(builder: ContentBuilder, size: Size, setting: Setting): Collection {
  //   return new ScreenCollection(builder, size, setting);
  // }

  // export function createBuilder(): ContentBuilder {
  //   return undefined;
  // }


// class ScreenCollection extends Backbone.Collection<ScreenModel> implements _Screen.Collection {
//   private _builder: _Screen.ContentBuilder;
//   private _size: _Screen.Size;
//   private _setting: _Screen.Setting;
//   private _focusedScreenIndex: number;

//   private _currentDeferred: JQueryDeferred<void>;
//   private _prevScreens: ScreenModel[];
//   private _nextScreens: ScreenModel[];
//   private _nextScreenPage: number;
//   private _prevScreenPage: number;

//   constructor(builder: _Screen.ContentBuilder, size: _Screen.Size, setting: _Screen.Setting) {
//     this._builder = builder;
//     this._size = size;
//     this._setting = setting;
//     this._focusedScreenIndex = 0;
//     this._currentDeferred = null;
//     this._prevScreens = [];
//     this._nextScreens = [];
//     this.model = ScreenModel;
//     super();
//   }

//   focusedScreenIndex(): number { return this._focusedScreenIndex; }
//   update(pages: Page.Collection, readingInfo: _Screen.ReadingInfo): JQueryPromise<void> {
//     // cleanup previous update task
//     if (this._currentDeferred !== null) {
//       this._currentDeferred.reject();
//       this._currentDeferred = null;
//     }
//     // if pages is empty, return immediately
//     if (pages.length === 0) {
//       if (this.length > 0) { this.reset([]); }
//       return $.Deferred<void>().resolve().promise();
//     }
//     // reset # of screens
//     this.resetScreens(readingInfo);
//     var maxlen = Math.max(this._prevScreens.length, this._nextScreens.length);
//     var updateScreenList: ScreenModel[] = [this.at(this._focusedScreenIndex)];
//     for (var i = 0; i < maxlen; ++i) {
//       if (i < this._prevScreens.length) {
//         updateScreenList.push(this._prevScreens[i]);
//       }
//       if (i < this._nextScreens.length) {
//         updateScreenList.push(this._nextScreens[i]);
//       }
//     }

//     var promise: JQueryPromise<void> = null;
//     for (var i = 0, len = updateScreenList.length; i < len; ++i) {
//       if (i === 0) {
//         this._currentDeferred = this.updateScreen(updateScreenList[i], pages, readingInfo);
//         promise = this._currentDeferred.promise();
//       } else {
//         ((index: number) => {
//           promise = promise.then(() => {
//             this._currentDeferred = this.updateScreen(updateScreenList[i], pages, readingInfo);
//             return this._currentDeferred.promise();
//           });
//         }(i));
//       }
//     }
//     return promise;
//   }

//   updateScreen(screen: ScreenModel, pages: Page.Collection, readingInfo: _Screen.ReadingInfo)
//   : JQueryDeferred<void> {
//     var deferred = $.Deferred<void>();
//     var screenIndex = this.indexOf(screen);
//     var pageNum: number = 0;
//     var direction: _Screen.ReadingDirection = null;
//     if (screenIndex === this._focusedScreenIndex) {
//       pageNum = readingInfo.currentPageNum;
//       direction = readingInfo.readingDirection;
//     } else if (screenIndex < this._focusedScreenIndex) {
//       pageNum = readingInfo.currentPageNum + this._prevScreenPage;
//       direction = _Screen.ReadingDirection.Backward;
//     } else {
//       pageNum = readingInfo.currentPageNum - this._prevScreenPage;
//       direction = _Screen.ReadingDirection.Forward;
//     }

//     if (pageNum < 0 || readingInfo.totalPageNum <= pageNum) {
//       this.remove(screen);
//       if (screenIndex < this._focusedScreenIndex) {
//         this._focusedScreenIndex -= 1;
//       }
//       return deferred.resolve();
//     }

//     var pageContents: Page.Content[] = [];

//     var promise = pages.at(pageNum).content().then((content: Page.Content) => {
//       pageContents.push(content);
//     });

//     if (this._setting.viewMode() === _Screen.ViewMode.TwoPage) {
//       promise = promise.then(() => {
//         var content = pageContents[0];
//         var nextPage = pageNum + direction;
//         if (nextPage < 0
//             || readingInfo.totalPageNum <= nextPage
//             || this._setting.isSpreadPage(content)) {
//           return $.Deferred<void>().resolve().promise();
//         }
//         var nextPromise = pages.at(nextPage).content()
//           .then<void>((nextContent: Page.Content) => {
//             if (!this._setting.isSpreadPage(nextContent)) {
//               if (direction === _Screen.ReadingDirection.Backward) {
//                 pageContents.unshift(nextContent);
//               } else {
//                 pageContents.push(nextContent);
//               }
//             }
//           });
//         return nextPromise;
//       });
//     }

//     promise.then(() => {
//       screen.setContent(this._builder.build(pageContents, {
//         width: this._size.width,
//         height: this._size.height,
//         direction: this._setting.pageDirection(),
//       }));
//       var focused = screenIndex === this._focusedScreenIndex ? 1 : 0;
//       if (direction === _Screen.ReadingDirection) {
//         this._prevScreenPage += pageContents.length - focused;
//       } else {
//         this._nextScreenPage += pageContents.length - focused;
//       }
//       deferred.resolve();
//     });
//     return deferred;
//   }

//   resetScreens(readingInfo: _Screen.ReadingInfo): void {
//     var currentPageNum = readingInfo.currentPageNum;
//     var totalPageNum = readingInfo.totalPageNum;
//     var prevScreenNum = Math.min(this._setting.prevScreenNum(), currentPageNum);
//     var nextScreenNum = Math.min(this._setting.nextScreenNum(), totalPageNum - currentPageNum - 1);

//     var screenNum = 1 + prevScreenNum + nextScreenNum;
//     if (screenNum !== this.length) {
//       var screens: ScreenModel[] = [];
//       for (var i = 0; i < screenNum; ++i) {
//         screens.push(new ScreenModel({status: _Screen.Status.Loading}));
//       }
//       this.reset(screens);
//     }

//     if (this._focusedScreenIndex !== prevScreenNum) {
//       this._focusedScreenIndex = prevScreenNum;
//       this.trigger('update');
//     }

//     this._prevScreens = [];
//     this._nextScreens = [];
//     for (var i = 0; i < prevScreenNum; ++i) {
//       this._prevScreens.push(this.at(this.focusedScreenIndex() - i - 1));
//     }
//     for (var i = 0; i < nextScreenNum; ++i) {
//       this._nextScreens.push(this.at(this.focusedScreenIndex() + i + 1));
//     }

//     this._nextScreenPage = 1;
//     this._prevScreenPage = 1;
//   }
//   // resize(width: number, height: number): void {}
// }
