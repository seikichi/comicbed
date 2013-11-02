import _ = require('underscore');
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

    return PromiseUtil.getArrayBufferByXHR(url, options.httpHeaders).then((buffer: ArrayBuffer) => {
      return new RarUnarchiver(name, new Unrar(buffer), setting);
    });
  }

  private _filenames: string[];
  private _previousUnpackPromise: Promise<Unarchiver.Content>;

  constructor(private _name: string,
              private _unrar: Unrar,
              private _setting: Unarchiver.Setting) {
    this._filenames = [];
    var entries = this._unrar.getEntries();
    var extensions = this._setting.pageFileExtensions();
    for (var i = 0, len = entries.length; i < len; ++i) {
      var entry = entries[i];
      if (!entry.isDirectory() &&
          extensions.indexOf(entry.name.split('.').pop().toLowerCase()) !== -1) {
        this._filenames.push(entry.name);
      }
    }
    // TODO(seikichi): fix
    this._filenames = _.uniq(this._filenames);
    this._previousUnpackPromise = Promise.fulfilled(null);
  }

  archiveName(): string { return this._name; }
  filenames(): string[] { return this._filenames; }
  unpack(name: string): Promise<Unarchiver.Content> {
    this._previousUnpackPromise.cancel();

    this._previousUnpackPromise = PromiseUtil.wait<void>(1)(null)
      .then(() => this._unrar.decompress(name))
      .then(PromiseUtil.wait<ArrayBuffer>(1))
      .then(ImageUtil.createImageElementFromArrayBuffer);
    return this._previousUnpackPromise.uncancellable();
  }
  close(): void { this._unrar.close(); }
}
