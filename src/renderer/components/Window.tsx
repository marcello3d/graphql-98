import React, { ReactNode, useEffect } from 'react';
import styles from './Window.module.css';
import classNames from 'classnames';
import { useWindowState } from '../hooks/useWindowState';
import Icon from '../../../images/icon.png';

const minimize = window.ElectronMainApi.minimize;
const maximize = window.ElectronMainApi.maximize;
const unmaximize = window.ElectronMainApi.unmaximize;
const preventDefault = (event: React.MouseEvent) => {
  event.stopPropagation();
  event.preventDefault();
};

const onClose = () => {
  window.close();
};

export function Window({
  title,
  children,
  closable = true,
  minimizable = true,
  sizable = true,
  onQuestion,
}: {
  title: string;
  closable?: boolean;
  minimizable?: boolean;
  sizable?: boolean;
  onQuestion?: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    window.document.title = title;
  }, [title]);

  const { maximized } = useWindowState();

  return (
    <div className={classNames('window', styles.main)}>
      <div
        className="title-bar"
        onDoubleClick={maximized ? unmaximize : maximize}
      >
        <div className="title-bar-text">
          <img src={Icon} width="13" height="13" /> {title}
        </div>
        {(closable || minimizable || sizable || onQuestion) && (
          <div className="title-bar-controls">
            {minimizable && (
              <button
                aria-label="Minimize"
                onClick={minimize}
                onDoubleClick={preventDefault}
              />
            )}
            {sizable && (
              <button
                aria-label={maximized ? 'Restore' : 'Maximize'}
                onClick={maximized ? unmaximize : maximize}
                onDoubleClick={preventDefault}
              />
            )}
            {closable && (
              <button
                aria-label="Close"
                onClick={onClose}
                onDoubleClick={preventDefault}
              />
            )}
            {onQuestion && (
              <button
                aria-label="Help"
                onClick={onQuestion}
                onDoubleClick={preventDefault}
              />
            )}
          </div>
        )}
      </div>
      <main className={classNames('window-body', styles.contents)}>
        {children}
      </main>
    </div>
  );
}