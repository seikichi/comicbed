import Backbone = require('backbone');

import Events = require('models/events');
import Page = require('models/page');
import Pages = require('collections/pages');
import Screen = require('models/screen');

export = Screens;

module Screens {
  export interface Setting {
    prevScreensNum(): number;
    nextScreensNum(): number;
  }

  export interface Collection extends Events.Events {
    length: number;
    at(index: number): Screen.Screen;
    update(pages: Pages.Collection, params: Screen.UpdateParams): JQueryPromise<void>;
    resize(width: number, height: number): void;
  }

  export function create(size: Screen.Size, factory: Screen.Factory, setting: Setting): Collection {
    return new ScreenCollection(size, factory, setting);
  }
}

class ScreenCollection extends Backbone.Collection<Screen.Screen> implements Screens.Collection {
  constructor(private _size: Screen.Size,
              private _factory: Screen.Factory,
              private _setting: Screens.Setting) { super(); }

  update(pages: Pages.Collection, params: Screen.UpdateParams): JQueryPromise<void> {
    return undefined;
  }

  resize(width: number, height: number): void {
    this._size = { width: width, height: height };
    this.each((screen: Screen.Screen) => {
      screen.resize(width, height);
    });
  }
}
