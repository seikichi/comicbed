import Promise = require('promise');
import Screen = require('models/screen');
import Page = require('models/page');
import Pages = require('collections/pages');
import Scaler = require('models/scaler');

var assert = chai.assert;
declare var sinon: any;

describe('Screen', () => {
  var builder: Scaler.Scaler = {
    scale: (pages: Page.Content[], params: Scaler.ScaleParams) => <any>undefined
  };
  var size = { width: 640, height: 480 };
  var pageContents = [ new Image(), new Image(), new Image(), new Image(), new Image(), ];
  var pages: Pages.Collection = {
    length: pageContents.length,
    at: (i: number) => {
      return {
        name: () => 'page',
        pageNum: () => i + 1,
        content: () => Promise.fulfilled(pageContents[i]),
      };
    }
  };

  describe('the update method', () => {
    var setting = {
      detectsSpreadPage: () => true,
      viewMode: () => Screen.ViewMode.TwoPage,
      isSpreadPage: (content: Page.Content) => false,
      pageDirection: () => Screen.PageDirection.R2L,
    };
    it('makes the status Screen.Status.Success', (done) => {
      var screen = Screen.createScreen(size, builder, setting);
      screen.update(pages, {
        currentPageNum: 0,
        readingDirection: Screen.ReadingDirection.Forward
      }).then(() => {
        assert.strictEqual(Screen.Status.Success, screen.status());
        done();
      });
    });
    it('makes the status Screen.Status.Error when first page.content() failed', (done) => {
      var mock = sinon.mock(pages);
      mock.expects('at').atLeast(1).withExactArgs(0).returns({
        name: () => 'page',
        pageNum: () => 0,
        content: () => Promise.rejected(null),
      });
      var screen = Screen.createScreen(size, builder, setting);
      screen.update(pages, {
        currentPageNum: 0,
        readingDirection: Screen.ReadingDirection.Forward
      }).then(() => {
        assert.strictEqual(Screen.Status.Error, screen.status());
        assert.strictEqual(1, screen.pages().length);
        mock.verify();
        done();
      });
    });
    it('calls builder.build with pages.length === 1 if second page.content() failed', (done) => {
      var first = true;
      var pages: Pages.Collection = {
        length: pageContents.length,
        at: (i: number) => {
          return {
            name: () => 'page',
            pageNum: () => i + 1,
            content: () => {
              if (first) {
                first = false;
                return Promise.fulfilled(pageContents[i]);
              }
              return Promise.rejected(null);
            }
          }
        }
      };
      var mock = sinon.mock(builder);
      var content = new Image();
      mock.expects('scale').once().withArgs([pageContents[0]], size).returns(content);
      var screen = Screen.createScreen(size, builder, setting);
      screen.update(pages, {
        currentPageNum: 0,
        readingDirection: Screen.ReadingDirection.Forward
      }).then(() => {
        assert.strictEqual(Screen.Status.Interrupted, screen.status());
        assert.strictEqual(content, screen.content());
        assert.strictEqual(1, screen.pages().length);
        mock.verify();
        done();
      });
    });
  });

  describe('the resize function', () => {
    it('call builder.build with same PageContent[] and new size', (done) => {
      var mock = sinon.mock(builder);
      var setting = {
        detectsSpreadPage: () => false,
        viewMode: () => Screen.ViewMode.OnePage,
        isSpreadPage: (content: Page.Content) => false,
        pageDirection: () => Screen.PageDirection.R2L,
      };
      var screen = Screen.createScreen(size, builder, setting);
      screen.update(pages, {
        currentPageNum: 0,
        readingDirection: Screen.ReadingDirection.Forward
      }).then(() => {
        mock.expects('scale').once().withArgs([pageContents[0]], {width: 1280, height: 960});
        screen.resize(1280, 960);
        mock.verify();
        done();
      });
    });
  });

  describe('the update function, when viewMode is OnePage', () => {
    var setting = {
      detectsSpreadPage: () => true,
      viewMode: () => Screen.ViewMode.OnePage,
      isSpreadPage: (content: Page.Content) => true,
      pageDirection: () => Screen.PageDirection.R2L,
    };
    it('should not call setting.isSpreadPage function', (done) => {
      var mock = sinon.mock(setting);
      mock.expects('isSpreadPage').never();
      var screen = Screen.createScreen(size, builder, setting);
      screen.update(pages, {
        currentPageNum: 0,
        readingDirection: Screen.ReadingDirection.Forward
      }).then(() => { mock.verify(); done(); });
    });
    it('calls builer.build with pages whose length equals to 1', (done) => {
      var mock = sinon.mock(builder);
      var content = new Image();
      mock.expects('scale').once().withArgs([pageContents[0]], size).returns(content);
      var screen = Screen.createScreen(size, builder, setting);
      screen.update(pages, {
        currentPageNum: 0,
        readingDirection: Screen.ReadingDirection.Forward
      }).then(() => {
        assert.strictEqual(content, screen.content());
        mock.verify();
        done();
      });
    });
  });
  describe('the update function, when viewMode is TwoPage, detectsSpreadPage is false', () => {
    var setting = {
      detectsSpreadPage: () => false,
      viewMode: () => Screen.ViewMode.TwoPage,
      isSpreadPage: (content: Page.Content) => true,
      pageDirection: () => Screen.PageDirection.R2L,
    };
    it('should not call setting.isSpreadPage function', (done) => {
      var mock = sinon.mock(setting);
      mock.expects('isSpreadPage').never();
      var screen = Screen.createScreen(size, builder, setting);
      screen.update(pages, {
        currentPageNum: 0, 
        readingDirection: Screen.ReadingDirection.Forward
      }).then(() => { mock.verify(); done(); });
    });
    it('calls builder.build with pages.length === 1 if the update with last page and read forward', (done) => {
      var len = pages.length;
      var mock = sinon.mock(builder);
      var screen = Screen.createScreen(size, builder, setting);
      mock.expects('scale').once().withArgs([pageContents[len - 1]], size);
      screen.update(pages, {
        currentPageNum: len - 1,
        readingDirection: Screen.ReadingDirection.Forward
      }).then(() => { mock.verify(); done(); });
    });
    it('calls builder.build with pages.length === 2 if the update with last page and read backward', (done) => {
      var len = pages.length;
      var mock = sinon.mock(builder);
      var screen = Screen.createScreen(size, builder, setting);
      mock.expects('scale').once().withArgs([pageContents[len - 2], pageContents[len - 1]], size);
      screen.update(pages, {
        currentPageNum: len - 1,
        readingDirection: Screen.ReadingDirection.Backward
      }).then(() => { mock.verify(); done(); });
    });
    it('calls builder.build with pages.length === 2 if the update with first page and read forward', (done) => {
      var mock = sinon.mock(builder);
      var screen = Screen.createScreen(size, builder, setting);
      mock.expects('scale').once().withArgs([pageContents[0], pageContents[1]], size);
      screen.update(pages, { currentPageNum: 0, totalPageNum: pages.length,
                             readingDirection: Screen.ReadingDirection.Forward})
        .then(() => { mock.verify(); done(); });
    });
    it('calls builder.build with pages.length === 1 if the update with first page and read backward', (done) => {
      var mock = sinon.mock(builder);
      var screen = Screen.createScreen(size, builder, setting);
      mock.expects('scale').once().withArgs([pageContents[0]], size);
      screen.update(pages, {
        currentPageNum: 0,
        readingDirection: Screen.ReadingDirection.Backward
      }).then(() => { mock.verify(); done(); });
    });
  });
  describe('the update function, when viewMode is TwoPage, detectsSpreadPage is true', () => {
    var setting = {
      detectsSpreadPage: () => true,
      viewMode: () => Screen.ViewMode.TwoPage,
      isSpreadPage: (content: Page.Content) => true,
      pageDirection: () => Screen.PageDirection.R2L,
    };
    it('should call once setting.isSpreadPage function if isSpreadPage returns true', (done) => {
      var mock = sinon.mock(setting);
      mock.expects('isSpreadPage').once().returns(true);
      var screen = Screen.createScreen(size, builder, setting);
      screen.update(pages, {
        currentPageNum: 0,
        readingDirection: Screen.ReadingDirection.Forward
      }).then(() => { mock.verify(); done(); });
    });
    it('should call twice setting.isSpreadPage function if isSpreadPage returns false', (done) => {
      var mock = sinon.mock(setting);
      mock.expects('isSpreadPage').twice().returns(false);
      var screen = Screen.createScreen(size, builder, setting);
      screen.update(pages, {
        currentPageNum: 0,
        readingDirection: Screen.ReadingDirection.Forward
      }).then(() => { mock.verify(); done(); });
    });
    it('calls builder.build with pages.length === 1 if the isSpreadPage returns true', (done) => {
      var mock = sinon.mock(builder);
      var screen = Screen.createScreen(size, builder, setting);
      mock.expects('scale').once().withArgs([pageContents[0]], size);
      screen.update(pages, {
        currentPageNum: 0,
        readingDirection: Screen.ReadingDirection.Forward
      }).then(() => { mock.verify(); done(); });
    });
    it('calls builder.build with pages.length === 1 if the isSpreadPage returns true for second page', (done) => {
      var first = true;
      var setting = {
        detectsSpreadPage: () => true,
        viewMode: () => Screen.ViewMode.TwoPage,
        isSpreadPage: (content: Page.Content) => {
          if (first) { return true; }
          first = false;
          return false;
        },
        pageDirection: () => Screen.PageDirection.R2L,
      };
      var mock = sinon.mock(builder);
      var screen = Screen.createScreen(size, builder, setting);
      mock.expects('scale').once().withArgs([pageContents[0]], size);
      screen.update(pages, {
        currentPageNum: 0,
        readingDirection: Screen.ReadingDirection.Forward
      }).then(() => { mock.verify(); done(); });
    });
    it('calls builder.build with pages.length === 2 if the isSpreadPage returns false', (done) => {
      var first = true;
      var setting = {
        detectsSpreadPage: () => true,
        viewMode: () => Screen.ViewMode.TwoPage,
        isSpreadPage: (content: Page.Content) => false,
        pageDirection: () => Screen.PageDirection.R2L,
      };
      var mock = sinon.mock(builder);
      var screen = Screen.createScreen(size, builder, setting);
      mock.expects('scale').once().withArgs([pageContents[0], pageContents[1]], size);
      screen.update(pages, {
        currentPageNum: 0,
        readingDirection: Screen.ReadingDirection.Forward
      }).then(() => { mock.verify(); done(); });
    });
  });
});

