import React, { useCallback, useMemo } from 'react';
import { IntrospectionSchema } from 'graphql';

import { restructure } from '../lib/restructure';
import { StringParam, useQueryParam } from 'use-query-params';
import { GraphQlTypeView } from './GraphQlTypeView';
import { GraphQlSchemaView } from './GraphQlSchemaView';
import { stringify } from 'query-string';
import { Link } from '@reach/router';

export function IntrospectedGraphQl({
  url,
  schema,
}: {
  url: string;
  schema: IntrospectionSchema;
}) {
  const [queryPath, setQueryPath] = useQueryParam('path', StringParam);

  const structure = useMemo(() => restructure(schema), [schema]);
  console.log('structure', structure);

  const goRoot = useCallback(() => {
    setQueryPath(undefined);
  }, [setQueryPath]);

  const path = useMemo(() => (queryPath ? queryPath.split('.') : []), [
    queryPath,
  ]);
  return (
    <>
      <fieldset>
        <legend>Navigation</legend>
        <button onClick={goRoot} disabled={!queryPath}>
          Overview
        </button>
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
      </fieldset>
      {queryPath ? (
        <GraphQlTypeView url={url} structure={structure} path={path} />
      ) : (
        <GraphQlSchemaView url={url} structure={structure} />
      )}
    </>
  );
}
