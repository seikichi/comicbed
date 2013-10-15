import $ = require('jquery');
import Events = require('models/events');
import Screen = require('models/screen');
import Screens = require('collections/screens');
import Book = require('models/book');
import Task = require('models/task');
import Progress = require('models/progress');
import Setting = require('models/setting');
import Sort = require('models/sort');

export = Reader;

module Reader {
  export enum Status { Closed, Opening, Opened, Error }

  export interface Options extends Book.Options {}

  export interface Reader extends Events.Events {
    // open/close
    openURL(url: string, options?: Options): JQueryPromise<Reader>;
    close(): void;
    // properties
    status(): Status;
    currentPageNum(): number;
    totalPageNum(): number;
    readingDirection(): Screen.ReadingDirection;
    // move
    goNextScreen(): void;
    goPrevScreen(): void;
    goToPage(pageNum: number): void;
    // other
    screens(): Screens.Screens;
    resize(width: number, height: number): void;
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
  private _task: Task<Reader.Reader>;

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
    this._task = null;
    super();
  }

  initialize() {
    this.listenTo(this._setting.screenSetting(), 'change', () => {
      this.update(this.currentPageNum(), this.readingDirection());
    });
  }

  // properties
  //// defaults
  defaults() {
    return {
      status: Reader.Status.Closed,
      currentPageNum: 0,
      totalPageNum: 0,
      readingDirection: Screen.ReadingDirection.Forward,
    };
  }
  //// getter
  status(): Reader.Status { return <Reader.Status>this.get('status'); }
  currentPageNum(): number { return <number>this.get('currentPageNum'); }
  totalPageNum(): number { return <number>this.get('totalPageNum'); }
  readingDirection(): Screen.ReadingDirection {
    return <Screen.ReadingDirection>this.get('readingDirection');
  }
  //// setter
  setStatus(status: Reader.Status) { this.set('status', status); }
  setCurrentPageNum(currentPageNum: number) { this.set('currentPageNum', currentPageNum); }
  setTotalPageNum(totalPageNum: number) { this.set('totalPageNum', totalPageNum); }
  setReadingDirection(readingDirection: Screen.ReadingDirection) {
    this.set('readingDirection', readingDirection);
  }

  // open/close;
  openURL(url: string, options?: Reader.Options): Task<Reader.Reader> {
    this.close();
    this.setStatus(Reader.Status.Opening);
    var deferred = $.Deferred<Reader.Reader>();
    var task = this._task = new Task(deferred.promise());

    var innerTask = this._bookFactory.createFromURL(url, options);
    innerTask.progress((progress: Progress.Progress) => {
      deferred.notify(progress);
    }).then((book: Book.Book) => {
      return this._pageSorter.sort(book, this._setting.sortSetting());
    }).then((book: Book.Book) => {
      if (deferred.state() === 'rejected') { return; }
      this._book = book;
      this.resetReadingInfo();
      this.setStatus(Reader.Status.Opened);
      this.goToPage(this.currentPageNum());
      deferred.resolve(this);
    }).fail(() => {
      if (!task.canceled) {
        this.setStatus(Reader.Status.Error);
      } else {
        this.setStatus(Reader.Status.Closed);
      }
      deferred.reject();
    });

    task.oncancel = () => {
      innerTask.cancel();
      deferred.reject();
    };
    return task;
  }
  close(): void {
    this._book = null;
    if (this._task !== null) {
      this._task.cancel();
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
