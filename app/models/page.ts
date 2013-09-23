import $ = require('jquery');
import _ = require('underscore');
import Backbone = require('backbone');
import PDFJS = require('pdfjs');
import sprintf = require('sprintf');
import Setting = require('models/setting');
import logger = require('utils/logger');

export = Page;

module Page {
  // public
  export module Content {
    export interface Element extends HTMLElement {
      width: number;
      height: number;
    }
    export interface ModelInterface {
      element(): Element;
    }
    export interface CollectionInterface {
      length: number;
      at(index: number): ModelInterface;
      reset(models: ModelInterface[]): CollectionInterface;
    }
    export function createModel(element: Element): ModelInterface {
      return new Model({element: element});
    }
    export function createCollection(): CollectionInterface {
      return new Collection();
    }

    interface Attributes { element?: Element; }
    class Model extends Backbone.Model<Attributes> implements ModelInterface {
      constructor(attributes?: Attributes, options?: any) { super(attributes, options); }
      element() { return <Element>this.get('element'); }
    }
    class Collection extends
    Backbone.Collection<Model, Attributes> implements CollectionInterface {
      constructor() {
        this.model = Model;
        super();
      }
    }
  }

  export interface ModelInterface {
    name(): string;
    originalPageNum(): number;
  }
  export interface CollectionInterface {
    length: number;
    at(index: number): ModelInterface;
    getPageContent(pageNum: number): JQueryPromise<Content.ModelInterface>;
  }
  export interface Attributes {
    name?: string;
    originalPageNum?: number;
  }
  export function createPdfPageCollection(setting: Setting.ModelInterface,
                                          document: PDFJS.PDFDocumentProxy)
  : CollectionInterface {
    return new PdfPageCollection(setting, document);
  }

  // private
  class PdfPageModel extends Backbone.Model<Attributes> implements ModelInterface {
    defaults() {
      return {name: 'no page title', originalPageNum: 0};
    }
    constructor(attributes?: Attributes, options?: any) { super(attributes, options); }
    name(): string { return <string>this.get('name'); }
    originalPageNum(): number { return <number>this.get('originalPageNum'); }
  }

  class PdfPageCollection extends
  Backbone.Collection<PdfPageModel, Attributes> implements CollectionInterface {
    private _setting: Setting.ModelInterface;
    private _document: PDFJS.PDFDocumentProxy;

    constructor(setting: Setting.ModelInterface, document: PDFJS.PDFDocumentProxy) {
      this._setting = setting;
      this._document = document;
      this.model = PdfPageModel;
      // cunstruct a format string for sprintf function
      var numOfDigits = 1 + Math.floor(Math.log(this._document.numPages) / Math.log(10));
      var pageNameformat = sprintf('pdf-page-%%0%dd', numOfDigits);
      // create models
      var models = _.map(_.range(this._document.numPages), (num): PdfPageModel => {
        return new PdfPageModel({
          name: sprintf(pageNameformat, num + 1),
          originalPageNum: num + 1
        });
      });
      super(models);
    }

    getPageContent(pageNum: number): JQueryPromise<Content.ModelInterface> {
      logger.info('PdfPageCollection.getPageElement: pageNum = ' + pageNum);
      var deferred = $.Deferred<Content.ModelInterface>();

      var pageModel = this.at(pageNum - 1);
      if (_.isUndefined(pageModel)) {
        logger.info('rejected: wrong page number');
        deferred.reject();
        return deferred.promise();
      }

      // set timeout
      var timeout = 20 * 1000;
      setTimeout(() => { deferred.reject(); }, timeout);

      // create promise of getting page
      var originalPageNum = pageModel.get('originalPageNum');
      var pagePromise = this._document.getPage(originalPageNum);
      var page: PDFJS.PDFPageProxy;
      var canvas = document.createElement('canvas');

      // rendering function
      var renderPage = (scale: number) => {
        return (_page: PDFJS.PDFPageProxy) => {
          logger.info('render PDFPage to canvas, scale = ' + scale);
          page = _page;
          var viewport = page.getViewport(scale);
          var context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          var renderContext = { canvasContext: context, viewport: viewport, };
          return page.render(renderContext);
        }
      }

      if (this._setting.displaysOnlyImageInPdf()) {
        // scale === 0.0 because we don't use the canvas result
        // want to use page.objs
        pagePromise.then(renderPage(0.0)).then(() => {
          // resolve with a Data URL of the ImageObject
          _.each(_.keys(page.objs.objs), (key: string) => {
            // find objects whoose name starts with 'img_'
            if (key.indexOf('img_') === 0) {
              logger.info('image data found in the PDF page object');
              var data: HTMLImageElement = page.objs.getData(key);
              if (!_.isNull(data)) {
                deferred.resolve(Content.createModel(data));
                return;
              }
            }
          });
          if (deferred.state() === 'pending') {
            logger.info('image data not found: reject');
            deferred.reject();
          }
        });
      } else {
        pagePromise.then(renderPage(this._setting.canvasScale())).then(() => {
          logger.info('creating image element from dataURL');
          var dataURL: string = canvas.toDataURL();
          var image = new Image();
          image.onload = () => {
            logger.info('image is loaded');
            deferred.resolve(Content.createModel(image));
          };
          image.onerror = () => {
            logger.info('error occurs in loading image: reject');
            deferred.reject();
          };
          image.src = dataURL;
        });
      }

      return deferred.promise();
    }
  }

