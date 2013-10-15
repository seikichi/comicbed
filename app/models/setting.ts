import _ = require('underscore');
import Backbone = require('backbone');

import Sort = require('models/sort');
import Cache = require('models/cache');
import Page = require('models/page');
import Screen = require('models/screen');
import Scaler = require('models/scaler');
import Unarchiver = require('models/unarchiver');

export = Setting;

module Setting {
  export interface ScreenSetting extends Screen.Setting {
    setDetectsSpreadPage(value: boolean): void;
    setViewMode(mode: Screen.ViewMode): void;
    setPageDirection(direction: Screen.PageDirection): void;
  }

  export interface Setting {
    screenSetting(): ScreenSetting;
    unarchiverSetting(): Unarchiver.Setting;
    scalerSetting(): Scaler.Setting;
    cacheSetting(): Cache.Setting;
    sortSetting(): Sort.Setting;
  }

  export function createFromQueryString(queryString: string): Setting {
    return new SettingImpl(queryString);
  }
}

class ScreenSettingModel extends Backbone.Model implements Setting.ScreenSetting {
  defaults() {
    return {
      detectsSpreadPage: true,
      viewMode: Screen.ViewMode.TwoPage,
      pageDirection: Screen.PageDirection.R2L,
    };
  }
  detectsSpreadPage() { return <boolean>this.get('detectsSpreadPage'); }
  viewMode() { return <Screen.ViewMode>this.get('viewMode'); }
  pageDirection() { return <Screen.PageDirection>this.get('pageDirection'); }
  isSpreadPage(content: Page.Content): boolean {
    return content.width > content.height;
  }

  setDetectsSpreadPage(value: boolean) { this.set('detectsSpreadPage', value); }
  setViewMode(mode: Screen.ViewMode) { this.set('viewMode', mode); }
  setPageDirection(direction: Screen.PageDirection) { this.set('pageDirection', direction); }
}

class CacheSettingModel extends Backbone.Model implements Cache.Setting {
  cacheScreenNum() { return 7; }
}

class ScalerSettingModel extends Backbone.Model implements Scaler.Setting {
  scaleMode() { return Scaler.ScaleMode.AlignVertical; }
}

class UnarchiverSettingModel extends Backbone.Model implements Unarchiver.Setting {
  pageFileExtensions(): string[] {
    return ['jpg', 'jpeg', 'png', 'bmp', 'gif', 'tif', 'tiff'];
  }
  pdfjsCanvasScale(): number { return 2; }
  detectsImageXObjectPageInPdf(): boolean { return true; }
}


class SortSettingModel extends Backbone.Model implements Sort.Setting {
  order() { return Sort.Order.NameNatural; } 
  reverse() { return false; }
}


class SettingImpl implements Setting.Setting {
  private _screenSetting: Setting.ScreenSetting;
  private _unarchiverSetting: Unarchiver.Setting;
  private _scalerSetting: Scaler.Setting;
  private _cacheSetting: Cache.Setting;
  private _sortSetting: Sort.Setting;

  constructor(queryString: string) {
    this._screenSetting = new ScreenSettingModel();
    this._scalerSetting = new ScalerSettingModel();
    this._unarchiverSetting = new UnarchiverSettingModel();
    this._cacheSetting = new CacheSettingModel();
    this._sortSetting = new SortSettingModel();
  }

  screenSetting() { return this._screenSetting; }
  unarchiverSetting() { return this._unarchiverSetting; }
  scalerSetting() { return this._scalerSetting; }
  cacheSetting() { return this._cacheSetting; }
  sortSetting() { return this._sortSetting; }
}
