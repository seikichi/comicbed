import Promise = require('promise');
import Backbone = require('backbone');
import Reader = require('models/reader');
import Page = require('models/page');
import Pages = require('collections/pages');
import Book = require('models/book');
import Screen = require('models/screen');
import Screens = require('collections/screens');
import Unarchiver = require('models/unarchiver');
import Sort = require('models/sort');

declare var sinon: any;
var assert = chai.assert;

describe('Reader', function () {
  // // stubs
  // var pageContents = [ new Image(), new Image(), new Image(), new Image(), new Image(), ];
  // var pages: Pages.Collection = {
  //   length: pageContents.length,
  //   at: (i: number) => {
  //     return {
  //       name: () => 'page',
  //       pageNum: () => i + 1,
  //       content: () => Promise.fulfilled(pageContents[i]),
  //     };
  //   }
  // };
  // var book: Book.Book = {
  //   title: () => 'title',
  //   close: () => {},
  //   pages: () => pages,
  // };

  // var reader: Reader.Reader;
  // var bookFactory: Book.Factory;
  // var screens: Screens.Screens;
  // beforeEach(() => {
  //   bookFactory = {
  //     createFromURL: (url: string) => Promise.fulfilled(book),
  //   };
  //   screens = {
  //     currentScreen: () => <any>undefined,
  //     prevScreens: () => <any>undefined,
  //     nextScreens: () => <any>undefined,
  //     current: () => <any>undefined,
  //     prev: () => <any>undefined,
  //     next: () => <any>undefined,
  //     update: (pages: Pages.Collection, params: Screen.UpdateParams)
  //       => Promise.fulfilled(null),
  //     resize: (width: number, height: number) => {}
  //   };
  //   var setting = {
  //     screenSetting: () => new Backbone.Model(),
  //     sortSetting: () => new Backbone.Model(),
  //   };
  //   var sorter = {
  //     sort: (book: Book.Book, setting: Sort.Setting) => book,
  //   };
  //   reader = Reader.create(bookFactory, screens, sorter, <any>setting);
  // });

  // it('the status should be Closed at first', () => {
  //   assert.strictEqual(Reader.Status.Closed, reader.status());
  // });
  // it('the status should change in the order of Closed, Opening, Opened when new book is opened', (done) => {
  //   assert.strictEqual(Reader.Status.Closed, reader.status());
  //   var url = 'dummy url';
  //   var factoryMock = sinon.mock(bookFactory);
  //   var resolver = Promise.pending();
  //   factoryMock.expects('createFromURL')
  //     .once()
  //     .withExactArgs(url, undefined)
  //     .returns(resolver.promise);
  //   reader.openURL(url).then(() => {
  //     assert.strictEqual(Reader.Status.Opened, reader.status());
  //     assert.strictEqual(pages.length, reader.totalPageNum());
  //     factoryMock.verify();
  //     done();
  //   });
  //   assert.strictEqual(Reader.Status.Opening, reader.status());
  //   resolver.fulfill(book);
  // });
  // it('the status should become Error when failed to open a book', (done) => {
  //   assert.strictEqual(Reader.Status.Closed, reader.status());
  //   var url = 'dummy url';
  //   var factoryMock = sinon.mock(bookFactory);
  //   var resolver = Promise.pending();
  //   factoryMock.expects('createFromURL')
  //     .once()
  //     .withExactArgs(url, undefined)
  //     .returns(resolver.promise);
  //   reader.openURL(url).catch((reason: any) => {
  //     assert.strictEqual(Reader.Status.Error, reader.status());
  //     factoryMock.verify();
  //     done();
  //   });
  //   assert.strictEqual(Reader.Status.Opening, reader.status());
  //   resolver.reject('');
  // });
  // it('reject the promsie if open a new book while opening the previous book', (done) => {
  //   var url = 'AAAAA';
  //   var factoryMock = sinon.mock(bookFactory);
  //   var resolver = Promise.pending();

  //   factoryMock.expects('createFromURL')
  //     .twice()
  //     .withExactArgs(url, undefined)
  //     .returns(resolver.promise);
  //   reader.openURL(url).catch((error: any) => {
  //     factoryMock.verify();
  //     done();
  //    });
  //   reader.openURL(url);
  // });

  // it('the status should become Closed when the method close is called', (done) => {
  //   assert.strictEqual(Reader.Status.Closed, reader.status());
  //   var url = 'dummy url';
  //   reader.openURL(url).then(() => {
  //     assert.strictEqual(Reader.Status.Opened, reader.status());
  //     reader.close();
  //     assert.strictEqual(Reader.Status.Closed, reader.status());
  //     done();
  //   });
  // });

  // it('triggers change event when page moved', (done) => {
  //   var newPageNum = 3;
  //   reader.openURL('').then(() => {
  //     var mock = sinon.mock(screens);
  //     mock.expects('update')
  //       .once()
  //       .withExactArgs(pages, {
  //         currentPageNum: newPageNum,
  //         readingDirection: reader.readingDirection()})
  //       .returns(Promise.fulfilled(null));
  //     reader.on('change:currentPageNum', () => {
  //       assert.strictEqual(newPageNum, reader.currentPageNum());
  //       mock.verify();
  //       done();
  //     });
  //     reader.goToPage(newPageNum)
  //   });
  // });
});