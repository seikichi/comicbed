import Backbone = require('backbone');
import BaseView = require('views/base');
import Setting = require('models/setting');
import Screen = require('models/screen');
import Unarchiver = require('models/unarchiver');

export = SettingView;

class SettingView extends BaseView {
  private _template: HTMLTemplate;
  private _setting: Setting.Setting;
  private _options: SettingView.Options;
  events: {[event:string]:string;};

  constructor(options: SettingView.Options) {
    this._options = options;
    this._template = options.template;
    this._setting = options.setting;

    this.events = {
      'click #range-request-checkbox-label': 'onRangeClick',
      'click #view-mode-radio-choice-one-label': 'onOnePageClick',
      'click #view-mode-radio-choice-two-label': 'onTwoPageClick',
      'click #page-direction-radio-choice-L2R-label': 'onL2RClick',
      'click #page-direction-radio-choice-R2L-label': 'onR2LClick',

      'touchstart #range-request-checkbox-label': 'onRangeClick',
      'touchstart #view-mode-radio-choice-one-label': 'onOnePageClick',
      'touchstart #view-mode-radio-choice-two-label': 'onTwoPageClick',
      'touchstart #page-direction-radio-choice-L2R-label': 'onL2RClick',
      'touchstart #page-direction-radio-choice-R2L-label': 'onR2LClick',
    };
    super(options);
  }

  initialize() {
    this.listenTo(this._setting.screenSetting(), 'change', () => {
      this.render();
    });
    this.listenTo(this._setting.unarchiverSetting(), 'change', () => {
      this.render();
    });
  }

  presenter() {
    var setting = this._setting;
    var L2R = setting.screenSetting().pageDirection() === Screen.PageDirection.L2R;
    var R2L = !L2R;
    var OnePage = setting.screenSetting().viewMode() === Screen.ViewMode.OnePage;
    var TwoPage = !OnePage;
    var enablesRangeRequestInPdf = setting.unarchiverSetting().enablesRangeRequestInPdf();
    return this._template({
      L2R: L2R,
      R2L: R2L,
      OnePage: OnePage,
      TwoPage: TwoPage,
      enablesRangeRequestInPdf: enablesRangeRequestInPdf,
    });
  }

  render() {
    super.render();
    this.$el.trigger('create');
    return this;
  }

  onRangeClick(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    var setting = this._setting.unarchiverSetting();
    var enablesRangeRequestInPdf = setting.enablesRangeRequestInPdf();
    setting.setEnablesRangeRequestInPdf(!enablesRangeRequestInPdf);
  }

  onTwoPageClick() {
    this._setting.screenSetting().setViewMode(Screen.ViewMode.TwoPage);
  }

  onOnePageClick() {
    this._setting.screenSetting().setViewMode(Screen.ViewMode.OnePage);
  }

  onL2RClick() {
    this._setting.screenSetting().setPageDirection(Screen.PageDirection.L2R);
  }

  onR2LClick() {
    this._setting.screenSetting().setPageDirection(Screen.PageDirection.R2L);
  }
}

module SettingView {
  export interface Options extends Backbone.ViewOptions {
    template: HTMLTemplate;
    setting: Setting.Setting;
  }
}
