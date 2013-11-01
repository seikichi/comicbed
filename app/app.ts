import Promise = require('promise');
import FlowerpotRouter = require('routers/router');

$(() => {
  Promise.longStackTraces();
  var router = new FlowerpotRouter();
  Backbone.history.start();
});
