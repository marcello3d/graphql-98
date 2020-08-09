import { useMemo } from 'react';
import { GraphQLClient, useQuery } from 'graphql-hooks';
import { getIntrospectionQuery, IntrospectionQuery } from 'graphql';
import { formatType, restructure } from '../lib/restructure';

export function GraphqlSchema() {
  const query = useMemo(() => getIntrospectionQuery({}), []);
  const { loading, error, data } = useQuery<IntrospectionQuery>(query, {});

  const restructured = useMemo(
    () => (data ? restructure(data.__schema) : undefined),
    [data],
  );

  if (loading) {
    return <div>…</div>;
  }
  if (error) {
    return <div>Error: {JSON.stringify(error, undefined, 2)}</div>;
  }

  const {
    mutationType,
    queryType,
    subscriptionType,
    sortedDirectives,
    sortedTypes,
  } = restructured;
  return (
    <div>
      <h2>Top-level shit</h2>
      <table>
        <tbody>
          {queryType && (
            <tr>
              <td colSpan={queryType.fields.length}>queryType</td>
              <td colSpan={queryType.fields.length}>{queryType.name}</td>
              {queryType.fields.map(({ name, args, type }) => (
                <tr key={name}>
                  <td>
                    {name} (
                    {args
                      .map(
                        ({ name, type, defaultValue }) =>
                          `${name}: ${formatType(type)}`,
                      )
                      .join(', ')}
                    ): {formatType(type)}
                  </td>
                </tr>
              ))}
            </tr>
          )}
          {mutationType && (
            <tr>
              <td>mutationType</td>
              <td>{mutationType.name}</td>
            </tr>
          )}
          {subscriptionType && (
            <tr>
              <td>subscriptionType</td>
              <td>{subscriptionType.name}</td>
            </tr>
          )}
        </tbody>
      </table>
      <h2>Directives</h2>
      <table>
        <tbody>
          {sortedDirectives.map(
            ({ name, locations, args, description, isRepeatable }) => (
              <tr key={name}>
                <td>{name}</td>
                <td>{description}</td>
              </tr>
            ),
          )}
        </tbody>
      </table>
      <h2>Types</h2>
      <table>
        <tbody>
          {sortedTypes.map((type) => (
            <tr key={type.name}>
              <td>
                {type.name}{' '}
                {type.description ? (
                  <span title={type.description}>ℹ️</span>
                ) : (
                  ''
                )}
              </td>
              <td>{type.kind}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
