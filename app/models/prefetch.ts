import Promise = require('promise');
import Page = require('models/page');
import Pages = require('collections/pages');
import Screen = require('models/screen');
import Screens = require('collections/screens');

export = Prefetch;

module Prefetch {
  export function createPagePrefetchScreens(screens: Screens.Screens)
  : Screens.Screens {
    return new PagePrefetchScreensImpl(screens);
  }
}

// private
class PagePrefetchScreensImpl implements Screens.Screens {
  constructor(private _inner: Screens.Screens) {}
  currentScreen() { return this._inner.currentScreen(); }
  prevScreens() { return this._inner.prevScreens(); }
  nextScreens() { return this._inner.nextScreens(); }

  update(pages: Pages.Collection, params: Screen.UpdateParams): Promise<void> {
    return this._inner.update(pages, params);
  }

  resize(width: number, height: number): void {
    this._inner.resize(width, height);
  }
}
