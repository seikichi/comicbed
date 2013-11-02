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
    if (selector in this.subViews) { this.dissociate(selector); }
    this.subViews[selector] = view;
  }

  dissociate(selector: string): void {
    var view = this.subViews[selector];
    if (view) {
      view.close();
    }
    delete this.subViews[selector];
  }

  close(): void {
    super.close();
    _.each(this.subViews, (view, selector) => {
      view.close();
    });
    this.subViews = null;
  }
 }



