import Backbone = require('backbone');

class PageModel extends Backbone.Model<PageModel.Attribuets> {
    defaults() {
        return {
            name: '',
            originalPageNum: 0,
        };
    }
}

module PageModel {
    export interface Attribuets {
        name?: string;
        originalPageNum?: number;
    }
}

export = PageModel;