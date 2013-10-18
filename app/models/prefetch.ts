import Promise = require('promise');
import Page = require('models/page');
import Pages = require('collections/pages');
import Screen = require('models/screen');
import Screens = require('collections/screens');

export = Prefetch;

module Prefetch {
  export interface Setting {
    pagePrefetchNum(): number;
  }

  export function createPagePrefetchScreens(screens: Screens.Screens, setting: Setting)
  : Screens.Screens {
    return new PagePrefetchScreensImpl(screens, setting);
  }
}

// private
class PagePrefetchScreensImpl implements Screens.Screens {
  private _prefetchPromise: Promise<void>;

  constructor(private _inner: Screens.Screens, private _setting: Prefetch.Setting) {
    this._prefetchPromise = Promise.fulfilled(null);
  }
  currentScreen() { return this._inner.currentScreen(); }
  prevScreens() { return this._inner.prevScreens(); }
  nextScreens() { return this._inner.nextScreens(); }

  update(pages: Pages.Collection, params: Screen.UpdateParams): Promise<void> {
    this._prefetchPromise.cancel();

    var updatePromise = this._inner.update(pages, params);

    this._prefetchPromise = updatePromise.uncancellable();
    var currentPageNum = params.currentPageNum;
    var prefetchNum = this._setting.pagePrefetchNum();
    for (var i = currentPageNum, len = pages.length;
         0 <= i && i < len && Math.abs(i - currentPageNum) <= prefetchNum;
         i += params.readingDirection) {
      ((index: number) => {
        this._prefetchPromise = this._prefetchPromise.then(() => {
          return pages.at(index).content();
        }).then<void>((content: Page.Content) => {});
      }(i));
    }
    // ignore errors (includes cancel)
    this._prefetchPromise.catch((e: any) => { });
    return updatePromise;
  }

  resize(width: number, height: number): void {
    this._inner.resize(width, height);
  }
}
