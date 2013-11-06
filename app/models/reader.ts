import Events = require('models/events');
import Screen = require('models/screen');
import Screens = require('collections/screens');
import Book = require('models/book');
import Promise = require('promise');
import PromiseUtil = require('utils/promise');
import Progress = require('models/progress');
import Setting = require('models/setting');
import Sort = require('models/sort');

export = Reader;

module Reader {
  export enum Status { Closed, Opening, Opened, Error }

  export interface Options extends Book.Options {}

  export interface Reader extends Events.Events {
    // open/close
    openURL(url: string, options?: Options): Promise<Screens.Screens>;
    openFile(file: File): Promise<Screens.Screens>;
    close(): void;
    progress(): Progress.Progress;
    // properties
    title(): string;
    status(): Status;
    message(): string;
    currentPageNum(): number;
    totalPageNum(): number;
    readingDirection(): Screen.ReadingDirection;
    // move
    goNextScreen(): void;
    goPrevScreen(): void;
    goToPage(pageNum: number): void;
    // other
    resize(width: number, height: number): void;
    // deprecated
    screens(): Screens.Screens;
  }

  export function create(bookFactory: Book.Factory,
                         screens: Screens.Screens,
                         pageSorter: Sort.PageSorter,
                         setting: Setting.Setting)
  : Reader {
    return new ReaderModel(bookFactory, screens, pageSorter, setting);
  }

  export interface ScreenMover {
    goNextScreen(): void;
    goPrevScreen(): void;
  }
}

class ReaderModel extends Backbone.Model implements Reader.Reader {
  // immultable members
  private _bookFactory: Book.Factory;
  private _screens: Screens.Screens;
  private _pageSorter: Sort.PageSorter;
  private _setting: Setting.Setting;
  // mutable members
  private _book: Book.Book;
  private _promise: Promise<Screens.Screens>;
  private _progress: Progress.Progress;

  // ctor & initializer (TODO);
  constructor(bookFactory: Book.Factory,
              screens: Screens.Screens,
              pageSorter: Sort.PageSorter,
              setting: Setting.Setting) {
    this._bookFactory = bookFactory;
    this._screens = screens;
    this._pageSorter = pageSorter;
    this._setting = setting;
    this._book = null;
    this._promise = null;
    this._progress = Progress.create();
    super();
  }

  initialize() {
    this.listenTo(this._setting.screenSetting(), 'change', () => {
      if (!this._book) { return; }
      this.update(this.currentPageNum(), this.readingDirection());
    });

    // this.listenTo(this._setting.unarchiverSetting(), 'change', () => {
    //   this.update(this.currentPageNum(), this.readingDirection());
    // });
    // this.listenTo(this._setting.sortSetting(), 'change', () => {
    //   this.update(this.currentPageNum(), this.readingDirection());
    // });
  }

  // properties
  //// defaults
  defaults() {
    return {
      status: Reader.Status.Closed,
      currentPageNum: 0,
      totalPageNum: 0,
      readingDirection: Screen.ReadingDirection.Forward,
      message: '',
    };
  }
  //// getter
  title(): string { return this._book !== null ? this._book.title() : ''; }
  status(): Reader.Status { return <Reader.Status>this.get('status'); }
  message(): string { return <string>this.get('message'); }
  currentPageNum(): number { return <number>this.get('currentPageNum'); }
  totalPageNum(): number { return <number>this.get('totalPageNum'); }
  readingDirection(): Screen.ReadingDirection {
    return <Screen.ReadingDirection>this.get('readingDirection');
  }
  //// setter
  setStatus(status: Reader.Status) { this.set('status', status); }
  setMessage(message: string) { this.set('message', message); }
  setCurrentPageNum(currentPageNum: number) { this.set('currentPageNum', currentPageNum); }
  setTotalPageNum(totalPageNum: number) { this.set('totalPageNum', totalPageNum); }
  setReadingDirection(readingDirection: Screen.ReadingDirection) {
    this.set('readingDirection', readingDirection);
  }