  // // private
  // class ImageCacheModel extends Backbone.Model<Attributes> implements ModelInterface {
  //   defaults() {
  //     return {
  //       name: 'no page title',
  //       originalPageNum: 0,
  //       dataURL: '',
  //     };
  //   }
  //   constructor(attributes?: Attributes, options?: any) { super(attributes, options); }
  //   get(attributeName: string): any;
  //   get(attributeName: 'name'): string;
  //   get(attributeName: 'originalPageNum'): number;
  //   get(attributeName: 'dataURL'): string;
  //   get(attributeName: string): any { return super.get(attributeName); }

  //   name(): string { return this.get('name'); }
  //   originalPageNum(): number { return this.get('originalPageNum'); }
  //   dataURL(): string { return this.get('dataURL'); }
  // }

  // class ImageCacheCollection extends
  // Backbone.Collection<ImageCacheModel, Attributes> implements CollectionInterface {
  //   private _pages: CollectionInterface;
  //   private _maxCacheSize: number;
  //   private _maxPrefetchSize: number;
  //   private _lastRequiredPage: number;

  //   private _deferred: JQueryDeferred<string>;
  //   private _loadingPageNum: number;

  //   constructor(pages: CollectionInterface) {
  //     this.model = ImageCacheModel;
  //     this._pages = pages;
  //     this._maxCacheSize = 20;
  //     this._maxPrefetchSize = 12;
  //     this._deferred = null;
  //     this._lastRequiredPage = 1;
  //     super();
  //   }

  //   private addImageCache(cache: ImageCacheModel): void {
  //     console.log('addImageCache:', this.models);
  //     var oldCache = this.findWhere({originalPageNum: cache.originalPageNum()});
  //     if (!_.isUndefined(oldCache)) {
  //       console.log('old cache found: remove');
  //       this.remove(oldCache);
  //     }
  //     // adds cache to front
  //     this.unshift(cache);
  //     while (this.length > this._maxCacheSize) {
  //       this.pop();
  //     }
  //     console.log('cache update done:', this.models);
  //   }

  //   private prefetch(): void {
  //     // [_lastRequiredPage, _lastRequiredPage + _maxPrefetchSize)
  //     // の区間を前から見ていく
  //     console.log('!!!prefetch function called');
  //     if (this._deferred.state() === 'pending') {
  //       console.log('!!! this._deferred is pending');
  //       return;
  //     }
  //     for (var p = this._lastRequiredPage;
  //          p < this._lastRequiredPage + this._maxPrefetchSize; ++p) {
  //       console.log('!!! page =', p);
  //       var page = this._pages.at(p - 1);
  //       if (_.isUndefined(page)) { continue; }
  //       var originalPageNum = page.originalPageNum();
  //       var cache = this.findWhere({originalPageNum: originalPageNum});
  //       if (!_.isUndefined(cache)) {
  //         console.log('!!! page ', p, ' is already cached');
  //         continue;
  //       }

  //       console.log('!!! load page ', p);
  //       this._loadingPageNum = originalPageNum;
  //       this._deferred = $.Deferred<string>();
  //       this._pages.getPageImageDataURL(p).then((dataURL: string) => {
  //       console.log('!!! prefetch _pages.getPageCanvas succeeds');
  //         this.addImageCache(new ImageCacheModel({
  //           originalPageNum: originalPageNum,
  //           dataURL: dataURL,
  //         }));
  //         this._deferred.resolve(dataURL);
  //         this.prefetch();
  //       });
  //       break;
  //     }
  //   }

  //   getPageImageDataURL(pageNum: number): JQueryPromise<string> {
  //     this._lastRequiredPage = pageNum;
  //     var page = this._pages.at(pageNum - 1);
  //     if (_.isUndefined(page)) {
  //       return $.Deferred<string>().reject().promise();
  //     }
  //     var originalPageNum = page.originalPageNum();
  //     console.log(sprintf('getPageCanvas: originalPageNum = %d, pageNum = %d', originalPageNum, pageNum));

  //     var cache = this.findWhere({originalPageNum: originalPageNum});
  //     if (!_.isUndefined(cache)) {
  //       console.log('cache exists');
  //       this.prefetch();
  //       return $.Deferred<string>().resolve(cache.dataURL()).promise();
  //     }

  //     if (!_.isNull(this._deferred)) {
  //       console.log('find current deferred');
  //       if (this._loadingPageNum === originalPageNum) {
  //         console.log('current deferred is loading the objective page');
  //         return this._deferred.promise();
  //       } else if (this._deferred.state() === 'pending') {
  //         console.log('current deferred is loading the another page (pending), reject');
  //         this._deferred.reject();
  //       }
  //     }

  //     this._loadingPageNum = originalPageNum;
  //     this._deferred = $.Deferred<string>();
  //     this._pages.getPageImageDataURL(pageNum).then((dataURL: string) => {
  //       console.log('_pages.getPageCanvas succeeds');
  //       this.addImageCache(new ImageCacheModel({
  //         originalPageNum: originalPageNum,
  //         dataURL: dataURL,
  //       }));
  //       this._deferred.resolve(dataURL);
  //       this.prefetch();
  //     });
  //     return this._deferred.promise();
  //   }
  // }
}

