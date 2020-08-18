import React, { useMemo } from 'react';
import { IntrospectionSchema } from 'graphql';

import styles from './IntrospectedGraphQl.module.css';

import { restructure } from '../lib/restructure';
import { StringParam, useQueryParam } from 'use-query-params';
import { GraphQlTypeView } from './GraphQlTypeView';
import { GraphQlSchemaView } from './GraphQlSchemaView';
import { stringify } from 'query-string';
import { Link } from '@reach/router';
import { useSchemaFetchedAt } from './localStorageCache';

// @ts-ignore
const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: 'numeric',
});
// @ts-ignore
const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'short' });

export function IntrospectedGraphQl({
  url,
  reloadSchema,
  schema,
}: {
  url: string;
  reloadSchema: () => void;
  schema: IntrospectionSchema;
}) {
  const [queryPath] = useQueryParam('path', StringParam);

  const structure = useMemo(() => restructure(schema), [schema]);

  const path = useMemo(() => (queryPath ? queryPath.split('.') : []), [
    queryPath,
  ]);

  const fetchedAt = useSchemaFetchedAt(url);

  const loadInfo = useMemo(() => {
    if (!fetchedAt) {
      return null;
    }
    const dateFormat = dateFormatter.format(fetchedAt);
    const sameDay = dateFormat === dateFormatter.format(Date.now());
    return `Schema cached @ ${
      sameDay ? timeFormatter.format(fetchedAt) : dateFormat
    }`;
  }, [fetchedAt]);

  return (
    <>
      <fieldset>
        <legend>Navigation</legend>
        <div className={styles.nav}>
          <div className={styles.navLeft}>
            {path.length === 0 ? (
              <b>Overview</b>
            ) : (
              <Link to={`/?${stringify({ url })}`}>Overview</Link>
            )}
            {path.length > 0 && (
              <>
                {' : '}
                {path.map((item, index) => (
                  <React.Fragment key={index}>
                    {index > 0 ? ' / ' : ''}
                    {index === path.length - 1 ? (
                      <b>{item}</b>
                    ) : (
                      <Link
                        to={`/?${stringify({
                          url,
                          path:
                            index === 0
                              ? undefined
                              : path.slice(0, index + 1).join('.'),
                        })}`}
                      >
                        {item}
                      </Link>
                    )}
                  </React.Fragment>
                ))}
              </>
            )}
          </div>
          <div className={styles.navRight}>
            {loadInfo} <button onClick={reloadSchema}>Reload</button>
          </div>
        </div>
      </fieldset>
      {queryPath ? (
        <GraphQlTypeView url={url} structure={structure} path={path} />
      ) : (
        <GraphQlSchemaView url={url} structure={structure} />
      )}
    </>
  );
}
