import React, { ChangeEvent, FormEvent, useCallback, useState } from 'react';
import { StringParam, useQueryParam } from 'use-query-params';
import { RouteComponentProps } from '@reach/router';

import styles from './GraphQl98.module.css';
import { GraphqlWrapper } from './GraphqlWrapper';

export function GraphQl98(props: RouteComponentProps) {
  const [url, setQueryUrl] = useQueryParam('url', StringParam);
  const [tempUrl, setTempUrl] = useState(url ?? '');

  const onChangeUrl = useCallback(
    (event: ChangeEvent<HTMLInputElement>) =>
      setTempUrl(event.currentTarget.value),
    [],
  );
  const loadUrl = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      setQueryUrl(tempUrl, 'replace');
    },
    [tempUrl, setQueryUrl],
  );
  return (
    <div className="window">
      <div className="title-bar">
        <div className="title-bar-text">GraphQL '98</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" />
          <button aria-label="Maximize" />
          <button aria-label="Close" />
        </div>
      </div>
      <header className="window-body">
        <form onSubmit={loadUrl} className={styles.urlConfig}>
          <label>
            Url:{' '}
            <input
              type="text"
              placeholder="GraphQL endpoint"
              value={tempUrl}
              onChange={onChangeUrl}
            />
          </label>
          <button>Go ➡</button>
        </form>
      </header>
      <main className={styles.main}>{url && <GraphqlWrapper url={url} />}</main>

      <footer className={styles.footer}>
        <a href="https://github.com/marcello3d/graphql-browser">
          Source on Github
        </a>
      </footer>
    </div>
  );
}
