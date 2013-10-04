import $ = require('jquery');
import PDFJS = require('pdfjs');
import logger = require('utils/logger');
import Router = require('routers/router');

export = main;

function main() {
  // setting PDFJS variables
  PDFJS.workerSrc = 'assets/app/pdfjs/js/pdf.worker.js';
  PDFJS.disableWorker = false;
  PDFJS.disableAutoFetch = true;
  PDFJS.disableRange = false;

  $(() => {
    logger.info('Flowerpot starts');
    var router = new Router();
    Backbone.history.start();
  });
}
