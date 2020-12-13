import React, { useCallback, useState } from 'react';
import { RouteComponentProps } from '@reach/router';
import { Window } from '../components/Window';
import { SampleUrls } from '../components/SampleUrls';
import styles from '../components/GraphQlUrlChooser.module.css';
import { getGraphQlBrowserUrl } from './urls';

export function WelcomePage(_: RouteComponentProps) {
  return (
    <Window title="Welcome to GraphQL ‘98">
      <p>
        GraphQL ‘98 is an open-source visual data explorer. Inspired by SQL GUIs
        like{' '}
        <a href="https://tableplus.com" target="_blank">
          TablePlus
        </a>{' '}
        and{' '}
        <a href="https://www.phpmyadmin.net" target="_blank">
          phpMyAdmin
        </a>
        , but designed for GraphQL.
      </p>
      <h2>Why?</h2>
      <p>
        I'm in the process of learning more about GraphQL.{' '}
        <a href="https://github.com/graphql/graphiql" target="_blank">
          GraphiQL
        </a>{' '}
        and{' '}
        <a
          href="https://github.com/prisma-labs/graphql-playground"
          target="_blank"
        >
          GraphQL Playground
        </a>{' '}
        are great at providing a command-line/programming interface to GraphQL.
        But I wanted something that lets me <i>see</i> the data without typing
        queries.
      </p>

      <h2>Open URL</h2>
      <p>
        <UrlChooser />
      </p>
      <h2>Quick start</h2>
      <p>
        Here are some public GraphQL endpoints to try courtesy of{' '}
        <a href="https://github.com/APIs-guru/graphql-apis" target="_blank">
          APIs-guru
        </a>
        :
      </p>
      <SampleUrls />
    </Window>
  );
}

function UrlChooser() {
  const [endpointUrl, setEndpointUrl] = useState('');
  const onChangeUrl = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setEndpointUrl(event.currentTarget.value);
    },
    [],
  );
  const loadUrl = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      window.open(getGraphQlBrowserUrl(endpointUrl));
    },
    [endpointUrl],
  );

  return (
    <form onSubmit={loadUrl} className={styles.urlConfig}>
      <label htmlFor="url">GraphQL Endpoint URL:</label>
      <div className={styles.locationBox}>
        <input
          id="url"
          type="text"
          className={styles.urlInput}
          placeholder="GraphQL endpoint"
          value={endpointUrl}
          onChange={onChangeUrl}
        />
      </div>
      <button type="submit" disabled={!endpointUrl}>
        Load
      </button>
    </form>
  );
}
