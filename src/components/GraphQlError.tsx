import React from 'react';
import { APIError } from 'graphql-hooks';
import styles from './GraphQlError.module.css';

export function GraphQlError({
  title,
  error,
  note,
}: {
  title: string;
  note?: string;
  error: APIError;
}) {
  return (
    <fieldset>
      <legend className={styles.errorText}>
        {title}
        {error.httpError && `: ${error.httpError.status} HTTP Error`}
        {error.fetchError && `: Network Error`}
      </legend>
      {error.httpError ? (
        <pre>{error.httpError.body}</pre>
      ) : error.fetchError ? (
        <pre>{error.fetchError.toString()}</pre>
      ) : (
        <pre>{JSON.stringify(error, undefined, 2)}</pre>
      )}
      {note && <div>{note}</div>}
    </fieldset>
  );
}
