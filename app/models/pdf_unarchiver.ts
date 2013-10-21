import Unarchiver = require('models/unarchiver');
import PDFJS = require('pdfjs');
import sprintf = require('sprintf');
import ImageUtil = require('utils/image');
import Promise = require('promise');

// TODO(seikichi): move to unarchiver.setting
PDFJS.workerSrc = 'assets/app/pdfjs/js/pdf.worker.js';
PDFJS.disableWorker = false;
PDFJS.disableAutoFetch = true;
PDFJS.disableRange = false;

export = PdfUnarchiver;

class PdfUnarchiver implements Unarchiver.Unarchiver {

  static createFromURL(url: string, setting: Unarchiver.Setting, options: Unarchiver.Options)
  : Promise<Unarchiver.Unarchiver> {
    return Promise.cast<PDFJS.PDFDocumentProxy>(PDFJS.getDocument({
      url: url,
      httpHeaders: options.httpHeaders,
      bytes: options.bytes,
    })).then((doc: PDFJS.PDFDocumentProxy) => {
      return new PdfUnarchiver(doc, setting);
    });
  }

  private _document: PDFJS.PDFDocumentProxy;
  private _setting: Unarchiver.Setting;

  private _archiveName: string;
  private _names: string[];
  private _nameToPageNum: {[name: string]: number;};

  private _canvas: HTMLCanvasElement;
  private _previousUnpackPromise: Promise<Unarchiver.Content>;

  constructor(pdfDocument: PDFJS.PDFDocumentProxy, setting: Unarchiver.Setting) {
    this._document = pdfDocument;
    this._setting = setting;
    this._archiveName = (<any>this._document).pdfInfo.info.Title;
    this._names = [];
    this._nameToPageNum = {};
    this._canvas = document.createElement('canvas');
    this._previousUnpackPromise = Promise.fulfilled(null);

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

  renderPage(page: PDFJS.PDFPageProxy, scale: number): Promise<HTMLCanvasElement> {
    var canvas = this._canvas;
    var viewport = page.getViewport(scale);
    var context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    var renderContext = { canvasContext: context, viewport: viewport, };

    var renderTask = page.render(renderContext);
    return Promise.cast<void>(renderTask).then(() => {
      return canvas;
    }).catch(Promise.CancellationError, (reason: any) => {
      renderTask.cancel();
      return Promise.rejected(reason);
    });
  }

  getContent(page: PDFJS.PDFPageProxy): Promise<Unarchiver.Content> {
    return this.renderPage(page, this._setting.pdfjsCanvasScale())
      .then((canvas: HTMLCanvasElement) => ImageUtil.loadImageFromURL(canvas.toDataURL()));
  }

  getXObjectContent(page: PDFJS.PDFPageProxy): Promise<Unarchiver.Content> {
    var viewport = page.getViewport(1);
    var pageAspectRatio = viewport.width / viewport.height;
    // return this.renderPage(page, 0).then((canvas: HTMLCanvasElement) => {
    return Promise.cast<void>(page.loadXObject()).then(() => {
      var objs = page.objs.objs;
      for (var key in objs) if (objs.hasOwnProperty(key)) {
        if (key.indexOf('img_') !== 0) { continue; }
        var data: any = page.objs.getData(key)
        var imageAspectRatio = data.width / data.height;
        if (Math.abs(pageAspectRatio - imageAspectRatio) >= 1e-3) { continue; }

        page.destroy();
        if (!('data' in data)) {
          return Promise.fulfilled(<HTMLImageElement>data);
        } else {
          return ImageUtil.pixelDataToImageElement(data.data, data.width, data.height);
        }
      }
      return this.getContent(page);
    });
  }

  unpack(name: string): Promise<Unarchiver.Content> {
    this._previousUnpackPromise.cancel();

    // reject if the page name is invalid
    var pageNum = this._nameToPageNum[name];
    if (pageNum <= 0 || this._document.numPages < pageNum) {
      return Promise.rejected('invalid filename:' +  name);
    }

    var promise = new Promise((resolve, reject) => {
      this._document.getPage(pageNum)
        .then((page: PDFJS.PDFPageProxy) => {
          resolve(page);
        }, (reason: any) => {
          reject(reason);
        });
    });
    if (this._setting.detectsImageXObjectPageInPdf()) {
      this._previousUnpackPromise = promise.then((page: PDFJS.PDFPageProxy) => {
        return this.getXObjectContent(page);
      });
    } else {
      this._previousUnpackPromise = promise.then((page: PDFJS.PDFPageProxy) => {
        return this.getContent(page);
      });
    }
    return this._previousUnpackPromise.uncancellable();
  }
  close(): void {
    this._previousUnpackPromise.cancel();
    this._document.destroy();
  }
}
