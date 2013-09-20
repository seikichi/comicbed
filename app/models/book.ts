import $ = require('jquery');
import Backbone = require('backbone');
import PDFJS = require('pdfjs');

import Page = require('models/page');
import logger = require('utils/logger');

var HTMLImage = Image;

module Book {
  // public
  export interface Attributes {
    currentPageNum?: number;
    totalPageNum?: number;
    filename?: string;
    isOpen?: boolean;
  }
  export interface ModelInterface {
    // getter
    currentPageNum(): number;
    totalPageNum(): number;
    filename(): string;
    isOpen(): boolean;
    // methods
    toJSON(): Attributes;
    getPageImage(pageNum: number): Image.ModelInterface;

    close(): void;
    openFile(file: File): void;
    // // TODO(seikichi): implements
    // openFile() {}
    // openURL() {}
    // goTo(pageNum: number) {}
    // toPrevPage() {}
    // goNextPage() {}

    on(eventName: string, callback?: (...args: any[]) => void , context?: any): any;
  }
  export function create(): ModelInterface {
    return new BookModel();
  }

  export module Image {
    // public
    export enum Status { success, error, loading, }
    export interface Attributes {
      status?: Status;
      dataURL?: string;
      width?: number;
      height?: number;
    }
    export interface ModelInterface {
      // getter
      status(): Status;
      dataURL(): string;
      width(): number;
      height(): number;
      // methods
      toJSON(): Attributes;

      on(eventName: string, callback?: (...args: any[]) => void , context?: any): any;
    }
  }

  // private
  class ImageModel extends Backbone.Model<Image.Attributes> implements Image.ModelInterface {
    defaults() {
      return {
        status: Image.Status.loading,
        dataURL: '',
        width: 0,
        height: 0,
      };
    }
    constructor() { super(); }
    status() { return <Image.Status>this.get('status'); }
    dataURL() { return <string>this.get('dataURL'); }
    width() { return <number>this.get('width'); }
    height() { return <number>this.get('height'); }
  }

  class BookModel extends Backbone.Model<Attributes> implements ModelInterface {

    private pages: Page.CollectionInterface;

    defaults() {
      return {
        isOpen: false,
        currentPageNum: 1,
        totalPageNum: 1,
        filename: 'no title',
      };
    }

    constructor() {
      // Note: (this.pages === null) <=> !this.get('isOpen')
      this.pages = null;
      super();
    }

    openFile(file: File): void {
      // TODO(seikichi): openFile を短時間に連打したら面倒なことになりそうなのどうにかする
      if (file.type === 'application/pdf') {
        var fileReader = new FileReader();
        fileReader.onload = (event: any) => {
          console.log(event);
          var buffer: ArrayBuffer = event.target.result;
          var uint8Array = new Uint8Array(buffer);

          PDFJS.getDocument({data: uint8Array}).then((document: PDFJS.PDFDocumentProxy) => {
            this.pages = Page.createPdfPageCollection(document);
            // TODO(seikichi): そのうち currentPage を保存 (localStorage?) or 外部指定できるようにする
            this.set({
              isOpen: true,
              currentPageNum: 1,
              totalPageNum: document.numPages,
              filename: file.name,
            });
            console.log('Yay:', document.numPages);
          });
        };
        fileReader.readAsArrayBuffer(file);
      } else {
        logger.warn('At present, this viewer can only read pdf files');
      }
    }

    close(): void {
      this.set({isOpen: false});
      this.pages = null;
    }

    isOpen() { return <boolean>this.get('isOpen'); }
    currentPageNum() { return <number>this.get('currentPageNum'); }
    totalPageNum() { return <number>this.get('totalPageNum'); }
    filename() { return <string>this.get('filename'); }

    getPageImage(pageNum: number): Image.ModelInterface  {
      var image = new ImageModel();
      if (!this.isOpen()) {
        image.set({status: Image.Status.error})
        return image;
      }
      this.pages.getPageImageDataURL(pageNum).then((dataURL: string) => {
        var deferred = $.Deferred();
        var imageElement = new HTMLImage();
        imageElement.onload = () => {
          image.set({
            dataURL: dataURL,
            width: imageElement.width,
            height: imageElement.height,
            status: Image.Status.success,
          });
          deferred.resolve();
        };
        imageElement.onerror = () => {
          deferred.reject();
        }
        imageElement.src = dataURL;
        return deferred.promise();
      }).fail(() => {
        image.set({status: Image.Status.error});
      });
      return image;
    }
  }
}

export = Book;
