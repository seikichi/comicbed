import BaseView = require('views/base');
import Book = require('models/book');
import Setting = require('models/setting');

export = ImageView;

class ImageView extends BaseView {
  private events: {[event:string]:string;};

  private template: (data: {[key:string]: any;}) => string;
  private book: Book.ModelInterface;
  private setting: Setting.ModelInterface;

  constructor(options: ImageView.Options) {
    this.events = {};
    this.template = options.template;
    this.book = options.book;
    this.setting = options.setting;

    super({});
  }

  presenter(): string {
    return this.template({});
  }
}

module ImageView {
  export interface Options {
    template: (data: {[key:string]: any;}) => string;
    book: Book.ModelInterface;
    setting: Setting.ModelInterface;
  }
}