import _ = require('underscore');
import Backbone = require('backbone');

import Screen = require('models/screen');
import Scaler = require('models/scaler');
import Unarchiver = require('models/unarchiver');

export = Setting;

module Setting {
  export interface Setting {
    screenSetting(): Screen.Setting;
    unarchiverSetting(): Unarchiver.Setting;
    scalerSetting(): Scaler.Setting;
    // cacheSetting(): CacheSetting;
    // inputSetting(): InputSetting;
    // uiSetting(): UISetting;
  }
  // export interface CacheSetting {}
  // export interface InputSetting {}
  // export interface UISetting {}

  export function createFromQueryString(queryString: string): Setting {
    return undefined;
  }
}
  // export function create(options: {[key:string]:string;} = {}): ModelInterface {
  //   var attributes: Attributes =  {};
  //   if ('viewMode' in options && options['viewMode'] in ViewMode) {
  //     attributes.viewMode = ViewMode[options['viewMode']];
  //   }
  //   if ('pageDirection' in options && options['pageDirection'] in PageDirection) {
  //     attributes.pageDirection = PageDirection[options['pageDirection']];
  //   }
  //   if ('page' in options && !_.isNaN(parseInt(options['page'], 10))) {
  //     attributes.page = parseInt(options['page'], 10);
  //   }
  //   if ('canvasScale' in options && !_.isNaN(parseFloat(options['canvasScale']))) {
  //     attributes.canvasScale = parseInt(options['canvasScale'], 10);
  //   }
  //   if ('detectsSpreadPage' in options) {
  //     attributes.detectsSpreadPage = true;
  //   }
  //   if ('displaysOnlyImageInPdf' in options) {
  //     attributes.displaysOnlyImageInPdf = true;
  //   }
  //   logger.info('SettingModel is created: attributes:', JSON.stringify(attributes));
  //   return new SettingModel(attributes);
  // }
