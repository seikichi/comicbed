import FlowerpotRouter = require('routers/router');

$(() => {
  var router = new FlowerpotRouter();
  Backbone.history.start();
});
