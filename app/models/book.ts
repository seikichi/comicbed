import $ = require('jquery');
import Backbone = require('backbone');
import PDFJS = require('pdfjs');

import Setting = require('models/setting');
import Page = require('models/page');
import logger = require('utils/logger');
import path = require('utils/path');

export = Book;

var HTMLImage = Image;

module Book {
  // public
  export enum Status { Closed, Opened, Opening, Error, }
  export enum ReadingDirection { Forward = +1, Backward = -1 }
  export interface Attributes {
    currentPageNum?: number;
    totalPageNum?: number;
    filename?: string;
    status?: Status;
    currentReadingDirection?: number;
    readingDirection?: ReadingDirection;
  }

  export interface ModelInterface {
    // getter
    currentPageNum(): number;
    totalPageNum(): number;
    filename(): string;
    status(): Status;
    readingDirection(): ReadingDirection;

    setting(): Setting.ModelInterface;
    toJSON(): Attributes;

    // methods
    resize(width: number, height: number): void;
    contents(): Page.Content.CollectionInterface;
    close(): void;
    openURL(url: string) : void;
    openFile(file: File) : void;

    // navigate
    goTo(pageNum: number): void;
    goPrevPage(): void;
    goNextPage(): void;

    // events
    on(eventName: string, callback?: () => void, context?: any): void;
    // once(eventName: string, callback?: () => void, context?: any): void;
  }

  // export function createFromURL(ur: string): ModelInterface {
  //   return undefined;
  // }

  export function create(setting: Setting.ModelInterface): ModelInterface {
    return new BookModel(setting);
  }

  class BookModel extends Backbone.Model<Attributes> implements ModelInterface {
    // properties
    defaults(): Attributes {
      return {
        currentPageNum: 1,
        totalPageNum: 1,
        filename: 'no title',
        status: Status.Closed,
        readingDirection: ReadingDirection.Forward,
      };
    }
    currentPageNum() { return <number>this.get('currentPageNum'); }
    totalPageNum() { return <number>this.get('totalPageNum'); }
    filename() { return <string>this.get('filename'); }
    status() { return <Status>this.get('status'); }
    readingDirection() { return <ReadingDirection>this.get('readingDirection'); }
    setting() { return this._setting; }
    contents() { return this._contents; }
    // private members
    private _setting: Setting.ModelInterface;
    private _pages: Page.CollectionInterface;
    private _contents: Page.Content.CollectionInterface;


    constructor(setting: Setting.ModelInterface) {
      this._setting = setting;
      this._pages = null;
      this._contents = Page.Content.createCollection();
      super();
    }

    initialize() {
      // fxxk code: TODO(seikichi): refactor
      (<any>this).listenTo(this._setting, 'change:canvasScale change:displaysOnlyImageInPdf', () => {
        this._pages.clearCache();
      });
      (<any>this).listenTo(this._setting, 'change', () => {
        this.updateContents();
      });
    }

    openURL(url: string) : void {
      logger.info('Book.openURL: ' + url);
      if (this.status() !== Status.Closed) {
        this.close();
      }
      if (path.extname(url) === 'pdf') {
        this.set({status: Status.Opening});
        PDFJS.getDocument({url: url}).then((document: PDFJS.PDFDocumentProxy) => {
          logger.info('PDFDocument is loaded');
          this._pages = Page.createPdfPageCollection(this._setting, document);
          this.set({
            currentPageNum: this._setting.page(),
            totalPageNum: document.numPages,
            filename: path.basename(url),
            status: Status.Opened,
          });
          this.updateContents();
        });
      } else {
        logger.warn('At present, this viewer can only read pdf files');
      }
    }

