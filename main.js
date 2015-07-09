var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.
var globalShortcut = require('global-shortcut');

// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

var initWindow = function() {
  var screen = require('screen');
  var size = screen.getPrimaryDisplay().workAreaSize;
  mainWindow = new BrowserWindow({width: 400  , height: 600, x: size.width - 400, y: 0, resizable: false, use_content_size: false, frame: false});
  mainWindow.loadUrl('file://' + __dirname + '/index.html');
  mainWindow.on('closed', function() {
    mainWindow = null;
  });
  mainWindow.on('focus', function() {
    mainWindow.webContents.send('ping', 'focus');
  });
  return mainWindow;
}

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on('ready', function() {
  // Create the browser window.
  initWindow();
  var shortcut_focus = 'ctrl+u';
  var register_focus_command = globalShortcut.register(shortcut_focus, function(){
    if (mainWindow == null) {
      initWindow();
    }
    mainWindow.focus();
  });
  if (!register_focus_command) {
   console.log('registration failed');
  }
});
