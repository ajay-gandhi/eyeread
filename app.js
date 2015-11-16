'use strict';

// Electron modules
var app            = require('app'),
    BrowserWindow  = require('browser-window'),
    Tray           = require('tray'),
    Menu           = require('menu'),
    globalShortcut = require('global-shortcut');

var main_window  = null,
    menubar      = null,
    login_window = null;

app.on('ready', function() {
  // Create the main window
  main_window = new BrowserWindow({
    width:  900,
    height: 800,
    'title-bar-style': 'hidden'
  });

  main_window.loadUrl('file://' + __dirname + '/html/index.html');
});
