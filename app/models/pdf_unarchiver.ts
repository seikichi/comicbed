import Unarchiver = require('models/unarchiver');
import PDFJS = require('pdfjs');
import sprintf = require('sprintf');
import ImageUtil = require('utils/image');

// TODO(seikichi): move to unarchiver.setting
PDFJS.workerSrc = 'assets/app/pdfjs/js/pdf.worker.js';
PDFJS.disableWorker = false;
PDFJS.disableAutoFetch = true;
PDFJS.disableRange = false;

export = PdfUnarchiver;

class PdfUnarchiver implements Unarchiver.Unarchiver {

  static createFromURL(url: string, setting: Unarchiver.Setting)
  : JQueryPromise<Unarchiver.Unarchiver> {
    var deferred = $.Deferred<Unarchiver.Unarchiver>();
    PDFJS.getDocument({url: url}).then((doc: PDFJS.PDFDocumentProxy) => {
      deferred.resolve(new PdfUnarchiver(doc, setting));
    }, () => {
      deferred.reject();
    });
    return deferred.promise();
  }

  private _document: PDFJS.PDFDocumentProxy;
  private _setting: Unarchiver.Setting;

  private _archiveName: string;
  private _names: string[];
  private _nameToPageNum: {[name: string]: number;};

  private _renderTask: PDFJS.RenderTask;
  private _deferred: JQueryDeferred<Unarchiver.Content>;
  private _canvas: HTMLCanvasElement;

  constructor(pdfDocument: PDFJS.PDFDocumentProxy, setting: Unarchiver.Setting) {
    this._document = pdfDocument;
    this._setting = setting;
    this._archiveName = (<any>this._document).pdfInfo.info.Title;
    this._names = [];
    this._nameToPageNum = {};
    this._renderTask = null;
    this._deferred = null;
    this._canvas = document.createElement('canvas');

    var numOfDigits = 1 + Math.floor(Math.log(this._document.numPages) / Math.log(10));
    var pageNameformat = sprintf('pdf-page-%%0%dd', numOfDigits);
    for (var i = 0, len = this._document.numPages; i < len; ++i) {
      var pageName = sprintf(pageNameformat, i + 1);
      this._names.push(pageName);
      this._nameToPageNum[pageName] = i + 1;
    }
  }

  archiveName(): string {
    return this._archiveName;
  }

  filenames(): string[] {
    return this._names;
  }

  renderPage(page: PDFJS.PDFPageProxy, scale: number): PDFJS.Promise<PDFJS.PDFPageProxy> {
    var canvas = this._canvas;
    var viewport = page.getViewport(scale);
    var context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    var renderContext = { canvasContext: context, viewport: viewport, };
    if (this._renderTask !== null) {
      this._renderTask.cancel();
    }
    this._renderTask = page.render(renderContext);
    var promise = this._renderTask.then(() => {
      this._renderTask = null;
      return page;
    });
    return promise;
  }

  unpack(name: string): JQueryPromise<Unarchiver.Content> {
    // if the previous unpacking task exists, reject it
    if (this._deferred !== null && this._deferred.state() === 'pending') {
      this._deferred.reject();
    }
    var deferred = this._deferred = $.Deferred<Unarchiver.Content>();

    // reject if the page name is invalid
    var pageNum = this._nameToPageNum[name];
    if (pageNum <= 0 || this._document.numPages < pageNum) {
      deferred.reject();
      return this._deferred.promise();
    }

    var existsImageXObject = false;
    var promise = this._document.getPage(pageNum);

    if (this._setting.detectsImageXObjectPageInPdf()) {
      // if detectsImageXObjectPageInPdf is true,
      // first, render the page with size 0 (scale === 0), and find a XObject
      promise = promise.then((page: PDFJS.PDFPageProxy) => {
        if (deferred.state() === 'rejected') { return page; }
        return this.renderPage(page, 0);
      }).then((page: PDFJS.PDFPageProxy) => {
        if (deferred.state() === 'rejected') { return page; }
        // find XObject
        var objs = page.objs.objs;
        for (var key in objs) if (objs.hasOwnProperty(key)) {
          if (key.indexOf('img_') !== 0) { continue; }
          existsImageXObject = true;
          var data: any = page.objs.getData(key)
          if (!('data' in data)) {
            deferred.resolve(<HTMLElement>data);
          } else {
            ImageUtil.pixelDataToImageElement(data.data, data.width, data.height)
              .then((image: HTMLImageElement) => {
                deferred.resolve(image);
              }).fail(() => {
                deferred.reject();
              });
          }
          page.destroy();
          break;
        }
        return page;
      });
    }
    promise.then((page: PDFJS.PDFPageProxy) => {
      if (deferred.state() !== 'pending' || existsImageXObject) { return page; }
      return this.renderPage(page, this._setting.pdfjsCanvasScale());
    }).then((page: PDFJS.PDFPageProxy) => {
      page.destroy();
      if (deferred.state() !== 'pending' || existsImageXObject) { return page; }
      // do not mix the PDFJS.Promise and JQueryPromise
      ImageUtil.loadImageFromURL(this._canvas.toDataURL()).then((image: HTMLImageElement) => {
        deferred.resolve(image);
      }).fail(() => {
        deferred.reject();
      });
    });
    return deferred.promise();
  }
  close(): void {
    this._document.destroy();
  }
}
