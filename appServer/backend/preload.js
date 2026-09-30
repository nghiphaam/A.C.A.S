import { contextBridge, ipcRenderer, shell } from 'electron';

const invoke = (channel) => (...args) => ipcRenderer.invoke(channel, ...args);
const subscribe = (channel) => (callback) =>
	ipcRenderer.on(channel, (_event, data) => callback(data));

contextBridge.exposeInMainWorld('engineAPI', {
	killAllEngines: invoke('killAllEngines'),
    clearCache: invoke('clearCache'),
	getSavedEngines: invoke('getSavedEngines'),
	sendManualUciToEngine: invoke('sendManualUciToEngine'),
	addEngine: invoke('addEngine'),
	removeEngine: invoke('removeEngine'),
	onRenderEngineGrid: subscribe('renderEngineGrid'),
	onAddConsoleView: subscribe('addConsoleView'),
	onRemoveConsoleView: subscribe('removeConsoleView'),
	onRefreshEngineCards: subscribe('refreshEngineCards'),
	onLog: subscribe('log')
});

contextBridge.exposeInMainWorld('serverAPI', {
	onListening: subscribe('serverListening'),
	onClientChange: subscribe('serverClientChange'),
	onUnauthorized: subscribe('serverUnauthorized'),
	sendEnginesList: invoke('sendEnginesList')
});

contextBridge.exposeInMainWorld('fileAPI', {
	pickFile: invoke('pickFile')
});

contextBridge.exposeInMainWorld('toastAPI', {
	onMessage: subscribe('toast')
});

contextBridge.exposeInMainWorld('electronAPI', {
	openExternal: (url) => shell.openExternal(url)
});
