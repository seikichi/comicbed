import $ = require('jquery');
import Backbone = require('backbone');
import Screen = require('models/screen');
import Screens = require('collections/screens');
import Page = require('models/page');
import Pages = require('collections/pages');

var assert = chai.assert;
declare var sinon: any;

class ScreenStub extends Backbone.Model {
  status() { return Screen.Status.Loading; }
  content() { return <Screen.Content>undefined; }
  pages() { return <Page.Page[]>[undefined]; }
  update(pages: Pages.Collection, params: Screen.UpdateParams) {
    return $.Deferred<any>().resolve().promise();
  }
  resize(width: number, height: number) {}
}

describe('Screens', () => {
  var size: Screen.Size = { width: 640, height: 480 };
  var factory: Screen.Factory = {
    create: (size: Screen.Size) => new ScreenStub(),
  };
  var impls = {
    'createScreensWithoutPrevNext': Screens.createScreensWithoutPrevNext(size, factory),
    'createScreensWithOnePrevNext': Screens.createScreensWithOnePrevNext(size, factory),
  };
  var pageContents = [ new Image(), new Image(), new Image(), new Image(), new Image(), ];
  var pages: Pages.Collection = {
    length: pageContents.length,
    at: (i: number) => {
      return {
        name: () => 'page',
        pageNum: () => i + 1,
        content: () => $.Deferred<Page.Content>().resolve(pageContents[i]).promise()
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
            mock.expects('update').once().returns($.Deferred<any>().resolve().promise());
            screens.update(pages, {
              currentPageNum: 0,
              readingDirection: Screen.ReadingDirection.Forward,
            }).then(() => {
              mock.verify();
              done();
            });
          });
          it('should make prevScreens empty when the currentPage is firstPage', () => {
          });
          // it('shuold make prevScreens empty when the currentScreen contains first and second pages', () => {
          // });
          // it('shuold make prevScreens empty when the currentPage is firstPage', () => {
          // });
          // it('shuold make prevScreens empty when the currentScreen contains first and second pages', () => {
          // });
          // it('makes prevScreens empty after currentPage is updated', () => {
          // });
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

// describe('Screens.resize', () => {
//   it('call ')
// });