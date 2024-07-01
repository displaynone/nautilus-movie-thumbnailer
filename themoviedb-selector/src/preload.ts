// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
	receiveCliArgs: (callback: (args: string[]) => void) =>
		ipcRenderer.on('cli-args', (_, args) => callback(args)),
	downloadImage: async (imageUrl: string, fileName: string) => {
		try {
			const response = await ipcRenderer.invoke(
				'download-image',
				imageUrl,
				fileName,
			);
			return response;
		} catch (error) {
			console.error(error);
			throw error;
		}
	},
});

contextBridge.exposeInMainWorld('api', {
	fetchData: async (url: string) => {
		try {
			const response = await ipcRenderer.invoke('fetch-data', url);
			return response;
		} catch (error) {
			console.error(error);
			throw error;
		}
	},
});
