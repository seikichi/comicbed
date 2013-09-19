import $ = require('jquery');
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
  export function createPdfPageCollection(document: PDFJS.PDFDocument): CollectionInterface {
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
    get(attributeName: string): any;
    get(attributeName: 'name'): string;
    get(attributeName: 'originalPageNum'): number;
    get(attributeName: string): any { return super.get(attributeName); }
  }

  class PdfPageCollection extends Backbone.Collection<PdfPageModel, Attributes> implements CollectionInterface {
    private document: PDFJS.PDFDocument;

    constructor(document: PDFJS.PDFDocument) {
      this.document = document;
      this.model = PdfPageModel;
      super([], {});
    }

    getPageImageDataURL(pageNum: number): JQueryPromise<string> {
      var originalPageNum = this.at(pageNum).get('originalPageNum');
      var deferred = $.Deferred<string>();
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
      }).fail(() => {
        deferred.reject();
      });
      return deferred.promise();
    }
  }
}

export = Page;
