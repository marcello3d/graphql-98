import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from 'graphql-hooks';
import { getIntrospectionQuery, IntrospectionQuery } from 'graphql';

import styles from '../../../styles/Home.module.css';
import {
  formatType,
  Introspection,
  queryAll,
  restructure,
} from '../../../../lib/restructure';
import IntrospectionWrapper from '../../../../components/IntrospectionWrapper';

export default function TypeHome() {
  const router = useRouter();
  const type = router.query.type;
  if (typeof type !== 'string') {
    return <div>…</div>;
  }
  return (
    <IntrospectionWrapper
      render={(structure) => <TypeDetails type={type} structure={structure} />}
    />
  );
}
function TypeDetails({
  type,
  structure,
}: {
  type: string;
  structure: Introspection;
}) {
  const queryType = structure.queryTypeMap?.[type];
  const field = queryType?.collectionFields[0];
  const query = queryType ? queryAll(structure.typeMap, queryType) : '';
  console.log('query', query);
  const { loading, error, data } = useQuery(query, {});
  if (loading) {
    return <div>…</div>;
  }
  if (error) {
    return (
      <div>
        Error: <pre>{JSON.stringify(error, undefined, 2)}</pre>
      </div>
    );
  }
  return (
    <>
      <h2>{type}</h2>
      <pre>{query}</pre>
      <pre>{JSON.stringify(data, undefined, 2)}</pre>
    </>
  );
}
