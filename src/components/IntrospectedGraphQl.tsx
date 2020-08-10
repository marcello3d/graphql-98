import React, { ChangeEvent, useCallback, useMemo } from 'react';
import { IntrospectionSchema } from 'graphql';

import { restructure } from '../lib/restructure';
import { StringParam, useQueryParam } from 'use-query-params';
import { GraphQlTypeView } from './GraphQlTypeView';
import { GraphQlSchemaView } from './GraphQlSchemaView';

export function IntrospectedGraphQl({
  schema,
}: {
  schema: IntrospectionSchema;
}) {
  const [queryType, setQueryType] = useQueryParam('type', StringParam);

  const structure = useMemo(() => restructure(schema), [schema]);

  const onChangeType = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      setQueryType(event.currentTarget.value);
    },
    [setQueryType],
  );

  const goRoot = useCallback(() => {
    setQueryType(undefined);
  }, [setQueryType]);

  return (
    <>
      <fieldset>
        <legend>Navigation</legend>
        <button onClick={goRoot} disabled={!queryType}>
          Overview
        </button>
        {queryType && (
          <>
            {' : '}
            <select onChange={onChangeType} value={queryType ?? ''}>
              {structure.queryTypes.map(({ type }) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </>
        )}
      </fieldset>
      {queryType ? (
        <GraphQlTypeView structure={structure} type={queryType} />
      ) : (
        <GraphQlSchemaView structure={structure} />
      )}
    </>
  );
}
