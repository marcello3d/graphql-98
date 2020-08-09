import { useRouter } from 'next/router';
import { decodeUrlForPath } from './url-encode';
import { useMemo } from 'react';
import { GraphQLClient } from 'graphql-hooks';

export function useGraphql():
  | { url: string; client: GraphQLClient }
  | undefined {
  const router = useRouter();
  const url = decodeUrlForPath(router.query.url);
  return useMemo(() => {
    return (
      url && {
        url,
        client: new GraphQLClient({ url }),
      }
    );
  }, [url]);
}
