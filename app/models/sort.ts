import Page = require('models/page');
import Pages = require('collections/pages');

export = Sort;

module Sort {
  enum Order { NameDictionary, NameNumeric, Entry };

  interface PageSorter {
    sort(pages: Pages.Collection): Pages.Collection;
  }

  interface Factory {
    create(order: Order, reverse?: boolean): PageSorter;
  }
}

// class DictionarySorter { }
// class NumericSorter { }

