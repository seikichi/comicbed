import Backbone = require('backbone');

class BookModel extends Backbone.Model<BookModel.Attribuets> {
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

module BookModel {
    export interface Attribuets {
        currentPageNum?: number;
        totalPageNum?: number;
        filename?: string;
    }
}

export = BookModel;
