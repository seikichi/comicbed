import Promise = require('promise');
import PromiseUtil = require('utils/promise');
import Unarchiver = require('models/unarchiver');
import jz = require('jsziptools');
import ImageUtil = require('utils/image');

export = ZipUnarchiver;

class ZipUnarchiver implements Unarchiver.Unarchiver {
  static createFromURL(url: string, setting: Unarchiver.Setting, options: Unarchiver.Options)
  : Promise<Unarchiver.Unarchiver> {
    var name = '';
    if ('name' in options) {
      name = options.name;
    } else {
      name = url.split(/(\#|\?)/).shift().split('/').pop();
    }

    return PromiseUtil.getArrayBufferByXHR(url, options.httpHeaders).then((buffer: ArrayBuffer) => {
      return Promise.cast<jz.zip.ZipArchiveReader>(jz.zip.unpack({buffer: buffer}))
    }).then((reader: jz.zip.ZipArchiveReader) => {
      return new ZipUnarchiver(name, reader, setting);
    });
  }

  private _filenames: string[];
  private _previousUnpackPromise: Promise<Unarchiver.Content>;

  constructor(private _name: string,
              private _reader: jz.zip.ZipArchiveReader,
              private _setting: Unarchiver.Setting) {
    this._filenames = [];
    var filenames = this._reader.getFileNames();
    var extensions = this._setting.pageFileExtensions();
    for (var i = 0, len = filenames.length; i < len; ++i) {
      if (extensions.indexOf(filenames[i].split('.').pop().toLowerCase()) !== -1) {
        this._filenames.push(filenames[i]);
      }
    }
    this._previousUnpackPromise = Promise.fulfilled(null);
  }

  archiveName(): string { return this._name; }
  filenames(): string[] { return this._filenames; }
  unpack(name: string): Promise<Unarchiver.Content> {
    this._previousUnpackPromise.cancel();

    this._previousUnpackPromise = PromiseUtil.wait<void>(1)(null)
      .then(() => Promise.cast<Blob>(this._reader.getFileAsBlob(name)))
      .then(PromiseUtil.wait(1))
      .then(PromiseUtil.readFileAsArrayBuffer)
      .then(PromiseUtil.wait(1))
      .then(ImageUtil.createImageElementFromArrayBuffer);
    return this._previousUnpackPromise.uncancellable();
  }
  close(): void { this._reader = null; }
}
