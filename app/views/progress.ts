import Backbone = require('backbone');
import ProgressBar = require('progressbar');
import BaseView = require('views/base');
import Reader = require('models/reader');
import Progress = require('models/progress');

export = ProgressView;

class ProgressView extends BaseView {
  private _options: ProgressView.Options;
  private _reader: Reader.Reader;
  private _template: HTMLTemplate;
  private _progress: Progress.Progress;
  private _progressBar: any;
  events: {[event:string]: any};

  constructor(options: ProgressView.Options) {
    this._options = options;
    this._reader = options.reader;
    this._progress = this._reader.progress();
    this._template = options.template;
    this.events = {
      'click #progress-dialog-cancel': 'onClickCancel'
    };
    super();
  }

  onClickCancel() {
    this._reader.close();
  }

  initialize() {
    this.listenTo(this._progress, 'change', () => {
      this.update();
    });
  }

  presenter() {
    return this._template({
      message: this._progress.message(),
      progress: this._progress.progress(),
    });
  }

  render() {
    super.render();
    this.$('.progress-bar').progressbar({ transition_delay: 0 });
    return this;
  }

  update() {
    this.$('#progress-dialog-message').html(this._progress.message());
    this.$('.progress-bar').get(0).setAttribute('aria-valuetransitiongoal', this._progress.progress());
    this.$('.progress-bar').progressbar({ transition_delay: 0 });
  }
}

module ProgressView {
  export interface Options extends Backbone.ViewOptions {
    template: HTMLTemplate;
    reader: Reader.Reader;
  }
}

