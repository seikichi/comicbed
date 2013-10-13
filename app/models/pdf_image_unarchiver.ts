import Unarchiver = require('models/unarchiver');
import PDFJS = require('pdfjs');
import sprintf = require('sprintf');
import ImageUtil = require('utils/image');

// TODO(seikichi): move to unarchiver.setting
PDFJS.workerSrc = 'assets/app/pdfjs/js/pdf.worker.js';
PDFJS.disableWorker = false;
PDFJS.disableAutoFetch = true;
PDFJS.disableRange = false;

export = PdfImageUnarchiver;

class PdfImageUnarchiver implements Unarchiver.Unarchiver {

  static createFromURL(url: string) : JQueryPromise<Unarchiver.Unarchiver> {
    var deferred = $.Deferred<Unarchiver.Unarchiver>();
    PDFJS.getDocument({url: url}).then((document: PDFJS.PDFDocumentProxy) => {
      deferred.resolve(new PdfImageUnarchiver(document));
    }, () => {
      deferred.reject();
    });
    return deferred.promise();
  }

  private _archiveName: string;
  private _document: PDFJS.PDFDocumentProxy;
  private _names: string[];
  private _nameToPageNum: {[name: string]: number;};
  private _renderTask: PDFJS.RenderTask;
  private _deferred: JQueryDeferred<Unarchiver.Content>;

  constructor(document: PDFJS.PDFDocumentProxy) {
    this._document = document;
    this._archiveName = (<any>this._document).pdfInfo.info.Title;
    this._names = [];
    this._nameToPageNum = {};
    this._renderTask = null;
    this._deferred = null;

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
  unpack(name: string): JQueryPromise<Unarchiver.Content> {
    if (this._deferred !== null && this._deferred.state() === 'pending') {
      this._deferred.reject();
    }

    var pageNum = this._nameToPageNum[name];
    var deferred = $.Deferred<Unarchiver.Content>();
    this._deferred = deferred;

    if (pageNum <= 0 || this._document.numPages < pageNum) {
      deferred.reject();
      return this._deferred.promise();
    }

    var canvas = document.createElement('canvas');
    var page: PDFJS.PDFPageProxy = null;
    this._document.getPage(pageNum).then((_page: PDFJS.PDFPageProxy) => {
      if (deferred.state() === 'rejected') { return; }
      page = _page;
      var viewport = page.getViewport(0);
      var context = canvas.getContext('2d');
      var renderContext = { canvasContext: context, viewport: viewport, };
      if (this._renderTask !== null) {
        this._renderTask.cancel();
      }
      this._renderTask = page.render(renderContext);
      return this._renderTask;
    }).then(() => {
      if (deferred.state() === 'rejected') { return; }
      this._renderTask = null;
      var objs = page.objs.objs;
      for (var key in objs) if (objs.hasOwnProperty(key)) {
        if (key.indexOf('img_') !== 0) { continue; }
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
        return;
      }
      deferred.reject();
    });
    return deferred.promise();
  }
  close(): void {
    this._document.destroy();
  }
}
