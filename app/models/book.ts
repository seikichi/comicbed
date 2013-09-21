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
  export enum Status {
    Opened,
    Opening,
    Closed,
    Error,
  }
  export interface Attributes {
    currentPageNum?: number;
    totalPageNum?: number;
    filename?: string;
    status?: Status;
  }

  export interface ModelInterface {
    // getter
    currentPageNum(): number;
    totalPageNum(): number;
    filename(): string;
    status(): Status;
    // methods
    toJSON(): Attributes;
    getCurrentContents(): DisplayedContents.ModelInterface;

    close(): void;
    openFile(file: File): void;
    openURL(url: string): void;

    goTo(pageNum: number): void;
    goPrevPage(): void;
    goNextPage(): void;

    on(eventName: string, callback?: () => void): void;
  }
  export function create(setting: Setting.ModelInterface): ModelInterface {
    return new BookModel(setting);
  }

  export module Image {
    export interface Attributes {
      dataURL?: string;
      width?: number;
      height?: number;
    }
    export interface ModelInterface {
      // getter
      dataURL(): string;
      width(): number;
      height(): number;

      toJSON(): Attributes;
    }
    export interface CollectionInterface {
      length: number;
      at(index: number): ModelInterface
      toJSON(): Attributes[];
    }
  }

  export module DisplayedContents {
    export enum Status { Loaded, Loading, Error, }
    export interface Attributes {
      status?: Status;
      images?: Image.CollectionInterface;
    }
    export interface ModelInterface {
      status(): Status;
      toJSON(): {[attribute:string]:any;};
    }
  }

  // private
  class ImageModel extends Backbone.Model<Image.Attributes> implements Image.ModelInterface {
    defaults() {
      return {
        dataURL: '',
        width: 0,
        height: 0,
      };
    }
    constructor(attributes?: Image.Attributes, options?: any) {
      super(attributes, options);
    }
    dataURL() { return <string>this.get('dataURL'); }
    width() { return <number>this.get('width'); }
    height() { return <number>this.get('height'); }
  }

  class ImageCollection extends Backbone.Collection<ImageModel, Image.Attributes> implements Image.CollectionInterface {
    constructor() {
      this.model = ImageModel;
      super();
    }
  }

  class ContentsModel extends Backbone.Model<DisplayedContents.Attributes> implements DisplayedContents.ModelInterface {
    images: ImageCollection;
    defaults() {
      return {status: DisplayedContents.Status.Loading};
    }
    constructor(attributes?: DisplayedContents.Attributes, options?: any) {
      this.images = new ImageCollection();
      super(attributes, options);
    }
    toJSON() {
      return _.extend(super.toJSON(), {
        images: this.images.toJSON()
      });
    }
    status() { return <DisplayedContents.Status>this.get('status'); }
  }

  class BookModel extends Backbone.Model<Attributes> implements ModelInterface {
    private setting: Setting.ModelInterface;
    private pages: Page.CollectionInterface;

    defaults(): Attributes {
      return {
        currentPageNum: 1,
        totalPageNum: 1,
        filename: 'no title',
        status: Status.Closed,
      };
    }

    constructor(setting: Setting.ModelInterface) {
      // Note: (this.pages === null) <=> !this.get('isOpen')
      this.setting = setting;
      this.pages = null;
      super();
    }

    openURL(url: string) : void {
      if (this.status() !== Status.Closed) {
        this.close();
      }
      if (path.extname(url) === 'pdf') {
        this.set({status: Status.Opening});
        PDFJS.getDocument({url: url}).then((document: PDFJS.PDFDocumentProxy) => {
          this.pages = Page.createPdfPageCollection(document);
          this.set({
            currentPageNum: this.setting.page(),
            totalPageNum: document.numPages,
            filename: path.basename(url),
            status: Status.Opened,
          });
        });
      } else {
        logger.warn('At present, this viewer can only read pdf files');
      }
    }

    openFile(file: File): void {
      // TODO(seikichi): openFile を短時間に連打したら面倒なことになりそうなのどうにかする
      if (this.status() !== Status.Closed) {
        this.close();
      }
      this.set({status: Status.Opening});
      if (file.type === 'application/pdf') {
        var fileReader = new FileReader();
        fileReader.onload = (event: any) => {
          var buffer: ArrayBuffer = event.target.result;
          var uint8Array = new Uint8Array(buffer);

          PDFJS.getDocument({data: uint8Array}).then((document: PDFJS.PDFDocumentProxy) => {
            this.pages = Page.createPdfPageCollection(document);
            this.set({
              isOpen: true,
              currentPageNum: 1,
              totalPageNum: document.numPages,
              filename: file.name,
            });
          });
        };
        fileReader.readAsArrayBuffer(file);
      } else {
        logger.warn('At present, this viewer can only read pdf files');
      }
    }

    goTo(pageNum: number): void {
      if (pageNum <= 0 || this.totalPageNum() < pageNum) { return; }
      this.set({currentPageNum: pageNum});
    }

    goPrevPage(): void {
      var newPageNum = this.currentPageNum() - 1;
      if (newPageNum <= 0 || this.totalPageNum() < newPageNum) { return; }
      this.set({currentPageNum: newPageNum});
    }

    goNextPage(): void {
      var newPageNum = this.currentPageNum() + 1;
      if (newPageNum <= 0 || this.totalPageNum() < newPageNum) { return; }
      this.set({currentPageNum: newPageNum});
    }

    close(): void {
      this.set({status: Status.Closed});
      this.pages = null;
    }

    currentPageNum() { return <number>this.get('currentPageNum'); }
    totalPageNum() { return <number>this.get('totalPageNum'); }
    filename() { return <string>this.get('filename'); }
    status() { return <Status>this.get('status'); }

    getCurrentContents(): DisplayedContents.ModelInterface {
      // Note: 処理の流れ
      // - ContentsModel を new して return
      // - 1ページ取得 (deferred)
      // - setting.displayMode に応じて頑張る (おいおい)
      var succeed = false;
      var contents = new ContentsModel();
      if (this.status() !== Status.Opened) {
        contents.set({status: DisplayedContents.Status.Error});
        return contents;
      }
      this.pages.getPageImageDataURL(this.currentPageNum()).then((dataURL: string) => {
        return this.calculateImageSize(dataURL);
      }).then((image: ImageModel) => {
        contents.images.push(image);

        var currentPageNum = this.currentPageNum();
        if (this.setting.viewMode() === Setting.ViewMode.OnePage
            || (currentPageNum + 1 > this.totalPageNum())) {
          succeed = true;
          contents.set({status: DisplayedContents.Status.Loaded});
          return $.Deferred().reject().promise();
        } else {
          return this.pages.getPageImageDataURL(currentPageNum + 1);
        }
      }).then((dataURL: string) => {
        return this.calculateImageSize(dataURL);
      }).then((image: ImageModel) => {
        succeed = true;
        if (this.setting.viewMode() === Setting.ViewMode.AutoSpread
            && image.width > image.height) {  // TODO(seikichi)
          contents.set({status: DisplayedContents.Status.Loaded});
        } else {
          contents.images.push(image);
          contents.set({status: DisplayedContents.Status.Loaded});
        }
      }).fail(() => {
        if (!succeed) {
          console.log('Error~~~~~~');
          contents.set({status: DisplayedContents.Status.Error});
        }
      });
      return contents;
    }

    private calculateImageSize(dataURL: string): JQueryPromise<ImageModel> {
      var deferred = $.Deferred<ImageModel>();
      var imageElement = new HTMLImage();
      imageElement.onload = () => {
        deferred.resolve(new ImageModel({
          dataURL: dataURL,
          width: imageElement.width,
          height: imageElement.height
        }));
      };
      imageElement.onerror = () => {
        deferred.reject();
      }
      imageElement.src = dataURL;
      return deferred.promise();
    }

    // getPageImage(pageNum: number): Image.ModelInterface  {
    //   var image = new ImageModel();
    //   if (this.status() !== Status.Opened) {
    //     image.set({status: Image.Status.error})
    //     return image;
    //   }
    //   this.pages.getPageImageDataURL(pageNum).then((dataURL: string) => {
    //     var deferred = $.Deferred();
    //     var imageElement = new HTMLImage();
    //     imageElement.onload = () => {
    //       image.set({
    //         dataURL: dataURL,
    //         width: imageElement.width,
    //         height: imageElement.height,
    //         status: Image.Status.success,
    //       });
    //       deferred.resolve();
    //     };
    //     imageElement.onerror = () => {
    //       deferred.reject();
    //     }
    //     imageElement.src = dataURL;
    //     return deferred.promise();
    //   }).fail(() => {
    //     image.set({status: Image.Status.error});
    //   });
    //   return image;
    // }
  }
}


