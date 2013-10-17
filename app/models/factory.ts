import Setting = require('models/setting');
import Unarchiver = require('models/unarchiver');
import Reader = require('models/reader');
import Book = require('models/book');
import Scaler = require('models/scaler');
import Screen = require('models/screen');
import Cache = require('models/cache');
import Screens = require('collections/screens');
import Sort = require('models/sort');

export = Factory;

module Factory {
  export function createSetting(query: {[key:string]:string;}): Setting.Setting {
    return Setting.create(query);
  }

  export function createReader(size: Screen.Size, setting: Setting.Setting): Reader.Reader {
    var bookFactory = Book.createFactory(Unarchiver.createFactory(setting.unarchiverSetting()));
    var scaler = Scaler.create(setting.scalerSetting());
    // var screenFactory = Screen.createFactory(scaler, setting.screenSetting());
    var screenFactory = Cache.createScreenFactory(
      Screen.createFactory(scaler, setting.screenSetting()),
      setting.screenSetting(),
      setting.cacheSetting());
    var screens = Screens.create(size, screenFactory);
    var pageSorter = Sort.createPageSorter();

    var reader = Reader.create(bookFactory, screens, pageSorter, setting);
    return reader;
  }

}