  progress(): Progress.Progress { return this._progress; }

  // open/close;
  openFile(file: File): Promise<Screens.Screens> {
    var url: string = (<any>window).URL.createObjectURL(file);
    return this.openURL(url, {
      name: file.name,
      mimeType: file.type,
    });
  }

  openURL(url: string, options?: Reader.Options): Promise<Screens.Screens> {
    this.close();
    this.setStatus(Reader.Status.Opening);
    this._progress.update({
      message: 'Downloading ...',
      progress: 0,
      done: false,
    });

    this._promise = this._bookFactory.createFromURL(url, options).then((book: Book.Book) => {
      this._progress.update({ progress: 100 });
      this._book = this._pageSorter.sort(book, this._setting.sortSetting());
      this.resetReadingInfo();
      this.setStatus(Reader.Status.Opened);
      this.goToPage(this.currentPageNum());
      return this._screens;
    }).progressed((progression: Progress.Progression) => {
      this._progress.update(progression);
    }).catch((reason: any) => {
      if (reason.name === 'CancellationError') {
        this.setStatus(Reader.Status.Closed);
      } else {
        this.setMessage(reason.message || reason);
        this.setStatus(Reader.Status.Error);
      }
      return Promise.rejected(reason);
    });

    return this._promise.uncancellable();
  }

  close(): void {
    this._book = null;
    if (this._promise !== null) {
      this._promise.cancel();
    }
    this.setStatus(Reader.Status.Closed);
  }

  // move
  goNextScreen(): void {
    if (this.status() !== Reader.Status.Opened) { return; }
    var newPageNum = this.currentPageNum() + 1;
    if (this.readingDirection() === Screen.ReadingDirection.Forward) {
      var displayedPageNum = this._screens.currentScreen().pages().length;
      newPageNum = this.currentPageNum() + Math.max(1, displayedPageNum);
    }
    if (!this.isValidPageNum(newPageNum)) {
      return;
    }
    this.update(newPageNum, Screen.ReadingDirection.Forward);
  }

  goPrevScreen(): void {
    if (this.status() !== Reader.Status.Opened) { return; }
    var newPageNum = this.currentPageNum() - 1;
    if (this.readingDirection() === Screen.ReadingDirection.Backward) {
      var displayedPageNum = this._screens.currentScreen().pages().length;
      newPageNum = this.currentPageNum() - Math.max(1, displayedPageNum);
    }
    if (!this.isValidPageNum(newPageNum)) {
      return;
    }
    this.update(newPageNum, Screen.ReadingDirection.Backward);
  }

  goToPage(pageNum: number): void {
    if (this.status() !== Reader.Status.Opened) { return; }
    var pages = this._book.pages();
    if (!this.isValidPageNum(pageNum)) {
      return;
    }
    this.update(pageNum, Screen.ReadingDirection.Forward);
  }

  // other
  screens(): Screens.Screens { return this._screens; }
  resize(width: number, height: number): void {
    if (this.status() !== Reader.Status.Opened) { return; }
    this._screens.resize(width, height);
  }

  // private
  private update(pageNum: number, direction: Screen.ReadingDirection) {
    this._screens.update(this._book.pages(), {
      currentPageNum: pageNum,
      readingDirection: direction,
    }).catch(Promise.CancellationError, (error: any) => {
      // pass
    });
    this.setCurrentPageNum(pageNum);
    this.setReadingDirection(direction);
  }

  private isValidPageNum(pageNum: number): boolean {
    var pages = this._book.pages();
    return 0 <= pageNum && pageNum < pages.length;
  }

  private resetReadingInfo(): void {
    this.setCurrentPageNum(0);
    this.setTotalPageNum(this._book.pages().length);
    this.setReadingDirection(Screen.ReadingDirection.Forward);
  }
}
