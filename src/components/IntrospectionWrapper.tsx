import { getIntrospectionQuery, IntrospectionQuery } from 'graphql';
import { useQuery } from 'graphql-hooks';
import { useMemo } from 'react';
import { Introspection, restructure } from '../lib/restructure';

const introspectionQuery = getIntrospectionQuery({});
export default function IntrospectionWrapper({
  render,
}: {
  render: (structure: Introspection) => React.ReactNode;
}) {
  const { loading, error, data } = useQuery<IntrospectionQuery>(
    introspectionQuery,
    {},
  );

  const restructured = useMemo(() => {
    if (!data) {
      return undefined;
    }
    const structure = restructure(data.__schema);
    console.log('structure', structure);
    return structure;
  }, [data]);

  if (loading) {
    return <div>…</div>;
  }
  if (error) {
    return <div>Error: {JSON.stringify(error, undefined, 2)}</div>;
  }
  return <>{render(restructured)}</>;
}
