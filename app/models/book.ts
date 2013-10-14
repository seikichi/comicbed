import Unarchiver = require('models/unarchiver');
import Page = require('models/page');
import Pages = require('collections/pages');
import Task = require('models/task');
import Progress = require('models/progress');

export = Book;

module Book {
  export interface Book {
    title(): string;
    close(): void;
    pages(): Pages.Collection;
  }

  export interface Factory {
    createFromURL(url: string): Task<Book>;
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

  createFromURL(url: string): Task<Book.Book> {
    var innerTask = this.unarchiverFactory.getUnarchiverFromURL(url);
    var promise = innerTask.then((unarchiver: Unarchiver.Unarchiver) => {
      var filenames = unarchiver.filenames();
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
    var task = new Task(promise);
    task.oncancel = () => {
      innerTask.cancel();
    };
    return task;
  }
}
