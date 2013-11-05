import Promise = require('promise');
import Unarchiver = require('models/unarchiver');
import Page = require('models/page');
import Pages = require('collections/pages');

export = Book;

module Book {
  export interface Book {
    title(): string;
    close(): void;
    pages(): Pages.Collection;
  }

  export interface Options extends Unarchiver.Options {}

  export interface Factory {
    createFromURL(url: string, options?: Options): Promise<Book>;
  }

  export function createFactory(unarchiverFactory: Unarchiver.Factory): Factory {
    return new BookFactory(unarchiverFactory);
  }
}

// private

class BookFactory implements Book.Factory {
  unarchiverFactory: Unarchiver.Factory;

  constructor(unarchiverFactory: Unarchiver.Factory) {
    this.unarchiverFactory = unarchiverFactory;
  }

  createFromURL(url: string, options?: Book.Options): Promise<Book.Book> {
    return this.unarchiverFactory.getUnarchiverFromURL(url, options)
      .then((unarchiver: Unarchiver.Unarchiver) => {
        var filenames = unarchiver.filenames();
        if (filenames.length === 0) {
          throw { message: 'Image file not found' };
        }
        var pages: Page.Page[] = [];
        for (var i = 0, len = filenames.length; i < len; ++i) {
          ((name: string) => {
            pages.push(Page.createPage(name, i + 1, () => {
              return unarchiver.unpack(name);
            }));
          }(filenames[i]));
        }
        var pageCollection = Pages.createCollection(pages);
        return {
          title: () => unarchiver.archiveName(),
          close: () => { unarchiver.close(); },
          pages: () => pageCollection,
        };
      });
  }
}
