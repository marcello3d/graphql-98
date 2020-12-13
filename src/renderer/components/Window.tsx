import React, { ReactNode, useEffect } from 'react';
import styles from './Window.module.css';
import classNames from 'classnames';
import { useWindowState } from '../hooks/useWindowState';
import Icon from '../../icon.png';
import { version } from '../../../package.json';

const minimize = window.ElectronMainApi.minimize;
const maximize = window.ElectronMainApi.maximize;
const unmaximize = window.ElectronMainApi.unmaximize;

const close = (event: React.MouseEvent) => {
  event.stopPropagation();
  event.preventDefault();
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
    <div
      className={classNames('window', styles.main, {
        [styles.maximized]: maximized,
      })}
    >
      <div
        className="title-bar"
        onDoubleClick={maximized ? unmaximize : maximize}
      >
        <div className="title-bar-text">
          <span>
            <img
              src={Icon}
              width="13"
              height="13"
              alt="GraphQL App Icon"
              onDoubleClick={close}
            />{' '}
            {title}
          </span>
        </div>
        {(closable || minimizable || sizable || onQuestion) && (
          <div className="title-bar-controls">
            <span className={styles.version}>v{version}</span>
            {minimizable && <button aria-label="Minimize" onClick={minimize} />}
            {sizable && (
              <button
                aria-label={maximized ? 'Restore' : 'Maximize'}
                onClick={maximized ? unmaximize : maximize}
              />
            )}
            {closable && <button aria-label="Close" onClick={close} />}
            {onQuestion && <button aria-label="Help" onClick={onQuestion} />}
          </div>
        )}
      </div>
      <main className={classNames('window-body', styles.contents)}>
        {children}
      </main>
    </div>
  );
}
