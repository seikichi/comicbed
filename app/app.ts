import $ = require('jquery');
import IScroll = require('iscroll');

import Setting = require('models/setting');
import Unarchiver = require('models/unarchiver');
import Reader = require('models/reader');
import Book = require('models/book');
import Scaler = require('models/scaler');
import Screen = require('models/screen');
import Screens = require('collections/screens');

import ScreenView = require('views/screen');
import ScreenCollectionView = require('views/screens');

import templates = require('templates');

$(() => {
  // var URL = 'tmp/yuyushiki04.pdf';
  var URL = 'tmp/jwa.pdf';
  var $flowerpot = $('#flowerpot');

  var size = { width: $flowerpot.width(), height: $flowerpot.height() };
  var setting = Setting.createFromQueryString('');
  var bookFactory = Book.createFactory(Unarchiver.createFactory(setting.unarchiverSetting()));
  var scaler = Scaler.create(setting.scalerSetting());
  var screenFactory = Screen.createFactory(scaler, setting.screenSetting());
  var screens = Screens.create(size, screenFactory);

  var reader = Reader.create(bookFactory, screens);
  var view = new ScreenCollectionView({
    el: $flowerpot,
    screens: screens,
    setting: setting.screenSetting(),
    mover: reader,
    template: templates.screens,
  });
  reader.openURL(URL).then(() => {});

  (<any>window).reader = reader;
});
