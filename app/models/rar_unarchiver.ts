import Promise = require('promise');
import PromiseUtil = require('utils/promise');
import Unarchiver = require('models/unarchiver');
import Unrar = require('unrar');
import ImageUtil = require('utils/image');

export = RarUnarchiver;

class RarUnarchiver implements Unarchiver.Unarchiver {

  static createFromURL(url: string, setting: Unarchiver.Setting, options: Unarchiver.Options)
  : Promise<Unarchiver.Unarchiver> {
    var name = '';
    if ('name' in options) {
      name = options.name;
    } else {
      name = url.split(/(\#|\?)/).shift().split('/').pop();
    }

    return PromiseUtil.getArrayBufferByXHR(url).then((buffer: ArrayBuffer) => {
      return new RarUnarchiver(name, new Unrar(buffer), setting);
    });
  }

  private _filenames: string[];
  constructor(private _name: string,
              private _unrar: Unrar,
              private _setting: Unarchiver.Setting) {
    this._filenames = [];
    var filenames = this._unrar.getFilenames();
    var extensions = this._setting.pageFileExtensions();
    for (var i = 0, len = filenames.length; i < len; ++i) {
      if (extensions.indexOf(filenames[i].split('.').pop()) !== -1) {
        this._filenames.push(filenames[i]);
      }
    }
  }

  archiveName(): string { return this._name; }
  filenames(): string[] { return this._filenames; }
  unpack(name: string): Promise<Unarchiver.Content> {
    return PromiseUtil.wait<void>(1)(null)
      .then(() => this._unrar.decompress(name))
      .then(PromiseUtil.wait<ArrayBuffer>(1))
      .then(ImageUtil.createImageElementFromArrayBuffer);
  }
  close(): void { this._unrar.close(); }
}
