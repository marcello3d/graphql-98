import React, { useCallback } from 'react';
import { IntrospectionObjectType } from 'graphql';

import {
  formatType,
  getSimpleType,
  queryAll,
  Restructure,
} from '../lib/restructure';
import { useQuery } from 'graphql-hooks';
import { Table } from './Table';

export function GraphQlTypeView({
  structure,
  type,
}: {
  structure: Restructure;
  type: string;
}) {
  const queryType = structure.queryTypeMap[type];
  const field = queryType.collectionFields[0];
  const query = queryAll(structure.typeMap, queryType, field);
  const returnType = getSimpleType(field.type);
  const { loading, error, data } = useQuery(query, {});
  console.log('query', query, field, data);
  const rows: Record<string, any>[] = data?.[field.name];
  const columns = (structure.typeMap[
    returnType.type.name
  ] as IntrospectionObjectType).fields.map(({ name, type }) => ({
    key: name,
    label: `${name}: ${formatType(type)}`,
  }));
  const getCell = useCallback(
    (row: number, col: number, { key }: { key: string }) => {
      return <div>{rows?.[row][key]}</div>;
    },
    [rows],
  );
  return (
    <>
      <pre>{query}</pre>
      {loading ? (
        <div>Loading…</div>
      ) : error ? (
        <div>
          Error: <pre>{JSON.stringify(error, undefined, 2)}</pre>
        </div>
      ) : (
        <Table
          columns={columns}
          rowCount={rows?.length ?? 0}
          getCell={getCell}
        />
      )}
    </>
  );
}
