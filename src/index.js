import { app, BrowserWindow, dialog, ipcMain } from "electron";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
	// eslint-disable-line global-require
	app.quit();
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const createWindow = () => {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 600,
		height: 300,
		// transparent: true
		frame: false,
		resizable: false,
		backgroundColor: '#3b3f51'
	});

	// and load the index.html of the app.
	mainWindow.loadURL(`file://${__dirname}/index.html`);

	// Open the DevTools.
	// mainWindow.webContents.openDevTools();

	// Emitted when the window is closed.
	mainWindow.on("closed", () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null;
	});

	// //////////////////////////////
	// var subWindow = new BrowserWindow({
	// 	width: 600,
	// 	height: 300,
	// 	webPreferences:{
	// 		allowRunningInsecureContent: true,
	// 		devTools: true,
	// 	}
	// });
	// subWindow.webContents.openDevTools();
	// subWindow.loadURL(`https://item.taobao.com/item.htm?id=566046052875&ali_refid=a3_420432_1006:1124987052:N:logo%E8%AE%BE%E8%AE%A1:ea8e5210bb515a4f5c8449faa3ab578d&ali_trackid=1_ea8e5210bb515a4f5c8449faa3ab578d&spm=a230r.1.14.6#detail`,
	// {
	// 	baseURLForDataURL: 'fuck'
	// });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) {
		createWindow();
	}
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
ipcMain.on('open-directory-dialog', function (event, p) {
	dialog.showOpenDialog({
		properties: [p]
	}, function (files) {
		if (files) {// 如果有选中
			// 发送选择的对象给子进程
			event.sender.send('selectedItem', files[0])
		}
	})
});

ipcMain.on('window-close',function(){
	mainWindow.close();
});