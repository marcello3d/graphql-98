import React, { useMemo } from 'react';
import { IntrospectionSchema } from 'graphql';

import { restructure } from '../lib/restructure';

export function IntrospectedGraphql({
  schema,
}: {
  schema: IntrospectionSchema;
}) {
  const restructured = useMemo(() => {
    const structure = restructure(schema);
    console.log('structure', structure);
    return structure;
  }, [schema]);
  return <div>got a schema!</div>;
}
