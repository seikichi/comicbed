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

    toggleViewMode(): void;
  }

  export interface UnarchiverSetting extends Unarchiver.Setting {
    setPdfjsCanvasScale(scale: number): void;
    setDetectsImageXObjectPageInPdf(value: boolean): void;
  }

  export interface SortSetting extends Sort.Setting {
    setOrder(order: Sort.Order): void;
    setReverse(value: boolean): void;
  }

  export interface CacheSetting extends Cache.Setting {
    setCacheScreenNum(value: number): void;
    setCachePageNum(value: number): void;
  }

  export interface Setting {
    screenSetting(): ScreenSetting;
    unarchiverSetting(): UnarchiverSetting;
    sortSetting(): SortSetting;
    cacheSetting(): CacheSetting;

    scalerSetting(): Scaler.Setting;
  }

  export function create(params: {[key: string]:string;}): Setting {
    return new SettingImpl(params);
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

  toggleViewMode(): void {
    if (this.viewMode() === Screen.ViewMode.OnePage) {
      this.set('viewMode', Screen.ViewMode.TwoPage);
    } else {
      this.set('viewMode', Screen.ViewMode.OnePage);
    }
  }
}

class CacheSettingModel extends Backbone.Model implements Setting.CacheSetting {
  defaults() {
    return {
      cacheScreenNum: 7,
      cachePageNum: 20,
    };
  }
  cacheScreenNum() { return <number>this.get('cacheScreenNum'); }
  cachePageNum() { return <number>this.get('cachePageNum'); }

  setCacheScreenNum(value: number): void { this.set('cacheScreenNum', value)}
  setCachePageNum(value: number): void { this.set('cachePageNum', value)}
}

class ScalerSettingModel extends Backbone.Model implements Scaler.Setting {
  scaleMode() { return Scaler.ScaleMode.AlignVertical; }
}

class UnarchiverSettingModel extends Backbone.Model implements Unarchiver.Setting {
  pageFileExtensions(): string[] {
    return ['jpg', 'jpeg', 'png', 'bmp', 'gif', 'tif', 'tiff'];
  }
  defaults() {
    return {
      pdfjsCanvasScale: 2,
      detectsImageXObjectPageInPdf: true,
    };
  }
  pdfjsCanvasScale(): number { return <number>this.get('pdfjsCanvasScale'); }
  detectsImageXObjectPageInPdf(): boolean { return <boolean>this.get('detectsImageXObjectPageInPdf'); }

  setPdfjsCanvasScale(scale: number) { this.set('pdfjsCanvasScale', scale); }
  setDetectsImageXObjectPageInPdf(value: boolean) { this.set('detectsImageXObjectPageInPdf', value); }
}


class SortSettingModel extends Backbone.Model implements Sort.Setting {
  defaults() {
    return {
      order: Sort.Order.NameNatural,
      reverse: false,
    };
  }
  order() { return <Sort.Order>this.get('order'); }
  reverse() { return <boolean>this.get('reverse'); }

  setOrder(order: Sort.Order) { this.set('order', order); }
  setReverse(value: boolean) { this.set('reverse', value); }
}


class SettingImpl implements Setting.Setting {
  private _screenSetting: Setting.ScreenSetting;
  private _unarchiverSetting: UnarchiverSettingModel;
  private _cacheSetting: CacheSettingModel;
  private _sortSetting: SortSettingModel;
  private _scalerSetting: Scaler.Setting;

  constructor(urlParams: {[key: string]:string;}) {
    this._screenSetting = new ScreenSettingModel();
    this._scalerSetting = new ScalerSettingModel();
    this._unarchiverSetting = new UnarchiverSettingModel();
    this._cacheSetting = new CacheSettingModel();
    this._sortSetting = new SortSettingModel();

    // sort
    if ('sort.reverse' in urlParams
        && urlParams['sort.reverse'] !== 'false') {
      this._sortSetting.setReverse(true);
    }
    if ('sort.order' in urlParams) {
      var order = Sort.Order[urlParams['sort.order']];
      if (typeof order !== 'undefined') {
        this._sortSetting.setOrder(order);
      }
    }
    // unarchiver
    if ('unarchiver.pdfjsCanvasScale' in urlParams) {
      var scale = urlParams['unarchiver.pdfjsCanvasScale'] || 1;
      this._unarchiverSetting.setPdfjsCanvasScale(scale);
    }
    if ('unarchiver.detectsImageXObjectPageInPdf' in urlParams
        && urlParams['unarchiver.detectsImageXObjectPageInPdf'] !== 'false') {
      this._unarchiverSetting.setDetectsImageXObjectPageInPdf(true);
    }
    // screen
    if ('screen.detectsSpreadPage' in urlParams &&
        urlParams['screen.detectsSpreadPage'] !== 'false') {
      this._screenSetting.setDetectsSpreadPage(true);
    }
    if ('screen.viewMode' in urlParams) {
      var mode = Screen.ViewMode[urlParams['screen.viewMode']];
      if (typeof mode !== 'undefined') {
        this._screenSetting.setViewMode(mode);
      }
    }
    if ('screen.pageDirection' in urlParams) {
      var direction = Screen.PageDirection[urlParams['screen.pageDirection']];
      if (typeof direction !== 'undefined') {
        this._screenSetting.setPageDirection(direction);
      }
    }
    // cache
    if ('cache.cachePageNum' in urlParams) {
      var value = parseInt(urlParams['cache.cachePageNum'], 10);
      if (value) {
        this._cacheSetting.setCachePageNum(value);
      }
    }
    if ('cache.cacheScreenNum' in urlParams) {
      var value = parseInt(urlParams['cache.cacheScreenNum'], 10);
      if (value) {
        this._cacheSetting.setCacheScreenNum(value);
      }
    }

    // scaler (TODO)
  }

  screenSetting() { return this._screenSetting; }
  unarchiverSetting() { return this._unarchiverSetting; }
  scalerSetting() { return this._scalerSetting; }
  cacheSetting() { return this._cacheSetting; }
  sortSetting() { return this._sortSetting; }
}
