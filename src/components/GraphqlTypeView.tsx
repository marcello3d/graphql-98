import React, { useMemo } from 'react';
import { IntrospectionObjectType, IntrospectionSchema } from 'graphql';

import {
  formatType,
  getSimpleType,
  queryAll,
  Restructure,
  restructure,
} from '../lib/restructure';
import { StringParam, useQueryParam } from 'use-query-params';
import { useQuery } from 'graphql-hooks';

export function GraphQlTypeView({
  structure,
  type,
}: {
  structure: Restructure;
  type: string;
}) {
  const queryType = structure.queryTypeMap?.[type];
  const field = queryType.collectionFields[0];
  const query = queryAll(structure.typeMap, queryType, field);
  const returnType = getSimpleType(field.type);
  const { loading, error, data } = useQuery(query, {});
  console.log('query', query, field, data);
  const rows: Record<string, any>[] = data?.[field.name];
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
