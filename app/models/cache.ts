import Backbone = require('backbone');
import Screen = require('models/screen');
import Page = require('models/page');
import Pages = require('collections/pages');

export = Cache;

module Cache {
  export interface Setting {
    cacheScreenNum(): number;
  }

  export function createScreenFactory(factory: Screen.Factory,
                                      screenSetting: Screen.Setting,
                                      cacheSetting: Setting)
  : Screen.Factory {
    return new CacheScreenFactory(factory, screenSetting, cacheSetting);
  }
}

// screen
class CacheScreenFactory implements Screen.Factory {
  private _cache: ScreenCache;

  constructor(private _innerFactory: Screen.Factory,
              private _screenSetting: Screen.Setting,
              private _cacheSetting: Cache.Setting) {
    this._cache = new ScreenCache(this._screenSetting, this._cacheSetting);
  }

  create(size: Screen.Size) {
    return new CacheScreenModel(size, this._innerFactory, this._cache);
  }
}

class ScreenCache {
  private _cache: {[pageNum:number]: {[direction: number]: Screen.Screen}};
  private _screenSetting: Screen.Setting;
  private _cacheSetting: Cache.Setting;
  private _pages: Pages.Collection;
  private _cacheUsedPages: number[];

  constructor(screenSetting: Screen.Setting,
              cacheSetting: Cache.Setting) {
    this._screenSetting = screenSetting;
    this._cacheSetting = cacheSetting;
    this._cacheUsedPages = [];
    this.initialize(null);
  }

  initialize(pages: Pages.Collection) {
    this._cache = {};
    this._pages = pages;
  }

  cacheUsed(pageNum: number): void {
    var pages = this._cacheUsedPages;
    var index = pages.indexOf(pageNum);
    if (index !== -1) {
      pages.splice(index, 1);
    }
    pages.unshift(pageNum);
    this._cacheUsedPages = pages.slice(0, this._cacheSetting.cacheScreenNum());
    for (var p in this._cache) {
      if (this._cache.hasOwnProperty(p)) {
        if (this._cacheUsedPages.indexOf(Number(p)) === -1) {
          delete this._cache[p];
        }
      }
    }
  }

  find(pages: Pages.Collection, params: Screen.UpdateParams)
  : Screen.Screen {
    if (this._pages !== pages) {
      this.initialize(pages);
    }
    var pageNum = params.currentPageNum;
    var direction = params.readingDirection;

    if (String(pageNum) in this._cache
        && String(direction) in this._cache[pageNum]) {
      this.cacheUsed(pageNum);
      return this._cache[pageNum][direction];
    }
    var oppositeDirection = (-1 * direction) | 0;
    if (this._screenSetting.viewMode() === Screen.ViewMode.OnePage) {
      if (String(pageNum) in this._cache
          && String(oppositeDirection) in this._cache[pageNum]) {
        this.cacheUsed(pageNum);
        return this._cache[pageNum][oppositeDirection];
      }
    } else {
      var endPageNum = pageNum + direction;
      if (0 <= endPageNum && endPageNum < pages.length) {
        if (String(endPageNum) in this._cache
            && String(oppositeDirection) in this._cache[endPageNum]
            && this._cache[endPageNum][oppositeDirection].pages().length === 2) {
          this.cacheUsed(endPageNum);
          return this._cache[endPageNum][oppositeDirection];
        }
      }
    }
    return null;
  }

  removeCacheByPageNum(pageNum: number): void {
    var nextPageNum = pageNum + 1;
    var prevPageNum = pageNum - 1;
    var forward = Screen.ReadingDirection.Forward;
    var backward = Screen.ReadingDirection.Backward;

    if (String(nextPageNum) in this._cache
        && String(backward) in this._cache[nextPageNum]
        && this._cache[nextPageNum][backward].pages().length === 2) {
      delete this._cache[nextPageNum][backward];
    }
    if (String(prevPageNum) in this._cache
        && String(forward) in this._cache[prevPageNum]
        && this._cache[prevPageNum][forward].pages().length === 2) {
      delete this._cache[prevPageNum][forward];
    }
  }

  update(screen: Screen.Screen, params: Screen.UpdateParams): void {
    var pageNum = params.currentPageNum;
    var direction = params.readingDirection;
    var size = screen.pages().length;

    this.removeCacheByPageNum(pageNum);
    if (size === 2) {
      this.removeCacheByPageNum(pageNum + direction);
    }
    this._cache[pageNum] = {};
    this._cache[pageNum][direction] = screen;
    this.cacheUsed(pageNum);
  }
}

class CacheScreenModel extends Backbone.Model implements Screen.Screen {
  private _size: Screen.Size;
  private _innerScreen: Screen.Screen;
  private _cache: ScreenCache;
  private _factory: Screen.Factory;
  private _deferred: JQueryDeferred<Screen.UpdateResult>;

  constructor(size: Screen.Size,
              factory: Screen.Factory,
              cache: ScreenCache) {
    this._size = size;
    this._cache = cache;
    this._factory = factory;
    this._deferred = null;
    this.updateInnerModel(factory.create(size));
    super();
  }

  updateInnerModel(screen: Screen.Screen) {
    this.stopListening(this._innerScreen);
    this._innerScreen = screen;
    this.listenTo(this._innerScreen, 'all', (event: string) => {
      this.trigger(event);
    });
  }

  status(): Screen.Status { return this._innerScreen.status(); }
  content(): Screen.Content { return this._innerScreen.content(); }
  pages(): Page.Page[] { return this._innerScreen.pages(); }
  resize(width: number, height: number): void {
    this._size = { width: width, height: height };
    this._innerScreen.resize(width, height);
  }

  update(pages: Pages.Collection, params: Screen.UpdateParams)
  : JQueryPromise<Screen.UpdateResult> {
    if (this._deferred !== null && this._deferred.state() === 'pending') {
      this._deferred.reject();
    }

    var cachedScreen = this._cache.find(pages, params);
    if (cachedScreen !== null) {
      this.updateInnerModel(cachedScreen);
      this.trigger('change:status');
      return $.Deferred<Screen.UpdateResult>().resolve({}).promise();
    } else {
      var deferred = this._deferred = $.Deferred<Screen.UpdateResult>();

      this.updateInnerModel(this._factory.create(this._size));
      this._innerScreen.update(pages, params)
        .then((result: Screen.UpdateResult) => {
          if (deferred.state() === 'rejected') { return result; }
          if (this.status() === Screen.Status.Success) {
            this._cache.update(this._innerScreen, params);
          }
          deferred.resolve(result);
        });
      return deferred.promise();
    }
  }
}
