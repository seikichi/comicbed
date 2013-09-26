import log4javascript = require('log4javascript');

var logger: log4javascript.Log4Javascript = {
  trace: (...messages: string[]) => {},
  debug: (...messages: string[]) => {},
  info: (...messages: string[]) => {},
  warn: (...messages: string[]) => {},
  error: (...messages: string[]) => {},
  fatal: (...messages: string[]) => {},
};

// @ifdef DEBUG
var logger = log4javascript.getDefaultLogger();
// @endif
(() => {}());
// if above line is empty, @endif comment is remove by tsc (TODO(seikichi): fix ...???)

export = logger;

