import Backbone = require('backbone');

module Book {
  // public
  export interface Attribuets {
    currentPageNum?: number;
    totalPageNum?: number;
    filename?: string;
  }

  // private
  class BookModel extends Backbone.Model<Attribuets> {
    defaults() {
      return {
        currentPageNum: 1,
        totalPageNum: 1,
        filename: 'no title',
      };
    }
    openFile() {}
    openURL() {}

    goTo(pageNum: number) {}
    toPrevPage() {}
    goNextPage() {}

    getImageSrc(pageNum: number) {}
  }
}

export = Book;
