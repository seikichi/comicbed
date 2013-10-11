import $ = require('jquery');
import Events = require('models/events');
import Screen = require('models/screen');
import Screens = require('collections/screens');
import Book = require('models/book');

export = Reader;

module Reader {
  export enum Status { Closed, Opening, Opened, Error }

  export interface Reader extends Events.Events {
    // open/close
    openFromURL(): JQueryPromise<Reader>;
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

  export function create(bookFactory: Book.Factory, screens: Screens.Screens): Reader {
    return new ReaderModel(bookFactory, screens);
  }
}

class ReaderModel extends Backbone.Model implements Reader.Reader {
  // immultable members
  private _bookFactory: Book.Factory;
  private _screens: Screens.Screens;
  // mutable members
  private _book: Book.Book;

  // ctor & initializer (TODO);
  constructor(bookFactory: Book.Factory, screens: Screens.Screens) {
    this._bookFactory = bookFactory;
    this._screens = screens;
    this._book = null;
    super();
  }

  initialize() { }

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
  setStatus(status: Screen.Status) { this.set('status', status); }
  setCurrentPageNum(currentPageNum: number) { this.set('currentPageNum', currentPageNum); }
  setTotalPageNum(totalPageNum: number) { this.set('totalPageNum', totalPageNum); }
  setReadingDirection(readingDirection: Screen.ReadingDirection) {
    this.set('readingDirection', readingDirection);
  }

  // open/close (TODO);
  openFromURL(): JQueryPromise<Reader.Reader> { return undefined; }
  close(): void { }

  // move (TODO);
  goNextScreen(): void {}
  goPrevScreen(): void {}
  goToPage(pageNum: number): void {}

  // other
  screens(): Screens.Screens { return this._screens; }
  resize(width: number, height: number): void { this._screens.resize(width, height); }
}