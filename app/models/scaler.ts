import Events = require('models/events');
import Page = require('models/page');

export = Scaler;

module Scaler {
  export enum ScaleMode { AlignVertical, Original, FitWindow, }
  export interface Content extends HTMLElement {}

  export interface Setting extends Events.Events {
    scaleMode(): ScaleMode;
  }

  export interface ScaleParams {
    width: number;
    height: number;
  }

  export interface Scaler {
    scale(pages: Page.Content[], params: ScaleParams): Content;
  }

  export function create(setting: Setting): Scaler {
    return new ContentScaler(setting);
  }
}

// private
class ContentScaler implements Scaler.Scaler {
  private _setting: Scaler.Setting;

  constructor(setting: Scaler.Setting) {
    this._setting = setting;
  }

  scale(pages: Page.Content[], params: Scaler.ScaleParams): Scaler.Content {
    var div = document.createElement('div');
    for (var i = 0, len = pages.length; i < len; ++i) {
      div.appendChild(pages[i]);
    }
    // TODO(seikichi): set css in here (to pages);
    return div;
  }
}
