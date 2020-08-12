import React, { useMemo } from 'react';
import { ClientContext, GraphQLClient, useQuery } from 'graphql-hooks';

import { getIntrospectionQuery, IntrospectionQuery } from 'graphql';
import { IntrospectedGraphQl } from './IntrospectedGraphQl';
import { GraphQlError } from './GraphQlError';
import { LocalStorageCache } from './localStorageCache';

// Some graphql servers fail if you try to request the 'locations'
// field on directives (we're not using directives anyway)
const introspectionQuery = getIntrospectionQuery({
  descriptions: false,
}).replace(`locations`, '');

export function GraphQlWrapper({ url }: { url: string }) {
  const client = useMemo(
    () =>
      new GraphQLClient({
        url,
        cache: new LocalStorageCache(url, introspectionQuery),
      }),
    [url],
  );

  const { error, loading, data, refetch } = useQuery<IntrospectionQuery>(
    introspectionQuery,
    { client },
  );

  if (error) {
    return (
      <GraphQlError
        title="Error reading schema"
        error={error}
        note="Check your URL and try again"
      />
    );
  }

  if (!data || loading) {
    return <div>Loading schema…</div>;
  }

  return (
    <ClientContext.Provider value={client}>
      <IntrospectedGraphQl url={url} schema={data.__schema} />
    </ClientContext.Provider>
  );
}
