import { WindowState } from '../../WindowState';
import { useEffect, useState } from 'react';

export function useWindowState(): WindowState {
  const [windowState, setWindowState] = useState(
    window.ElectronMainApi.getWindowState(),
  );

  useEffect(() => window.ElectronMainApi.subscribeWindowState(setWindowState));

  return windowState;
}
