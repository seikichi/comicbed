import Promise = require('promise');
import Backbone = require('backbone');

import Events = require('models/events');
import Page = require('models/page');
import Pages = require('collections/pages');
import Screen = require('models/screen');

export = Screens;

module Screens {
  export interface Collection extends Events.Events {
    length: number;
    at(index: number): Screen.Screen;
  }

  export interface Screens extends Events.Events {
    current(): Screen.Screen;
    prev(): Screen.Screen;
    next(): Screen.Screen;

    update(pages: Pages.Collection, params: Screen.UpdateParams): Promise<void>;
    resize(width: number, height: number): void;

    // deprecated
    currentScreen(): Screen.Screen;
    prevScreens(): Collection;
    nextScreens(): Collection;
  }

  export function create(size: Screen.Size, factory: Screen.Factory): Screens {
    return new ScreenWithOnePrevNext(size, factory);
  }
}

class ScreenCollection extends Backbone.Collection<Screen.Screen> implements Screens.Collection {}

class ScreenWithOnePrevNext extends Backbone.Model implements Screens.Screens {
  private _size: Screen.Size;
  private _factory: Screen.Factory;

  private _currentScreen: Screen.Screen;
  private _prevScreens: ScreenCollection;
  private _nextScreens: ScreenCollection;
  private _previousUpdatePromise: Promise<void>;

  constructor(size: Screen.Size,
              factory: Screen.Factory) {
    this._size = size;
    this._factory = factory;

    this._currentScreen = this._factory.create(this._size);
    this._prevScreens = new ScreenCollection();
    this._nextScreens = new ScreenCollection();

    this._prevScreens.add(this._factory.create(this._size));
    this._nextScreens.add(this._factory.create(this._size));

    this._previousUpdatePromise = Promise.fulfilled(null);

    super();
  }

  current(): Screen.Screen { return this._currentScreen; }
  prev(): Screen.Screen {
    return this._prevScreens.length > 0 ? this._prevScreens.at(0) : null;
  }
  next(): Screen.Screen {
    return this._nextScreens.length > 0 ? this._nextScreens.at(0) : null;
  }

  currentScreen(): Screen.Screen { return this._currentScreen; }
  prevScreens(): Screens.Collection { return this._prevScreens; }
  nextScreens(): Screens.Collection { return this._nextScreens; }

  update(pages: Pages.Collection, params: Screen.UpdateParams): Promise<void> {
    this._previousUpdatePromise.cancel();
    this._currentScreen.cancel();
    for (var i = 0, len = this._prevScreens.length; i < len; ++i) {
      this._prevScreens.at(i).cancel();
    }
    for (var i = 0, len = this._nextScreens.length; i < len; ++i) {
      this._nextScreens.at(i).cancel();
    }

    var prevPageNum = params.currentPageNum - 1;
    var nextPageNum = params.currentPageNum + 1;
    if (prevPageNum < 0) { this._prevScreens.reset([]); }
    else if (this._prevScreens.length === 0) {
      this._prevScreens.add(this._factory.create(this._size));
    }
    if (pages.length <= nextPageNum) { this._nextScreens.reset([]); }
    else if (this._nextScreens.length === 0) {
      this._nextScreens.add(this._factory.create(this._size));
    }

    this.trigger('change');

    var currentScreenPages: number = 1;
    this._previousUpdatePromise = this._currentScreen.update(pages, params).then(() => {
      currentScreenPages = this._currentScreen.pages().length;
      if (this._prevScreens.length === 0) {
        return Promise.fulfilled(null);
      }
      // check whether the new previous page is valid or not
      var newPrevPageNum = prevPageNum;
      if (params.readingDirection === Screen.ReadingDirection.Backward) {
        newPrevPageNum = params.currentPageNum - currentScreenPages;
      }
      if (newPrevPageNum < 0) {
        this._prevScreens.reset([]);
        return Promise.fulfilled(null);
      }
      // update prev screen
      var prevParams: Screen.UpdateParams = {
        currentPageNum: newPrevPageNum,
        readingDirection: Screen.ReadingDirection.Backward,
      };
      return this._prevScreens.at(0).update(pages, prevParams);
    }).then(() => {
      if (this._nextScreens.length === 0) {
        return Promise.fulfilled(null);
      }
      // check whether the new next page is valid or not
      var newNextPageNum = nextPageNum;
      if (params.readingDirection === Screen.ReadingDirection.Forward) {
        newNextPageNum = params.currentPageNum + currentScreenPages;
      }
      if (pages.length <= newNextPageNum) {
        this._nextScreens.reset([]);
        return Promise.fulfilled(null);
      }
      // update next screen
      var nextParams: Screen.UpdateParams = {
        currentPageNum: newNextPageNum,
        readingDirection: Screen.ReadingDirection.Forward,
      };
      return this._nextScreens.at(0).update(pages, nextParams).then(() => {});
    });
    return this._previousUpdatePromise;
  }

  resize(width: number, height: number): void {
    this._size = { width: width, height: height };
    this._currentScreen.resize(width, height);
    this._prevScreens.each((screen: Screen.Screen) => {
      screen.resize(width, height);
    });
    this._nextScreens.each((screen: Screen.Screen) => {
      screen.resize(width, height);
    });
  }
}
