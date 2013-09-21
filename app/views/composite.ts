import $ = require('jquery');
import _ = require('underscore');
import Backbone = require('backbone');
import BaseView = require('views/base');

export = CompositeView;

class CompositeView extends BaseView {
  subViews: {[selector:string]:BaseView;};

  constructor(options?: Backbone.ViewOptions) {
    this.subViews = {};
    super(options);
  }

  render() {
    super.render();
    _.each(this.subViews, (view, selector) => {
      view.setElement(this.$(selector)).render();
    });
    return this;
  }

  assign(selector: string, view: BaseView): void {
    this.subViews[selector] = view;
  }

  close() {
    super.close();
    _.each(this.subViews, (view, selector) => {
      view.close();
    });
    return this;
  }
 }



