import $ = require('jquery');
import templates = require('templates');
import CompositeView = require('views/composite');

// models
import Book = require('models/book');
import Setting = require('models/setting');

// subviews
import ContentView = require('views/content');

// exports FlowerpotView
export = FlowerpotView;

class FlowerpotView extends CompositeView {
  private template: (data: {[key:string]: any;}) => string;
  private setting: Setting.ModelInterface;
  private book: Book.ModelInterface;
  private queryOptions: {[field:string]:string;};

  constructor(options: {[field:string]:string;}) {
    this.template = templates.flowerpot;
    this.setting = Setting.create(options);
    this.book = Book.create(this.setting);
    this.queryOptions = options;
    super();
  }

  initialize() {
    if ('url' in this.queryOptions) {
      this.book.openURL(this.queryOptions['url']);
    }

    this.assign('#content', new ContentView({
      template: templates.content,
      book: this.book,
      setting: this.setting,
    }));

    this.listenTo(this.book, 'change', this.render);
  }

  presenter(): string {
    return this.template({});
  }
}

