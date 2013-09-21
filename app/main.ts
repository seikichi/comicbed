import $ = require('jquery');
import PDFJS = require('pdfjs');
import Book = require('models/book');
import logger = require('utils/logger');
import Router = require('routers/router');

export = main;

function main() {
  // setting PDFJS variables
  PDFJS.workerSrc = 'assets/app/pdfjs/js/pdf.worker.js';
  // PDFJS.disableWorker = true;
  PDFJS.disableAutoFetch = true;
  PDFJS.disableRange = false;

  $(() => {
    var router = new Router();
    Backbone.history.start();
  });
}


