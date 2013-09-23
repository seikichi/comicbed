import $ = require('jquery');
import templates = require('templates');
import CompositeView = require('views/composite');

// models
import Book = require('models/book');
import Setting = require('models/setting');

// subviews
import ContentView = require('views/content');
import KeyEventHandler = require('views/key');
import InputView = require('views/input');

// exports FlowerpotView
export = FlowerpotView;

class FlowerpotView extends CompositeView {
  private template: (data: {[key:string]: any;}) => string;
  private setting: Setting.ModelInterface;
  private book: Book.ModelInterface;
  private queryOptions: {[field:string]:string;};
  private _keyEventHandler: KeyEventHandler;

  constructor(options: {[field:string]:string;}) {
    this.template = templates.flowerpot;
    this.setting = Setting.create(options);
    this.book = Book.create(this.setting);
    this.queryOptions = options;
    this._keyEventHandler = new KeyEventHandler(this.book);

    super();
  }

  initialize() {
    if ('url' in this.queryOptions) {
      this.book.openURL(this.queryOptions['url']);
    }

    this.assign('#content', new ContentView({book: this.book}));
    this.listenTo(this.book, 'change:status', this.render);

    this.assign('#input', new InputView(this.book, templates.input))
  }

  presenter(): string {
    return this.template({});
  }
}

