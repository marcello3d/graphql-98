import React, { useCallback } from 'react';
import { IntrospectionObjectType } from 'graphql';

import styles from './GraphQlTypeView.module.css';

import {
  formatType,
  getSimpleType,
  queryAll,
  Restructure,
} from '../lib/restructure';
import { useQuery } from 'graphql-hooks';
import { Table } from './Table';
import { GraphQlError } from './GraphQlError';

export function GraphQlTypeView({
  structure,
  type,
}: {
  structure: Restructure;
  type: string;
}) {
  const queryType = structure.queryTypeMap[type];
  const field =
    queryType.collectionFields.length > 0
      ? queryType.collectionFields[0]
      : undefined;
  const query = queryAll(structure.typeMap, queryType, field);
  const returnType = field && getSimpleType(field.type);
  const { loading, error, data } = useQuery(query, {});
  console.log('Raw data', data);
  const rows: Record<string, any>[] = field && data?.[field.name];
  const columns = returnType
    ? (structure.typeMap[
        returnType.type.name
      ] as IntrospectionObjectType).fields.map(({ name, type }) => ({
        key: name,
        label: `${name}: ${formatType(type)}`,
      }))
    : [];
  const getCell = useCallback(
    (row: number, col: number, { key }: { key: string }) => {
      const value = rows?.[row][key];
      if (value === true) {
        return <div className={styles.true}>true</div>;
      }
      if (value === false) {
        return <div className={styles.false}>false</div>;
      }
      if (value === null) {
        return <div className={styles.null}>NULL</div>;
      }
      if (typeof value === 'number') {
        return <div className={styles.number}>{value}</div>;
      }
      return <div className={styles.text}>{value}</div>;
    },
    [rows],
  );
  return (
    <>
      <fieldset>
        <legend>Raw GraphQL Query</legend>
        <pre>{query}</pre>
      </fieldset>
      {error ? (
        <GraphQlError title="Query error" error={error} />
      ) : (
        <Table columns={columns} rowCount={rows?.length} getCell={getCell} />
      )}
    </>
  );
}
