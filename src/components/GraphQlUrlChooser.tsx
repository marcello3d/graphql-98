import styles from './GraphQlUrlChooser.module.css';
import { GraphqlWrapper } from './GraphqlWrapper';
import { SampleUrls } from './SampleUrls';
import React, {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { StringParam, useQueryParam } from 'use-query-params';
import { useStorageState } from 'react-storage-hooks';
import { IntrospectionSchema } from 'graphql';
import { stringify } from 'query-string';

// @ts-ignore
const timeFormatter = new Intl.DateTimeFormat('en-US', { timeStyle: 'short' });
// @ts-ignore
const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'short' });

export function GraphQlUrlChooser() {
  const [url, setQueryUrl] = useQueryParam('url', StringParam);
  const [, setQueryType] = useQueryParam('type', StringParam);
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
      setQueryType(undefined);
    },
    [setQueryType, setQueryUrl],
  );

  const [storedState, setStoredState, writeError] = useStorageState<{
    loadDateNow?: number;
    schema?: IntrospectionSchema;
  }>(localStorage, `GraphQL98.schema:${stringify({ url })}`, {});

  useEffect(() => {
    if (writeError) {
      console.error(`Storage write error:`, writeError);
    }
  }, [writeError]);

  const loadOrReloadUrl = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      if (url === tempUrl && storedState.schema) {
        setStoredState({});
      } else {
        setQueryUrl(tempUrl, 'replace');
      }
    },
    [url, tempUrl, storedState.schema, setStoredState, setQueryUrl],
  );

  const loadInfo = useMemo(() => {
    if (!storedState.loadDateNow) {
      return null;
    }
    const loadDate = new Date(storedState.loadDateNow);
    const sameDay = loadDate.toDateString() === new Date().toDateString();
    return (
      <div className={styles.loadInfo}>
        Schema cached @{' '}
        {sameDay
          ? timeFormatter.format(loadDate)
          : dateFormatter.format(loadDate)}
      </div>
    );
  }, [storedState.loadDateNow]);

  const setSchema = useCallback(
    (schema: IntrospectionSchema) => {
      setStoredState({ loadDateNow: Date.now(), schema });
    },
    [setStoredState],
  );

  return (
    <>
      <div className="window">
        <div className="title-bar">
          <div className="title-bar-text">GraphQL 98</div>
          <div className="title-bar-controls">
            <button aria-label="Help" disabled />
            <button aria-label="Close" disabled />
          </div>
        </div>
        <main className="window-body">
          <form onSubmit={loadOrReloadUrl} className={styles.urlConfig}>
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
              {url === tempUrl && loadInfo}
            </div>
            <button>
              {url === tempUrl && storedState.schema ? 'Reload' : 'Load'}
            </button>
            <button disabled={!url} onClick={goHome}>
              Home
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
            <GraphqlWrapper
              url={url}
              storedSchema={storedState.schema}
              setSchema={setSchema}
            />
          </main>
        </div>
      ) : (
        <div className="window">
          <div className="title-bar">
            <div className="title-bar-text">
              Example GraphQL schemas to try out
            </div>
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
