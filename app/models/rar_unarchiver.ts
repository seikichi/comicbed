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
    return ImageUtil.createImageElementFromArrayBuffer(data);
  }
  close(): void { this._unrar.close(); }
}
