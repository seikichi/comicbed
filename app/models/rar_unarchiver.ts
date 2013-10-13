import Unarchiver = require('models/unarchiver');
import PDFJS = require('pdfjs');
import Unrar = require('unrar');
import ImageUtil = require('utils/image');

export = RarUnarchiver;

class RarUnarchiver implements Unarchiver.Unarchiver {

  static createFromURL(url: string, setting: Unarchiver.Setting)
  : JQueryPromise<Unarchiver.Unarchiver> {
    var deferred = $.Deferred<Unarchiver.Unarchiver>();
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'arraybuffer';
    xhr.onload = (e: Event) => {
      if (xhr.status !== 200) { deferred.reject(); return; }
      var buffer: ArrayBuffer = xhr.response;
      deferred.resolve(new RarUnarchiver(new Unrar(buffer), setting));
      xhr = null;
    };
    xhr.send();
    return deferred.promise();
  }

  private _filenames: string[];
  constructor(private _unrar: Unrar,
              private _setting: Unarchiver.Setting) {
    this._filenames = this._unrar.getFilenames();
  }

  archiveName(): string { return 'RAR archive'; } // TODO(seikichi): fix
  filenames(): string[] { return this._filenames; }
  unpack(name: string): JQueryPromise<Unarchiver.Content> {
    var deferred = $.Deferred<Unarchiver.Content>();
    var data = this._unrar.decompress(name);

    var format = '';
    var ext = name.split('.').pop();
    switch (ext) {
    case 'png':
      format = 'png';
      break;
    case 'jpg':
    case 'jpeg':
      format = 'jpeg';
      break;
    case 'tif':
    case 'tiff':
      // format = 'tiff';
      break;
    }
    if (format === '') {
      return deferred.reject().promise();
    }

    if (_.isNull(data)) {
      return deferred.reject().promise();
    } else {
      var str = '';
      var length = data.length;
      for (var n = 0; n < length; ++n) {
        str += String.fromCharCode(data[n]);
      }
      var base64Data: string = window.btoa(str);
      var dataURL = 'data:image/' + format + ';base64,' + base64Data;
      ImageUtil.loadImageFromURL(dataURL).then((image: HTMLImageElement) => {
        deferred.resolve(image);
      }).fail(() => {
        deferred.reject();
      });
    }
    return deferred.promise();
  }
  close(): void { this._unrar.close(); }
}
