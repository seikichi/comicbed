import _ = require('underscore');
import Backbone = require('backbone');
import querystring = require('utils/querystring');
import BaseView = require('views/base');
import FlowerpotView = require('views/flowerpot');

class FlowerpotRouter extends Backbone.Router {
  private routes: {[route:string]: string};
  private currentView: BaseView;

  constructor() {
    this.routes = {
      '(?*querystring)': 'index',
    };
    this.currentView = null;
    super();
  }

  private index(query: string) {
    if (_.isEmpty(query)) { query = ''; }
    if (!_.isNull(this.currentView)) { this.currentView.close(); }
    var querydict = querystring.parse(query);
    this.currentView = new FlowerpotView(querydict);
    this.currentView.render();
  }
}

export = FlowerpotRouter;
