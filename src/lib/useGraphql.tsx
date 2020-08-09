import { useRouter } from 'next/router';
import { decodeUrlForPath } from './url-encode';
import { useMemo } from 'react';
import { GraphQLClient } from 'graphql-hooks';

export function useGraphql(
  queryUrl: string | string[],
): { url: string; client: GraphQLClient } | undefined {
  const url = decodeUrlForPath(queryUrl);
  return useMemo(() => {
    return (
      url && {
        url,
        client: new GraphQLClient({ url }),
      }
    );
  }, [url]);
}
