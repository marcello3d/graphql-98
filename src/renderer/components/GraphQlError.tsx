import React, { useMemo } from 'react';
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
  const errorText = useMemo(() => {
    let errorObject =
      error.httpError?.body ?? error.fetchError?.toString() ?? error;
    if (typeof errorObject === 'string') {
      try {
        errorObject = JSON.parse(errorObject);
      } catch (e) {}
    }
    return JSON.stringify(errorObject, undefined, 2);
  }, []);
  return (
    <fieldset>
      <legend className={styles.errorText}>
        {title}
        {error.httpError && `: ${error.httpError.status} HTTP Error`}
        {error.fetchError && `: Network Error`}
      </legend>
      <pre>{errorText}</pre>
      {note && <div>{note}</div>}
    </fieldset>
  );
}
