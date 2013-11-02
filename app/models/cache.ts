import Backbone = require('backbone');
import Promise = require('promise');
import Screen = require('models/screen');
import Page = require('models/page');
import Pages = require('collections/pages');
import Unarchiver = require('models/unarchiver');

export = Cache;

module Cache {
  export interface Setting {
    cacheScreenNum(): number;
    cachePageNum(): number;
  }

  export function createScreenFactory(factory: Screen.Factory,
                                      screenSetting: Screen.Setting,
                                      cacheSetting: Setting)
  : Screen.Factory {
    return new CacheScreenFactory(factory, screenSetting, cacheSetting);
  }

  export function createUnarchiverFactory(factory: Unarchiver.Factory,
                                          unarchiverSetting: Unarchiver.Setting,
                                          cacheSetting: Setting)
  : Unarchiver.Factory {
    return new CacheUnarchiverFactory(factory, unarchiverSetting, cacheSetting);
  }
}

// private
//// Cache
class UnarchiverContentCache {
  private _cache: {[name: string]: Unarchiver.Content};
  private _updateNames: string[];

  constructor(private _cacheSetting: Cache.Setting) {
    this._cache = {};
    this._updateNames = [];
  }

  find(name: string): Unarchiver.Content {
    if (name in this._cache) {
      return this._cache[name];
    }
    return null;
  }

  update(name: string, content: Unarchiver.Content): void {
    var cache = this._cache;
    var updateNames = this._updateNames;
    cache[name] = content;

    var index = updateNames.indexOf(name);
    if (index !== -1) {
      updateNames.splice(index, 1);
    }

    updateNames.unshift(name);
    updateNames = updateNames.slice(0, this._cacheSetting.cachePageNum());
    this._updateNames = updateNames;

    var removeNames: string[] = [];
    for (var p in cache) {
      if (cache.hasOwnProperty(p) &&
          updateNames.indexOf(p) === -1) {
        removeNames.push(p);
      }
    }
    for (var i = 0, len = removeNames.length; i < len; ++i) {
      delete cache[removeNames[i]];
    }
  }

  clean(): void {
    this._cache = {};
  }
}

class CacheUnarchiver implements Unarchiver.Unarchiver {
  private _cache: UnarchiverContentCache;

  private _previousUnpackPromise: Promise<Unarchiver.Content>;

  constructor(private _inner: Unarchiver.Unarchiver,
              private _unarchiverSetting: Unarchiver.Setting,
              private _cacheSetting: Cache.Setting) {
    this._cache = new UnarchiverContentCache(this._cacheSetting);
    this._unarchiverSetting.on('change', this._cache.clean, this);
    this._previousUnpackPromise = Promise.fulfilled(null);
  }

  archiveName(): string { return this._inner.archiveName(); }
  filenames(): string[] { return this._inner.filenames(); }
  unpack(name: string): Promise<Unarchiver.Content> {
    // if a cache exists, use and update the cache
    var cachedContent = this._cache.find(name);
    if (cachedContent) {
      this._cache.update(name, cachedContent);
      return Promise.fulfilled(cachedContent);
    }

    this._previousUnpackPromise.cancel();
    this._previousUnpackPromise =  this._inner.unpack(name)
      .then((content: Unarchiver.Content) => {
        this._cache.update(name, content);
        return content;
      });
    return this._previousUnpackPromise.uncancellable();
  }
  close(): void {
    this._cache.clean();
    this._unarchiverSetting.off('change', this._cache.clean, this);
    this._inner.close();
  }
}

class CacheUnarchiverFactory implements Unarchiver.Factory {
  constructor(private _factory: Unarchiver.Factory,
              private _unarchiverSetting: Unarchiver.Setting,
              private _cacheSetting: Cache.Setting) {
  }

  getUnarchiverFromURL(url: string, options?: Unarchiver.Options) : Promise<Unarchiver.Unarchiver> {
    return this._factory.getUnarchiverFromURL(url, options)
      .then((unarchiver: Unarchiver.Unarchiver)
            => new CacheUnarchiver(unarchiver, this._unarchiverSetting, this._cacheSetting));
  }
  getUnarchiverFromFile(file: File): Promise<Unarchiver.Unarchiver> {
    return this._factory.getUnarchiverFromFile(file)
      .then((unarchiver: Unarchiver.Unarchiver)
            => new CacheUnarchiver(unarchiver, this._unarchiverSetting, this._cacheSetting));
  }
}

//// Screen
class CacheScreenFactory implements Screen.Factory {
  private _cache: ScreenCache;

  constructor(private _innerFactory: Screen.Factory,
              private _screenSetting: Screen.Setting,
              private _cacheSetting: Cache.Setting) {
    (<any>window).cache = this._cache = new ScreenCache(this._screenSetting, this._cacheSetting);
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

    this._screenSetting.on('change', () => {
      this.initialize(null);
    });
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

    var removeNums: string[] = [];
    for (var p in this._cache) {
      if (this._cache.hasOwnProperty(p)
          && this._cacheUsedPages.indexOf(Number(p)) === -1) {
        removeNums.push(p);
      }
    }

    for (var i = 0, len = removeNums.length; i < len; ++i) {
      delete this._cache[removeNums[i]];
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
  private _previousUpdatePromise: Promise<Screen.UpdateResult>;

  constructor(size: Screen.Size,
              factory: Screen.Factory,
              cache: ScreenCache) {
    this._size = size;
    this._cache = cache;
    this._factory = factory;
    this._previousUpdatePromise = Promise.fulfilled({});
    this.updateInnerModel(factory.create(size));
    super();
  }

  cancel(): void {
    this._innerScreen.cancel();
    this._previousUpdatePromise.cancel();
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
  : Promise<Screen.UpdateResult> {
    this._previousUpdatePromise.cancel();

    var cachedScreen = this._cache.find(pages, params);
    if (cachedScreen !== null) {
      this.updateInnerModel(cachedScreen);
      this.resize(this._size.width, this._size.height);
      this.trigger('change');
      return Promise.fulfilled({});
    } else {
      this.updateInnerModel(this._factory.create(this._size));
      this.trigger('change');

      this._previousUpdatePromise = this._innerScreen.update(pages, params)
        .then((result: Screen.UpdateResult) => {
          if (this.status() === Screen.Status.Success) {
            this._cache.update(this._innerScreen, params);
          }
          return result;
        });
      return this._previousUpdatePromise.uncancellable();
    }
  }
}
