import { contextBridge, ipcRenderer } from 'electron';
import { WindowState } from '../WindowState';

let windowState: WindowState = {
  maximized: false,
  fullscreen: false,
  fullscreenable: false,
};
const subscribers = new Set<(state: WindowState) => void>();
ipcRenderer.on('window-state', (event, _windowState) => {
  windowState = _windowState;
  for (const subscriber of subscribers) {
    subscriber(windowState);
  }
});

contextBridge.exposeInMainWorld('ElectronMainApi', {
  minimize: () => ipcRenderer.invoke('minimize'),
  restore: () => ipcRenderer.invoke('restore'),
  maximize: () => ipcRenderer.invoke('maximize'),
  unmaximize: () => ipcRenderer.invoke('unmaximize'),
  getWindowState: () => windowState,
  subscribeWindowState: (callback: (windowState: WindowState) => void) => {
    subscribers.add(callback);
    return () => {
      subscribers.delete(callback);
    };
  },
});
