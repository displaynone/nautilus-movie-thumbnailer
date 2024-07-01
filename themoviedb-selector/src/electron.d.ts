interface ElectronAPI {
	receiveCliArgs: (callback: (args: string) => void) => void;
	downloadImage: (
		imageUrl: string,
		fileName: string,
	) => Promise<{ success: boolean; filePath: string }>;
}

interface Window {
	electron: ElectronAPI;
}

interface Api {
	fetchData: (url: string) => Promise<string>;
}

interface Window {
	api: Api;
}
