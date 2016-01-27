'use strict';

// Electron modules
var app            = require('app'),
    BrowserWindow  = require('browser-window'),
    ipc            = require('ipc');

// NPM modules
var applescript = require('applescript');

var main_window = null;

app.on('ready', function () {
  // Create the main window
  main_window = new BrowserWindow({
    width:  900,
    height: 800,
    'title-bar-style': 'hidden'
  });

  main_window.loadUrl('file://' + __dirname + '/html/index.html');
});

//////////////////////////////////// Events ////////////////////////////////////

// // Scroll window
// ipc.on('scroll', function (should) {
//   // Not really necessary
//   applescript.execFile(__dirname + '/scroll.scpt', function (err, value) {
//     if (err) console.log('Error:', err);
//   });
// });
