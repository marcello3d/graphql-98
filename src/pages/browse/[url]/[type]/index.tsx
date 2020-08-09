import { useRouter } from 'next/router';
import { useQuery } from 'graphql-hooks';
import {
  formatType,
  getSimpleType,
  Introspection,
  queryAll,
} from '../../../../lib/restructure';
import IntrospectionWrapper from '../../../../components/IntrospectionWrapper';
import { IntrospectionObjectType } from 'graphql';
import { GraphqlWrapper } from '../../../../components/GraphqlWrapper';

export default function TypeHome() {
  const router = useRouter();
  const type = router.query.type;
  if (typeof type !== 'string') {
    return <div>…</div>;
  }
  return (
    <GraphqlWrapper>
      <IntrospectionWrapper
        render={(structure) => (
          <TypeDetails type={type} structure={structure} />
        )}
      />
    </GraphqlWrapper>
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
  const field = queryType.collectionFields[0];
  const query = queryAll(structure.typeMap, queryType, field);
  const returnType = getSimpleType(field.type);
  const { loading, error, data } = useQuery(query, {});
  console.log('query', query, field, data);
  const rows = data?.[field.name];
  const columns = (structure.typeMap[
    returnType.type.name
  ] as IntrospectionObjectType).fields;
  return (
    <>
      <h2>{type}</h2>
      <pre>{query}</pre>
      {loading ? (
        <div>Loading…</div>
      ) : error ? (
        <div>
          Error: <pre>{JSON.stringify(error, undefined, 2)}</pre>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              {columns.map(({ name, type }) => (
                <th key={name}>
                  {name}: {formatType(type)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                {columns.map(({ name, type }) => (
                  <td key={name}>{name in row && <div>{row[name]}</div>}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
