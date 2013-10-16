import $ = require('jquery');
import Backbone = require('backbone');
import Reader = require('models/reader');
import Page = require('models/page');
import Pages = require('collections/pages');
import Book = require('models/book');
import Screen = require('models/screen');
import Screens = require('collections/screens');
import Unarchiver = require('models/unarchiver');
import Task = require('models/task');
import Sort = require('models/sort');

declare var sinon: any;
var assert = chai.assert;

describe('Reader', function () {
  // stubs
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
  var book: Book.Book = {
    title: () => 'title',
    close: () => {},
    pages: () => pages,
  };

  var reader: Reader.Reader;
  var bookFactory: Book.Factory;
  var screens: Screens.Screens;
  beforeEach(() => {
    bookFactory = {
      createFromURL: (url: string)
        => new Task($.Deferred<Book.Book>().resolve(book).promise()),
    };
    screens = {
      currentScreen: () => <any>undefined,
      prevScreens: () => <any>undefined,
      nextScreens: () => <any>undefined,
      update: (pages: Pages.Collection, params: Screen.UpdateParams)
        => $.Deferred<void>().resolve().promise(),
      resize: (width: number, height: number) => {}
    };
    var setting = {
      screenSetting: () => new Backbone.Model(),
      sortSetting: () => new Backbone.Model(),
    };
    var sorter = {
      sort: (book: Book.Book, setting: Sort.Setting) => book,
    };
    reader = Reader.create(bookFactory, screens, sorter, <any>setting);
  });

  it('the status should be Closed at first', () => {
    assert.strictEqual(Reader.Status.Closed, reader.status());
  });
  it('the status should change in the order of Closed, Opening, Opened when new book is opened', (done) => {
    assert.strictEqual(Reader.Status.Closed, reader.status());
    var url = 'dummy url';
    var factoryMock = sinon.mock(bookFactory);
    var deferred = $.Deferred<Book.Book>();
    factoryMock.expects('createFromURL')
      .once()
      .withExactArgs(url, undefined)
      .returns(deferred.promise());
    reader.openURL(url).then(() => {
      assert.strictEqual(Reader.Status.Opened, reader.status());
      assert.strictEqual(pages.length, reader.totalPageNum());
      factoryMock.verify();
      done();
    });
    assert.strictEqual(Reader.Status.Opening, reader.status());
    deferred.resolve(book);
  });
  it('the status should become Error when failed to open a book', (done) => {
    assert.strictEqual(Reader.Status.Closed, reader.status());
    var url = 'dummy url';
    var factoryMock = sinon.mock(bookFactory);
    var deferred = $.Deferred<Book.Book>();
    factoryMock.expects('createFromURL')
      .once()
      .withExactArgs(url, undefined)
      .returns(deferred.promise());
    reader.openURL(url).fail(() => {
      assert.strictEqual(Reader.Status.Error, reader.status());
      factoryMock.verify();
      done();
    });
    assert.strictEqual(Reader.Status.Opening, reader.status());
    deferred.reject();
  });
  it('reject the promsie if open a new book while opening the previous book', (done) => {
    var url = 'AAAAA';
    var factoryMock = sinon.mock(bookFactory);
    var deferred = $.Deferred<Book.Book>();
    factoryMock.expects('createFromURL')
      .once()
      .withExactArgs(url, undefined)
      .returns(new Task(deferred.promise()));
    reader.openURL(url).fail(() => { factoryMock.verify(); done(); });
    reader.openURL('new book url');
  });

  it('the status should become Closed when the method close is called', (done) => {
    assert.strictEqual(Reader.Status.Closed, reader.status());
    var url = 'dummy url';
    reader.openURL(url).then(() => {
      assert.strictEqual(Reader.Status.Opened, reader.status());
      reader.close();
      assert.strictEqual(Reader.Status.Closed, reader.status());
      done();
    });
  });

  it('triggers change event when page moved', (done) => {
    var newPageNum = 3;
    reader.openURL('').then(() => {
      var mock = sinon.mock(screens);
      mock.expects('update')
        .once()
        .withExactArgs(pages, {
          currentPageNum: newPageNum,
          readingDirection: reader.readingDirection()})
        .returns($.Deferred<void>().resolve().promise());
      reader.on('change:currentPageNum', () => {
        assert.strictEqual(newPageNum, reader.currentPageNum());
        mock.verify();
        done();
      });
      reader.goToPage(newPageNum)
    });
  });
});