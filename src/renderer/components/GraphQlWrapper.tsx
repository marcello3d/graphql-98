import React, { useMemo } from 'react';
import { ClientContext, GraphQLClient, Headers, useQuery } from 'graphql-hooks';

import { getIntrospectionQuery, IntrospectionQuery } from 'graphql';
import { IntrospectedGraphQl } from './IntrospectedGraphQl';
import { GraphQlError } from './GraphQlError';
import {
  LocalStorageCache,
  useHeadersLocalStorage,
} from '../hooks/localStorageCache';

// Some graphql servers fail if you try to request the 'locations'
// field on directives (we're not using directives anyway)
const introspectionQuery = getIntrospectionQuery({
  descriptions: false,
}).replace(`locations`, '');

export function GraphQlWrapper({ url }: { url: string }) {
  const [rawHeaders] = useHeadersLocalStorage(url);
  const headers = useMemo(() => {
    if (!rawHeaders) {
      return undefined;
    }
    const h: Headers = {};
    for (const { name, value } of rawHeaders) {
      if (name && value) {
        h[name] = value;
      }
    }
    return h;
  }, [rawHeaders]);
  const client = useMemo(
    () =>
      new GraphQLClient({
        url,
        headers,
        cache: new LocalStorageCache(url, introspectionQuery),
      }),
    [headers, url],
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

  if (loading) {
    return <div>Loading schema…</div>;
  }

  return (
    <ClientContext.Provider value={client}>
      <IntrospectedGraphQl
        url={url}
        reloadSchema={refetch}
        schema={data.__schema}
      />
    </ClientContext.Provider>
  );
}
