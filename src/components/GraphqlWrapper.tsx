import React from 'react';
import { GraphQLClient, useQuery, ClientContext } from 'graphql-hooks';

import { getIntrospectionQuery, IntrospectionQuery } from 'graphql';
import { useMemo } from 'react';
import { IntrospectedGraphql } from './IntrospectedGraphql';

const introspectionQuery = getIntrospectionQuery();

export function GraphqlWrapper({ url }: { url: string }) {
  const client = useMemo(() => new GraphQLClient({ url }), [url]);

  const { loading, error, data } = useQuery<IntrospectionQuery>(
    introspectionQuery,
    { client },
  );

  if (loading) {
    return <div>Loading…</div>;
  }

  if (error) {
    return <div>Error introspecting: {JSON.stringify(error)}</div>;
  }

  return (
    <ClientContext.Provider value={client}>
      <IntrospectedGraphql schema={data.__schema} />
    </ClientContext.Provider>
  );
}
