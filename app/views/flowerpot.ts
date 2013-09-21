import $ = require('jquery');
import templates = require('templates');
import CompositeView = require('views/composite');

// models
import Book = require('models/book');
import Setting = require('models/setting');

// subviews
import ImageView = require('views/image');

// exports FlowerpotView
export = FlowerpotView;

class FlowerpotView extends CompositeView {
  private template: (data: {[key:string]: any;}) => string;
  private book: Book.ModelInterface;
  private setting: Setting.ModelInterface;

  constructor(options: {[field:string]:string;}) {
    this.template = templates.flowerpot;
    this.book = Book.create();
    this.setting = Setting.create();

    super({el: '#flowerpot'});
  }

  initialize() {
    this.assign('#image-viewer', new ImageView({
      template: templates.imageview,
      book: this.book,
      setting: this.setting,
    }));
  }

  presenter(): string {
    return this.template({});
  }
}

