import styles from './GraphQlUrlChooser.module.css';
import { GraphQlWrapper } from './GraphQlWrapper';
import React, { ChangeEvent, FormEvent, useCallback, useState } from 'react';
import { StringParam, useQueryParam } from 'use-query-params';
import { githubUrl } from './about';
import { WhatIsThis } from './WhatIsThis';
import { HeaderEditor } from './HeaderEditor';
import {
  getHeadersStorageKey,
  GraphQlHeader,
  setLocalStorageData,
  useHeadersLocalStorage,
} from '../hooks/localStorageCache';

export function GraphQlUrlChooser() {
  const [url, setQueryUrl] = useQueryParam('url', StringParam);
  const [, setQueryPath] = useQueryParam('path', StringParam);
  const [tempChanges, setTempChanges] = useState<
    { url: string; headers?: GraphQlHeader[] } | undefined
  >(undefined);

  const tempUrl = tempChanges?.url ?? url ?? '';

  const [storedHeaders] = useHeadersLocalStorage(tempUrl || undefined);
  const tempHeaders = tempChanges?.headers ?? storedHeaders;

  const onChangeUrl = useCallback(
    (event: ChangeEvent<HTMLInputElement>) =>
      setTempChanges({
        url: event.currentTarget.value,
        headers: tempHeaders,
      }),
    [tempHeaders],
  );
  const onChangeHeaders = useCallback(
    (headers: GraphQlHeader[]) => {
      setTempChanges({
        url: tempUrl,
        headers,
      });
    },
    [tempUrl],
  );

  const goHome = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      setTempChanges(undefined);
      setQueryUrl(undefined);
      setQueryPath(undefined);
    },
    [setQueryPath, setQueryUrl],
  );

  const loadUrl = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      if (tempChanges) {
        setQueryUrl(tempChanges.url, 'replace');
        setLocalStorageData(
          getHeadersStorageKey(tempChanges.url),
          tempChanges.headers,
        );
        setTempChanges(undefined);
      }
    },
    [tempChanges, setQueryUrl],
  );

  const goToGithub = useCallback(() => {
    window.location.href = githubUrl;
  }, []);

  return (
    <>
      <div className="window">
        <div className="title-bar">
          <div className="title-bar-text">GraphQL ‘98</div>
          <div className="title-bar-controls">
            <button aria-label="Help" onClick={goToGithub} />
          </div>
        </div>
        <main className="window-body">
          <form onSubmit={loadUrl}>
            <div className={styles.urlConfig}>
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
              <button type="submit" disabled={!tempChanges}>
                Load
              </button>
            </div>
            {tempUrl && (
              <HeaderEditor headers={tempHeaders} onChange={onChangeHeaders} />
            )}
          </form>
        </main>
      </div>
      {url ? (
        <div className="window">
          <div className="title-bar">
            <div className="title-bar-text">{url}</div>
            <div className="title-bar-controls">
              <button aria-label="Close" onClick={goHome} />
            </div>
          </div>
          <main className="window-body">
            <GraphQlWrapper key={url} url={url} />
          </main>
        </div>
      ) : (
        WhatIsThis
      )}
    </>
  );
}
