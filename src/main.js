'use strict';
const app = require('app');
const BrowserWindow = require('browser-window');

// report crashes to the Electron project
require('crash-reporter').start();

// adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

import ipc from 'ipc';

var selectedDisplay = {bounds: {x: 0, y: 0, width: 600, height: 400}};

ipc.on('display-selected', function(event, data) {
	console.log(data.display);
	selectedDisplay = data.display;
});

var rootDirectory = __dirname;
var rootDirectory = '/mnt/Peng/Jordan/Dropbox_jordanjklassen_gmail/Dropbox';
ipc.on('set-root-directory', function(event, data) {
	rootDirectory = data.root;
})

ipc.on('get-root-directory', function(event) {
	event.returnValue = rootDirectory;
})

var presentationWin = null;
ipc.on('start-presentation', function() {
	if (presentationWin != null) {
		presentationWin.close();
		return;
	}
	presentationWin = new BrowserWindow({
		x: selectedDisplay.bounds.x,
		y: selectedDisplay.bounds.y,
		width: selectedDisplay.bounds.width,
		height: selectedDisplay.bounds.height,
		'use-content-size': true,
		fullscreen: true,
		frame: false,
		'page-visibility': true
	});
	presentationWin.setMenuBarVisibility(false);
	presentationWin.hide();
	// presentationWin.setFullScreen(false);
	presentationWin.webContents.insertCSS('html, body { background: #000; }');
	presentationWin.loadUrl(`file://${__dirname}/presenter/index.html`);
	presentationWin.webContents.insertCSS('html, body { background: #000; }');
	presentationWin.on('closed', function() { presentationWin = null; })
	presentationWin.webContents.on('dom-ready', function() {presentationWin.show();});
});

function createMainWindow () {
	const win = new BrowserWindow({
		width: 600,
		height: 400
	});

	win.loadUrl(`file://${__dirname}/creator/index.html`);
	win.on('closed', onClosed);

	return win;
}

function onClosed() {
	// deref the window
	// for multiple windows store them in an array
	mainWindow = null;
}

// prevent window being GC'd
let mainWindow;

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate-with-no-open-windows', function () {
	if (!mainWindow) {
		mainWindow = createMainWindow();
	}
});

app.on('ready', function () {
	mainWindow = createMainWindow();
});
