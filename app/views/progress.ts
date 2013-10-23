import Backbone = require('backbone');
import BaseView = require('views/base');
import Reader = require('models/reader');
import Progress = require('models/progress');
import templates = require('templates');

export = ProgressView;

class ProgressView extends BaseView {
  private _options: ProgressView.Options;
  private _reader: Reader.Reader;
  private _progress: Progress.Progress;
  private _template: HTMLTemplate;

  constructor(options: ProgressView.Options) {
    this._options = options;
    this._reader = options.reader;
    this._progress = this._reader.progress();
    this._template = templates.progress;
    super();
  }

  initialize() {
    this.listenTo(this._progress, 'change', () => {
      this.render();
    });
  }

  presenter() {
    return this._template({
      message: this._progress.message(),
    });
  }

  render() {
    super.render();
    this.$('.progressbar').progressbar({value: this._progress.progress()})
    return this;
  }
}

module ProgressView {
  export interface Options extends Backbone.ViewOptions {
    reader: Reader.Reader;
  }
}

