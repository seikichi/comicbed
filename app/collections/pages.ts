import Page = require('models/page');

export = Pages;

module Pages {
  export interface Collection {
    length: number;
    at(index: number): Page.Page;
  }

  export function createCollection(pages: Page.Page[]): Collection {
    return {
      length: pages.length,
      at: (index: number) => pages[index],
    };
  }
}
