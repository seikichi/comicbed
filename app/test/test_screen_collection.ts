import Promise = require('promise');
import Backbone = require('backbone');
import Screen = require('models/screen');
import Screens = require('collections/screens');
import Page = require('models/page');
import Pages = require('collections/pages');

var assert = chai.assert;
declare var sinon: any;

class ScreenStub extends Backbone.Model {
  cancel() {}
  status() { return Screen.Status.Loading; }
  content() { return <Screen.Content>undefined; }
  pages() { return <Page.Page[]>[undefined]; }
  update(pages: Pages.Collection, params: Screen.UpdateParams) {
    return Promise.fulfilled(null);
  }
  resize(width: number, height: number) {}
}

describe('Screens', () => {
  var size: Screen.Size = { width: 640, height: 480 };
  var factory: Screen.Factory = {
    create: (size: Screen.Size) => new ScreenStub(),
  };
  var impls = {
    'Screens': Screens.create(size, factory),
  };
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

  for (var key in impls) if (impls.hasOwnProperty(key)) {
    ((screens: Screens.Screens) => {
      describe('created by ' + key, () => {
        describe('the update method ' + key, () => {
          it('updates the currentScreen', (done) => {
            var current = screens.currentScreen();
            var mock = sinon.mock(current);
            mock.expects('update').once().returns(Promise.fulfilled(null))
            screens.update(pages, {
              currentPageNum: 0,
              readingDirection: Screen.ReadingDirection.Forward,
            }).then(() => {
              mock.verify();
              done();
            });
          });
          it('should make prevScreens empty when the currentPage is firstPage', (done) => {
            screens.update(pages, {
              currentPageNum: 0,
              readingDirection: Screen.ReadingDirection.Forward,
            }).then(() => {
              assert.strictEqual(0, screens.prevScreens().length);
              done();
            });
          });
          it('should make prevScreens empty when the currentPageNum equals to 1 and reading backward, currentScreen.pages.length === 2', (done) => {
            var current = screens.currentScreen();
            var mock = sinon.mock(current);
            mock.expects('pages').atLeast(0).returns(<any>[undefined, undefined]);
            screens.update(pages, {
              currentPageNum: 1,
              readingDirection: Screen.ReadingDirection.Backward,
            }).then(() => {
              assert.strictEqual(0, screens.prevScreens().length);
              mock.verify();
              done();
            });
          });
          it('calls prevScreens().at(0).update if prevScreens is not empty and can read prev page', (done) => {
            if (screens.prevScreens().length === 0) { done(); return; }
            var prev = screens.prevScreens().at(0);
            var mock = sinon.mock(prev);
            mock.expects('update').once()
              .withExactArgs(pages, { currentPageNum: 0, readingDirection: Screen.ReadingDirection.Backward})
              .returns(Promise.fulfilled(null));
            screens.update(pages, {
              currentPageNum: 1,
              readingDirection: Screen.ReadingDirection.Forward,
            }).then(() => {
              mock.verify();
              done();
            });
          });

          it('should make nextScreens empty when the currentPage is the last page', (done) => {
            screens.update(pages, {
              currentPageNum: pages.length - 1,
              readingDirection: Screen.ReadingDirection.Forward,
            }).then(() => {
              assert.strictEqual(0, screens.nextScreens().length);
              done();
            });
          });
          it('should make nextScreens empty when the pageNum equals to (pages.length - 2) and reading forward, currentScreen.pages.length === 2', (done) => {
            var current = screens.currentScreen();
            var mock = sinon.mock(current);
            mock.expects('pages').atLeast(0).returns(<any>[undefined, undefined]);
            screens.update(pages, {
              currentPageNum: pages.length - 2,
              readingDirection: Screen.ReadingDirection.Forward,
            }).then(() => {
              assert.strictEqual(0, screens.nextScreens().length);
              mock.verify();
              done();
            });
          });

          it('makes prevScreens empty after currentPage is updated if needed', (done) => {
            if (screens.prevScreens().length === 0) { done(); return; }
            assert.ok(0 < screens.prevScreens().length);
            screens.update(pages, {
              currentPageNum: 0,
              readingDirection: Screen.ReadingDirection.Backward,
            }).then(() => {
              assert.strictEqual(0, screens.prevScreens().length);
              done();
            });
          });

          it('makes nextScreens empty after currentPage is updated if needed', (done) => {
            if (screens.nextScreens().length === 0) { done(); return; }
            assert.ok(0 < screens.nextScreens().length);
            screens.update(pages, {
              currentPageNum: pages.length - 1,
              readingDirection: Screen.ReadingDirection.Backward,
            }).then(() => {
              assert.strictEqual(0, screens.nextScreens().length);
              done();
            });
          });
        });

        describe('the resize method ' + key, () => {
          var newWidth = 100, newHeight = 200;
          it('calls Screen.resize of currentScreen', () => {
            var current = screens.currentScreen();
            var mock = sinon.mock(current);
            mock.expects('resize').once().withExactArgs(newWidth, newHeight);
            screens.resize(newWidth, newHeight);
            mock.verify();
          });
          it('calls Screen.resize of screens in prevScreens', () => {
            var prevs = screens.prevScreens();
            var mocks: any[] = [];
            for (var i = 0, len = prevs.length; i < len; ++i) {
              var mock = sinon.mock(prevs.at(i));
              mock.expects('resize').once().withExactArgs(newWidth, newHeight);
              mocks.push(mock);
            }
            screens.resize(newWidth, newHeight);
            for (var i = 0, len = prevs.length; i < len; ++i) {
              mocks[i].verify();
            }
          });
          it('calls Screen.resize of screens in nextScreens', () => {
            var nexts = screens.nextScreens();
            var mocks: any[] = [];
            for (var i = 0, len = nexts.length; i < len; ++i) {
              var mock = sinon.mock(nexts.at(i));
              mock.expects('resize').once().withExactArgs(newWidth, newHeight);
              mocks.push(mock);
            }
            screens.resize(newWidth, newHeight);
            for (var i = 0, len = nexts.length; i < len; ++i) {
              mocks[i].verify();
            }
          });
        });
      });
    }(impls[key]));
  }
});

