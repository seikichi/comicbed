import $ = require('jquery');
import _ = require('underscore');
import Backbone = require('backbone');
import PDFJS = require('pdfjs');

module Page {
  // public
  export interface ModelInterface { }
  export interface CollectionInterface {
    getPageImageDataURL(pageNum: number): JQueryPromise<string>;
  }
  export interface Attributes {
    name?: string;
    originalPageNum?: number;
  }
  export function createPdfPageCollection(document: PDFJS.PDFDocumentProxy): CollectionInterface {
    return new PdfPageCollection(document);
  }

  // private
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
  }

  class PdfPageCollection extends Backbone.Collection<PdfPageModel, Attributes> implements CollectionInterface {
    private document: PDFJS.PDFDocumentProxy;

    constructor(document: PDFJS.PDFDocumentProxy) {
      this.document = document;
      this.model = PdfPageModel;
      var models = _.map(_.range(this.document.numPages), (num): PdfPageModel => {
        return new PdfPageModel({
          name: 'no page title', // TODO(seikichi): fix me!
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
        var scale = 1.0;
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
      // TODO (seikichi): fix me!
      //   .fail(() => {
      //   deferred.reject();
      // });
      return deferred.promise();
    }
  }
}

export = Page;
