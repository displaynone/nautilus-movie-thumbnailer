import { app, BrowserWindow, ipcMain, net } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
	app.quit();
}

const createWindow = (): void => {
	// Create the browser window.
	const mainWindow = new BrowserWindow({
		height: 1000,
		width: 800,
		webPreferences: {
			preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
		},
	});

	// and load the index.html of the app.
	mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

	// Open the DevTools.
	// mainWindow.webContents.openDevTools();

	mainWindow.webContents.on('did-finish-load', () => {
		const selectedURIs = process.argv.slice(2);
		if (selectedURIs.length > 0) {
			mainWindow.webContents.send('cli-args', selectedURIs[0]);
		}
	});
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

ipcMain.handle('fetch-data', async (event, url) => {
	return new Promise((resolve, reject) => {
		const request = net.request(url);

		request.on('response', (response) => {
			let data = '';

			response.on('data', (chunk) => {
				data += chunk;
			});

			response.on('end', () => {
				resolve(data);
			});

			response.on('error', (error: Error) => {
				reject(error);
			});
		});

		request.end();
	});
});

ipcMain.handle('download-image', async (event, imageUrl, fileName) => {
	return new Promise((resolve, reject) => {
		const request = net.request(imageUrl);

		request.on('response', (response) => {
			if (response.statusCode !== 200) {
				reject(new Error(`Failed to download image: ${response.statusCode}`));
				return;
			}

			const userHomeDir = os.homedir();
			const filePath = path.join(
				userHomeDir,
				'/.cache/thumbnails/large/',
				fileName + '.png',
			);
			console.log({ filePath });
			const fileStream = fs.createWriteStream(filePath);

			response.on('data', (chunk) => {
				fileStream.write(chunk);
			});

			response.on('end', () => {
				fileStream.end();
				resolve({ success: true, filePath });
			});

			response.on('error', (error: Error) => {
				fs.unlink(filePath, () => reject(error));
			});
		});

		request.end();
	});
});
