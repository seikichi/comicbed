import Book = require('models/book');
import Page = require('models/page');
import Pages = require('collections/pages');

export = Sort;

module Sort {
  export enum Order { NameDictionary, NameNatural, Entry };

  export interface Setting {
    order(): Order;
    reverse(): boolean;
  }

  export interface PageSorter {
    sort(book: Book.Book, setting: Setting): Book.Book;
  }

  export function createPageSorter(): PageSorter {
    return new PageSorterImpl();
  }
}

// private
function dictionaryCompare(a: string, b: string): number {
  return a > b ? 1 : a < b ? -1 : 0;
}

function naturalCompare(a: string, b: string): number {
  var x: { num: number; str: string; }[] = [];
  var y: { num: number; str: string; }[] = [];
  a.replace(/(\d+)|(\D+)/g, ($0: string, num: any, str: any) => {
    x.push({ num: num || 0, str: str || '' });
    return '';
  });
  b.replace(/(\d+)|(\D+)/g, ($0: string, num: any, str: any) => {
    y.push({ num: num || 0, str: str || '' });
    return '';
  });
  while (x.length > 0 && y.length > 0) {
    var xi = x.shift();
    var yi = y.shift();
    var n = (xi.num - yi.num) || dictionaryCompare(xi.str, yi.str);
    if (n) { return n; }
  }
  return x.length - y.length;
}

class PageSorterImpl implements Sort.PageSorter {
  sort(book: Book.Book, setting: Sort.Setting): Book.Book {
    var pages: Page.Page[] = [];
    var bookPages = book.pages();
    for (var i = 0, len = bookPages.length; i < len; ++i) {
      pages.push(bookPages.at(i));
    }
    switch (setting.order()) {
    case Sort.Order.NameNatural:
      pages.sort((pa, pb) => naturalCompare(pa.name(), pb.name()));
      break;
    case Sort.Order.NameDictionary:
      pages.sort((pa, pb) => dictionaryCompare(pa.name(), pb.name()));
      break;
    default:
      break;
    }
    if (setting.reverse()) { pages.reverse(); }
    var pageCollection = Pages.createCollection(pages);
    return {
      title: () => book.title(),
      close: () => { book.close(); },
      pages: () => pageCollection,
    };
  }
}