    openFile(file: File): void {
      logger.info('Book.openFile');
      if (this.status() !== Status.Closed) {
        this.close();
      }
      this.set({status: Status.Opening});
      if (file.type === 'application/pdf') {
        var fileReader = new FileReader();
        fileReader.onload = (event: any) => {
          logger.info('file is loaded: ' + file.name);
          var buffer: ArrayBuffer = event.target.result;
          var uint8Array = new Uint8Array(buffer);

          PDFJS.getDocument({data: uint8Array}).then((document: PDFJS.PDFDocumentProxy) => {
            logger.info('PDFDocument is loaded');
            this._pages = Page.createPdfPageCollection(this._setting, document);
            this.set({
              currentPageNum: 1,
              totalPageNum: document.numPages,
              filename: file.name,
              status: Status.Opened,
            });
            this.updateContents();
          });
        };
        fileReader.readAsArrayBuffer(file);
      } else {
        logger.warn('At present, this viewer can only read pdf files');
      }
    }

    resize(width: number, height: number): void {}

    goTo(pageNum: number): void {
      logger.info('goTo ' + pageNum);
      if (pageNum === this.currentPageNum()) { return; }
      if (pageNum <= 0 || this.totalPageNum() < pageNum) { return; }
      this.set({
        currentPageNum: pageNum,
        readingDirection: this.readingDirection(),
      });
      this.updateContents();
    }

    goPrevPage(): void {
      var diff = 1;
      if (this.readingDirection() === ReadingDirection.Backward
          && this._setting.viewMode() === Setting.ViewMode.TwoPage
          && this._contents.length === 2) { diff = 2; }
      if (this.currentPageNum() - diff <= 0) { return; }
      var newPageNum = Math.max(1, this.currentPageNum() - diff);
      if (this.currentPageNum() === newPageNum) { return; }
      logger.info('goPrevPage: ' + this.currentPageNum() + ' => ' + newPageNum);
      this.set({
        currentPageNum: newPageNum,
        readingDirection: ReadingDirection.Backward,
      });
      this.updateContents();
    }

    goNextPage(): void {
      var diff = 1;
      if (this.readingDirection() === ReadingDirection.Forward
          && this._setting.viewMode() === Setting.ViewMode.TwoPage
          && this._contents.length === 2) { diff = 2; }
      if (this.currentPageNum() + diff > this.totalPageNum()) { return; }
      var newPageNum = Math.min(this.currentPageNum() + diff, this.totalPageNum());
      if (this.currentPageNum() === newPageNum) { return; }
      logger.info('goNextPage: ' + this.currentPageNum() + ' => ' + newPageNum);
      this.set({
        currentPageNum: newPageNum,
        readingDirection: ReadingDirection.Forward,
      });
      this.updateContents();
    }

    close(): void {
      logger.info('closing the book');
      this.set({status: Status.Closed});
      this._pages = null;
    }

    private updateContents(): void {
      logger.info('updateContents is called');
      var success = false;
      var newContents: Page.Content.ModelInterface[] = [];
      if (this.status() !== Status.Opened) {
        logger.info('status is not equals to Opened');
        this._contents.reset(newContents);
        return;
      }
      var promise = this._pages.getPageContent(this.currentPageNum());
      promise.then((content: Page.Content.ModelInterface) => {
        logger.info('current page content is loaded');
        newContents.push(content);
        var nextPageNum = this.currentPageNum() + this.readingDirection();
        if (this._setting.viewMode() === Setting.ViewMode.OnePage
            || nextPageNum <= 0
            || nextPageNum > this.totalPageNum()
            || (this._setting.detectsSpreadPage()
                && content.element().width > content.element().height)) {
          success = true;
          this._contents.reset(newContents);
          return $.Deferred().reject().promise();
        } else {
          logger.info('getting next page content: page =' + nextPageNum);
          return this._pages.getPageContent(nextPageNum);
        }
      }).then((content: Page.Content.ModelInterface) => {
        logger.info('next page content is loaded');
        success = true;
        if (this._setting.detectsSpreadPage()
            && content.element().width > content.element().height) {
          logger.info('spread page is detected');
          this._contents.reset(newContents);
        } else {
          if (this.readingDirection() === ReadingDirection.Forward) {
            newContents.push(content);
          } else {
            newContents.unshift(content);
          }
          this._contents.reset(newContents);
        }
      }).fail(() => {
        if (success) { return; }
        logger.info('an error occured in updateContent');
        this._contents.reset([]);
      });
    }
  }
}


