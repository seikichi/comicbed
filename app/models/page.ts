import $ = require('jquery');
import _ = require('underscore');
import Backbone = require('backbone');
import PDFJS = require('pdfjs');
import sprintf = require('sprintf');

module Page {
  // public
  export interface ModelInterface {
    originalPageNum(): number;
  }
  export interface CollectionInterface {
    at(index: number): ModelInterface;
    getPageImageDataURL(pageNum: number): JQueryPromise<string>;
  }
  export interface Attributes {
    name?: string;
    originalPageNum?: number;
  }
  export function createPdfPageCollection(document: PDFJS.PDFDocumentProxy)
  : CollectionInterface {
    return new ImageCacheCollection(new PdfPageCollection(document));
  }

  // private
  class ImageCacheModel extends Backbone.Model<Attributes> implements ModelInterface {
    defaults() {
      return {
        name: 'no page title',
        originalPageNum: 0,
        dataURL: '',
      };
    }
    constructor(attributes?: Attributes, options?: any) { super(attributes, options); }
    get(attributeName: string): any;
    get(attributeName: 'name'): string;
    get(attributeName: 'originalPageNum'): number;
    get(attributeName: 'dataURL'): string;
    get(attributeName: string): any { return super.get(attributeName); }

    name(): string { return this.get('name'); }
    originalPageNum(): number { return this.get('originalPageNum'); }
    dataURL(): string { return this.get('dataURL'); }
  }

  class ImageCacheCollection extends
  Backbone.Collection<ImageCacheModel, Attributes> implements CollectionInterface {
    private _pages: CollectionInterface;
    private _maxCacheSize: number;

    private _deferred: JQueryDeferred<string>;
    private _loadingPageNum: number;

    constructor(pages: CollectionInterface) {
      this.model = ImageCacheModel;
      this._pages = pages;
      this._maxCacheSize = 20;
      this._deferred = null;
      super();
    }

    private addImageCache(cache: ImageCacheModel): void {
      console.log('addImageCache:', this.models);
      var oldCache = this.findWhere({originalPageNum: cache.originalPageNum()});
      if (!_.isUndefined(oldCache)) {
        console.log('old cache found: remove');
        this.remove(oldCache);
      }
      // adds cache to front
      this.unshift(cache);
      while (this.length > this._maxCacheSize) {
        this.pop();
      }
      console.log('cache update done:', this.models);
    }

    getPageImageDataURL(pageNum: number): JQueryPromise<string> {
      var page = this._pages.at(pageNum - 1);
      if (_.isUndefined(page)) {
        return $.Deferred<string>().reject().promise();
      }
      var originalPageNum = page.originalPageNum();
      console.log(sprintf('getPageCanvas: originalPageNum = %d, pageNum = %d', originalPageNum, pageNum));

      var cache = this.findWhere({originalPageNum: originalPageNum});
      if (!_.isUndefined(cache)) {
        console.log('cache exists');
        return $.Deferred<string>().resolve(cache.dataURL()).promise();
      }

      if (!_.isNull(this._deferred)) {
        console.log('find current deferred');
        if (this._loadingPageNum === originalPageNum) {
          console.log('current deferred is loading the objective page');
          return this._deferred.promise();
        } else if (this._deferred.state() === 'pending') {
          console.log('current deferred is loading the another page (pending), reject');
          this._deferred.reject();
        }
      }

      this._loadingPageNum = originalPageNum;
      this._deferred = $.Deferred<string>();
      this._pages.getPageImageDataURL(pageNum).then((dataURL: string) => {
        console.log('_pages.getPageCanvas succeeds');
        this.addImageCache(new ImageCacheModel({
          originalPageNum: originalPageNum,
          dataURL: dataURL,
        }));
        this._deferred.resolve(dataURL);
      });
      return this._deferred.promise();
    }
  }

  class PdfPageModel extends Backbone.Model<Attributes> implements ModelInterface {
    defaults() {
      return {
        name: 'no page title',
        originalPageNum: 0,
      };
    }
    constructor(attributes?: Attributes, options?: any) { super(attributes, options); }
    get(attributeName: string): any;
    get(attributeName: 'name'): string;
    get(attributeName: 'originalPageNum'): number;
    get(attributeName: string): any { return super.get(attributeName); }

    originalPageNum(): number { return this.get('originalPageNum'); }
  }

  class PdfPageCollection extends Backbone.Collection<PdfPageModel, Attributes> implements CollectionInterface {
    private document: PDFJS.PDFDocumentProxy;

    constructor(document: PDFJS.PDFDocumentProxy) {
      this.document = document;
      this.model = PdfPageModel;
      // cunstruct a format string for sprintf function
      var numOfDigits = 1 + Math.floor(Math.log(this.document.numPages) / Math.log(10));
      var pageNameformat = sprintf('page-%%0%dd', numOfDigits);
      // create models
      var models = _.map(_.range(this.document.numPages), (num): PdfPageModel => {
        return new PdfPageModel({
          name: sprintf(pageNameformat, num + 1),
          originalPageNum: num + 1
        });
      });
      super(models, {});
    }

    getPageImageDataURL(pageNum: number): JQueryPromise<string> {
      var deferred = $.Deferred<string>();
      var page = this.at(pageNum - 1);
      if (_.isUndefined(page)) {
        deferred.reject();
        return deferred;
      }
      var originalPageNum = page.get('originalPageNum');
      var canvas = document.createElement('canvas');

      this.document.getPage(originalPageNum).then((page: PDFJS.PDFPageProxy) => {
        // prepare canvas using PDF page dimensions
        var scale = 2.0;  // TODO(seikichi): fix me!
        var viewport = page.getViewport(scale);
        var context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        // render PDF page into canvas context
        var renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        return page.render(renderContext);
      }).then(() => {
        // resolve with a Data URL of the PDF page
        var dataURL: string = canvas.toDataURL();
        deferred.resolve(dataURL);
      });

      // set timeout
      var timeout = 20 * 1000;
      setTimeout(() => {
        deferred.reject();
      }, timeout);
      return deferred.promise();
    }
  }
}

export = Page;
