import _ = require('underscore');
import Backbone = require('backbone');
import querystring = require('utils/querystring');

class FlowerpotRouter extends Backbone.Router {
  private routes: {[route:string]: string};

  constructor() {
    this.routes = {
      '(?*querystring)': 'index',
    };
    super();
  }

  private index(query: string) {
    if (_.isEmpty(query)) { query = ''; }
    console.log('querystring:', querystring.parse(query));
  }
}

export = FlowerpotRouter;
