import React, {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { StringParam, useQueryParam } from 'use-query-params';
import { RouteComponentProps } from '@reach/router';

import styles from './GraphQl98.module.css';
import { GraphqlWrapper } from './GraphqlWrapper';

export function GraphQl98(props: RouteComponentProps) {
  const [url, setQueryUrl] = useQueryParam('url', StringParam);
  const [type] = useQueryParam('type', StringParam);
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
  const titleParts = [`GraphQL ‘98`];
  if (url) {
    titleParts.push(url);
  }
  if (type) {
    titleParts.push(type);
  }
  const title = titleParts.join(' - ');
  useEffect(() => {
    window.document.title = title;
  }, [title]);

  return (
    <div className={styles.main}>
      <div className="window">
        <div className="title-bar">
          <div className="title-bar-text">{title} </div>
          <div className="title-bar-controls">
            <button aria-label="Help" disabled />
            <button aria-label="Close" disabled />
          </div>
        </div>
        <main className="window-body">
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
          {url && <GraphqlWrapper url={url} />}
        </main>
      </div>
      <div className="window">
        <div className="title-bar">
          <div className="title-bar-text">About</div>
          <div className="title-bar-controls">
            <button aria-label="Help" disabled />
            <button aria-label="Close" disabled />
          </div>
        </div>
        <footer className="window-body">
          Developed by <a href="https://marcello.cellosoft.com/">Marcello</a>{' '}
          for funsies. Source on{' '}
          <a href="https://github.com/marcello3d/graphql-browser">Github</a>
        </footer>
      </div>
    </div>
  );
}
