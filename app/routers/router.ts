import Backbone = require('backbone');

export class FlowerpotRouter extends Backbone.Router {
  private routes: {[route:string]: string};

  constructor() {
    this.routes = {
      '': '',
      '?*queryString': '',
    };
    super();
  }
}



