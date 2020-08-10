import React, { useEffect, useMemo } from 'react';
import { ClientContext, GraphQLClient, useManualQuery } from 'graphql-hooks';

import {
  getIntrospectionQuery,
  IntrospectionQuery,
  IntrospectionSchema,
} from 'graphql';
import { IntrospectedGraphql } from './IntrospectedGraphql';

const introspectionQuery = getIntrospectionQuery({
  descriptions: false,
});

export function GraphqlWrapper({
  url,
  storedSchema,
  setSchema,
}: {
  url: string;
  storedSchema?: IntrospectionSchema;
  setSchema: (schema: IntrospectionSchema) => void;
}) {
  const client = useMemo(() => new GraphQLClient({ url }), [url]);

  const [downloadSchema, { error, loading, data }] = useManualQuery<
    IntrospectionQuery
  >(introspectionQuery, { client, skipCache: true });

  useEffect(() => {
    if (storedSchema || loading) {
      return;
    }
    if (data) {
      setSchema(data.__schema);
    } else {
      console.log(`Requesting schema for ${url}…`);
      downloadSchema();
    }
  }, [downloadSchema, loading, storedSchema, data, setSchema, url]);

  if (error) {
    return <div>Error introspecting: {JSON.stringify(error)}</div>;
  }

  const schema = storedSchema ?? data?.__schema;
  if (!schema) {
    return <div>Loading schema…</div>;
  }

  return (
    <ClientContext.Provider value={client}>
      <IntrospectedGraphql schema={schema} />
    </ClientContext.Provider>
  );
}
