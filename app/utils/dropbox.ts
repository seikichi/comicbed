import Picker = require('utils/picker');
import Promise = require('promise');
import PromiseUtil = require('utils/promise');

export = DropboxStorage;

declare var Dropbox: any;

module DropboxStorage {
  export function createPicker(appKey: string = "djpng2jxhbnkgwm"): Picker.FilePicker {
    return {
      pick: () => {
        if ('Dropbox' in window) {
          return chooseDropboxFile(Dropbox);
        }
        return PromiseUtil.require<typeof Dropbox>('dropbox')
          .then((Dropbox: typeof Dropbox) => {
            Dropbox.init({appKey: appKey});
            return chooseDropboxFile(Dropbox);
          });
      }
    };
  }

  function chooseDropboxFile(Dropbox: typeof Dropbox): Promise<Picker.Result> {
    return new Promise((resolver, reject) => {
      Dropbox.choose({
        success: (files: Dropbox.ChoosedFile[]) => {
          if (files.length === 0) { reject('dropbox chooser failed'); }
          var file = files[0];
          resolver({
            name: file.name,
            url: file.link,
            bytes: file.bytes,
          });
        },
        cancel: () => {
          reject('dropbox chooser canceled')
        },
        linkType: 'direct',
        multiselect: false,
      });
    });
  }
}
