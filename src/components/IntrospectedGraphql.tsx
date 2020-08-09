import React, { useMemo } from 'react';
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

  const [type, setType] = useQueryParam('type', StringParam);

  if (type) {
    return <GraphQlTypeView structure={restructured} type={type} />;
  }

  return <GraphqlSchemaView structure={restructured} />;
}
