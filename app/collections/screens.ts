import $ = require('jquery');
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

  export interface Screens {
    currentScreen(): Screen.Screen;
    prevScreens(): Collection;
    nextScreens(): Collection;

    update(pages: Pages.Collection, params: Screen.UpdateParams): JQueryPromise<void>;
    resize(width: number, height: number): void;
  }

  export function create(size: Screen.Size, factory: Screen.Factory): Screens {
    return new ScreenWithOnePrevNext(size, factory);
  }

  export function createScreensWithOnePrevNext(size: Screen.Size, factory: Screen.Factory)
  : Screens {
    return new ScreenWithOnePrevNext(size, factory);
  }

  export function createScreensWithoutPrevNext(size: Screen.Size, factory: Screen.Factory)
  : Screens {
    return new ScreenWithoutPrevNext(size, factory);
  }
}

class ScreenCollection extends Backbone.Collection<Screen.Screen> implements Screens.Collection {
}

class ScreenWithOnePrevNext implements Screens.Screens {
  private _size: Screen.Size;
  private _factory: Screen.Factory;

  private _currentScreen: Screen.Screen;
  private _prevScreens: ScreenCollection;
  private _nextScreens: ScreenCollection;

  constructor(size: Screen.Size,
              factory: Screen.Factory) {
    this._size = size;
    this._factory = factory;

    this._currentScreen = this._factory.create(this._size);
    this._prevScreens = new ScreenCollection();
    this._nextScreens = new ScreenCollection();

    this._prevScreens.add(this._factory.create(this._size));
    this._nextScreens.add(this._factory.create(this._size));
  }


  currentScreen(): Screen.Screen { return this._currentScreen; }
  prevScreens(): Screens.Collection { return this._prevScreens; }
  nextScreens(): Screens.Collection { return this._nextScreens; }

  update(pages: Pages.Collection, params: Screen.UpdateParams): JQueryPromise<void> {
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

    var currentScreenPages: number = 1;
    // first, update the current screen
    var promise = this._currentScreen.update(pages, params).then(() => {
      currentScreenPages = this._currentScreen.pages().length;
      if (this._prevScreens.length === 0) {
        return $.Deferred<void>().resolve().promise();
      }
      // check whether the new previous page is valid or not
      var newPrevPageNum = prevPageNum;
      if (params.readingDirection === Screen.ReadingDirection.Backward) {
        newPrevPageNum = params.currentPageNum - currentScreenPages;
      }
      if (newPrevPageNum < 0) {
        this._prevScreens.reset([]);
        return $.Deferred<void>().resolve().promise();
      }
      // update prev screen
      var prevParams: Screen.UpdateParams = {
        currentPageNum: newPrevPageNum,
        readingDirection: Screen.ReadingDirection.Backward,
      };
      return this._prevScreens.at(0).update(pages, prevParams);
    }).then(() => {
      if (this._nextScreens.length === 0) {
        return $.Deferred<void>().resolve().promise();
      }
      // check whether the new next page is valid or not
      var newNextPageNum = nextPageNum;
      if (params.readingDirection === Screen.ReadingDirection.Forward) {
        newNextPageNum = params.currentPageNum + currentScreenPages;
      }
      if (pages.length <= newNextPageNum) {
        this._nextScreens.reset([]);
        return $.Deferred<void>().resolve().promise();
      }
      // update next screen
      var nextParams: Screen.UpdateParams = {
        currentPageNum: newNextPageNum,
        readingDirection: Screen.ReadingDirection.Forward,
      };
      return this._nextScreens.at(0).update(pages, nextParams).then(() => {});
    });
    return promise;
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


class ScreenWithoutPrevNext implements Screens.Screens {
  private _size: Screen.Size;
  private _factory: Screen.Factory;

  private _currentScreen: Screen.Screen;
  private _prevScreens: ScreenCollection;
  private _nextScreens: ScreenCollection;

  constructor(size: Screen.Size,
              factory: Screen.Factory) {
    this._size = size;
    this._factory = factory;

    this._currentScreen = this._factory.create(this._size);

    // do not update
    this._prevScreens = new ScreenCollection([]);
    this._nextScreens = new ScreenCollection([]);
  }

  currentScreen(): Screen.Screen { return this._currentScreen; }
  prevScreens(): Screens.Collection { return this._prevScreens; }
  nextScreens(): Screens.Collection { return this._nextScreens; }

  update(pages: Pages.Collection, params: Screen.UpdateParams): JQueryPromise<void> {
    return this._currentScreen.update(pages, params).then((result: Screen.UpdateResult) => {});
  }

  resize(width: number, height: number): void {
    this._size = { width: width, height: height };
    this._currentScreen.resize(width, height);
  }
}


