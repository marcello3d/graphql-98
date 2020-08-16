import styles from './GraphQlUrlChooser.module.css';
import { GraphQlWrapper } from './GraphQlWrapper';
import { SampleUrls } from './SampleUrls';
import React, {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { StringParam, useQueryParam } from 'use-query-params';

export function GraphQlUrlChooser() {
  const [url, setQueryUrl] = useQueryParam('url', StringParam);
  const [, setQueryPath] = useQueryParam('path', StringParam);
  const [tempUrl, setTempUrl] = useState(url ?? 'https://');
  useEffect(() => {
    if (url) {
      setTempUrl(url);
    }
  }, [url, setTempUrl]);

  const onChangeUrl = useCallback(
    (event: ChangeEvent<HTMLInputElement>) =>
      setTempUrl(event.currentTarget.value),
    [],
  );

  const goHome = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      setTempUrl('');
      setQueryUrl(undefined);
      setQueryPath(undefined);
    },
    [setQueryPath, setQueryUrl],
  );

  const loadUrl = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      setQueryUrl(tempUrl, 'replace');
    },
    [tempUrl, setQueryUrl],
  );

  return (
    <>
      <div className="window">
        <div className="title-bar">
          <div className="title-bar-text">GraphQL ‘98</div>
          <div className="title-bar-controls">
            <button aria-label="Help" disabled />
            <button aria-label="Close" disabled />
          </div>
        </div>
        <main className="window-body">
          <form onSubmit={loadUrl} className={styles.urlConfig}>
            <button type="button" disabled={!url} onClick={goHome}>
              Home
            </button>
            <div> </div>
            <label htmlFor="url">Endpoint URL:</label>
            <div className={styles.locationBox}>
              <input
                id="url"
                type="text"
                className={styles.urlInput}
                placeholder="GraphQL endpoint"
                value={tempUrl}
                onChange={onChangeUrl}
              />
            </div>
            <button type="submit" disabled={!tempUrl || tempUrl === url}>
              Load
            </button>
          </form>
        </main>
      </div>
      {url ? (
        <div className="window">
          <div className="title-bar">
            <div className="title-bar-text">{url}</div>
            <div className="title-bar-controls">
              <button aria-label="Help" disabled />
              <button aria-label="Close" onClick={goHome} />
            </div>
          </div>
          <main className="window-body">
            <GraphQlWrapper key={url} url={url} />
          </main>
        </div>
      ) : (
        <div className="window">
          <div className="title-bar">
            <div className="title-bar-text">Here are some schemas to try…</div>
            <div className="title-bar-controls">
              <button aria-label="Help" disabled />
              <button aria-label="Close" disabled />
            </div>
          </div>
          <main className="window-body">
            <SampleUrls />
          </main>
        </div>
      )}
    </>
  );
}
