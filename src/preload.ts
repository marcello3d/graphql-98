import { WindowState } from './WindowState';

declare global {
  interface Window {
    ElectronMainApi: {
      minimize(): void;
      restore(): void;
      maximize(): void;
      unmaximize(): void;
      getWindowState(): WindowState;
      subscribeWindowState(callback: (state: WindowState) => void): () => void;
    };
  }
}
