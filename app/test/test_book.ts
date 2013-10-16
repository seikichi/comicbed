import Promise = require('promise');
import Book = require('models/book');
import Unarchiver = require('models/unarchiver');

declare var sinon: any;
var assert = chai.assert;

describe('Book', function () {
  describe('createFactory', function () {
    var unarchiver: Unarchiver.Unarchiver = {
      archiveName: () => 'archive',
      filenames: () => ['01', '02', '03'],
      unpack: (name: string) => Promise.fulfilled(null),
      close: () => {},
    };
    var unarchiverFactory: Unarchiver.Factory = <any>{
      getUnarchiverFromURL: () => Promise.fulfilled(unarchiver),
      getUnarchiverFromFile: () => <any>undefined,
    }

    it('create book whose title is equal to archive name', (done) => {
      var factory = Book.createFactory(unarchiverFactory);
      factory.createFromURL('').then((book: Book.Book) => {
        assert.strictEqual(unarchiver.archiveName(), book.title());
        done();
      });
    });

    it('fails when unarchiverFactory.getUnarchiverFromURL fails', (done) => {
      var mock = sinon.mock(unarchiverFactory);
      mock.expects('getUnarchiverFromURL').once().returns(Promise.rejected(''));
      var factory = Book.createFactory(unarchiverFactory);
      factory.createFromURL('').catch(() => {
        mock.verify();
        done();
      });
    });

    it('calls Unarchiver.getUnarchiverFromURL when createFromURL is called', () => {
      var mock = sinon.mock(unarchiverFactory);
      var promise = unarchiverFactory.getUnarchiverFromURL('');
      mock.expects('getUnarchiverFromURL').once().returns(promise);
      var factory = Book.createFactory(unarchiverFactory);
      factory.createFromURL('');
      mock.verify();
    });

    it('create book that call Unarchiver.close when book is closed', (done) => {
      var mock = sinon.mock(unarchiver);
      mock.expects('close').once();
      var factory = Book.createFactory(unarchiverFactory);
      factory.createFromURL('').then((book: Book.Book) => {
        book.close();
        mock.verify();
        done();
      });
    });

    it('create book whose # of pages is equals to # of archive files', (done) => {
      var factory = Book.createFactory(unarchiverFactory);
      factory.createFromURL('').then((book: Book.Book) => {
        var filenames = unarchiver.filenames();
        assert.strictEqual(filenames.length, book.pages().length);
        done();
      });
    });

    it('create book whose page names are same to filenames of archive', (done) => {
      var factory = Book.createFactory(unarchiverFactory);
      factory.createFromURL('').then((book: Book.Book) => {
        var filenames = unarchiver.filenames();
        var pagenames: string[] = [];
        for (var i = 0, len = book.pages().length; i < len; ++i) {
          pagenames.push(book.pages().at(i).name());
        }
        assert.deepEqual(filenames, pagenames);
        done();
      });
    });
  });
});
