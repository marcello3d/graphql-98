import React, { ChangeEvent, useCallback, useMemo } from 'react';
import { IntrospectionSchema } from 'graphql';

import { restructure } from '../lib/restructure';
import { StringParam, useQueryParam } from 'use-query-params';
import { GraphQlTypeView } from './GraphqlTypeView';
import { GraphqlSchemaView } from './GraphqlSchemaView';

export function IntrospectedGraphql({
  schema,
}: {
  schema: IntrospectionSchema;
}) {
  const restructured = useMemo(() => {
    const structure = restructure(schema);
    console.log('introspected structure', structure);
    return structure;
  }, [schema]);

  const [selectedType, setType] = useQueryParam('type', StringParam);

  const onChangeType = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      setType(event.currentTarget.value);
    },
    [setType],
  );
  return (
    <>
      <select onChange={onChangeType}>
        <option value={''}>Overview</option>
        {restructured.queryTypes.map(({ type }) => (
          <option key={type} value={type} selected={type === selectedType}>
            ⮑ {type}
          </option>
        ))}
      </select>
      {selectedType ? (
        <GraphQlTypeView structure={restructured} type={selectedType} />
      ) : (
        <GraphqlSchemaView structure={restructured} />
      )}
    </>
  );
}
