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
    if (storedSchema) {
      return;
    }
    if (data) {
      setSchema(data.__schema);
    } else {
      console.log(`Requesting schema for ${url}…`);
      downloadSchema();
    }
  }, [downloadSchema, loading, storedSchema, data, setSchema, url, error]);

  if (error) {
    return (
      <>
        <div>Error introspecting:</div>
        <pre>{JSON.stringify(error, undefined, 2)}</pre>
      </>
    );
  }

  const schema = storedSchema ?? data?.__schema;
  if (!schema || loading) {
    return <div>Loading schema…</div>;
  }

  return (
    <ClientContext.Provider value={client}>
      <IntrospectedGraphql schema={schema} />
    </ClientContext.Provider>
  );
}
