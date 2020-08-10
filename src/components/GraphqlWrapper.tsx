import React, { useEffect, useMemo } from 'react';
import { ClientContext, GraphQLClient, useManualQuery } from 'graphql-hooks';

import {
  getIntrospectionQuery,
  IntrospectionQuery,
  IntrospectionSchema,
} from 'graphql';
import { IntrospectedGraphql } from './IntrospectedGraphql';
import { GraphQlError } from './GraphQlError';

// Some graphql servers fail if you try to request the 'locations'
// field on directives (we're not using directives anyway)
const introspectionQuery = getIntrospectionQuery({
  descriptions: false,
}).replace(`locations`, '');

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
  }, [downloadSchema, storedSchema, data, setSchema, url]);

  if (error) {
    return (
      <GraphQlError
        title="Error reading schema"
        error={error}
        note="Check your URL and try again"
      />
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
