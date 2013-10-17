import $ = require('jqueryui');
import Backbone = require('backbone');
import BaseView = require('views/base');
import CompositeView = require('views/composite');

export = ModalView;

class ModalView extends CompositeView {
  private _options: ModalView.Options;
  private _innerView: BaseView;
  private _template: HTMLTemplate;
  private _$dialog: JQuery;
  private _jqueryUI: typeof $;

  constructor(options: ModalView.Options) {
    // Note: we need to use $ variable in here,
    // otherwise typescript compiler regards the 'jqueryui' as an unnecesary module
    // and removes it in generated js program
    this._jqueryUI = $;
    this._options = options;
    this._innerView = options.innerView;
    this._template = options.template;
    this._$dialog = null;
    super(options);
  }

  initialize() {
    this.assign('.dialog-content', this._innerView);
  }

  show(): void {
    if (this._$dialog === null) { return; }
    this._$dialog.dialog('open');
  }

  hide(): void {
    if (this._$dialog === null) { return; }
    this._$dialog.dialog('close');
  }

  visible(): boolean {
    return this._$dialog.dialog('isOpen');
  }

  hidden(): boolean {
    return !this.visible();
  }

  presenter() {
    return this._template({title: this._options.title});
  }

  render() {
    super.render();
    if (this._$dialog !== null) { this._$dialog.dialog('destroy'); }

    var buttonTexts = this._options.buttonTexts;
    var buttons: any = [];
    for (var i = 0, len = buttonTexts.length; i < len; ++i) {
      var text = buttonTexts[i];
      buttons.push({
        text: text,
        click: () => { this.close(); this.trigger(text); }
      });
    }

    this._$dialog = this.$('.dialog').dialog({
      dialogClass: buttons.length !== 0 ? 'no-close' : '',
      autoOpen: true,
      draggable: false,
      closeOnEscape: true,
      modal: true,
      buttons: buttons,
    });
    return this;
  }

  close() {
    if (this._$dialog !== null) { this._$dialog.dialog('destroy'); }
    super.close();
  }
}

module ModalView {
  export interface Options extends Backbone.ViewOptions {
    title: string;
    template: HTMLTemplate;
    innerView: BaseView;
    buttonTexts: string[];
  }
}
