import React, { useCallback } from 'react';

import styles from './GraphQlTypeView.module.css';

import { formatType, Restructure } from '../lib/restructure';
import { useQuery } from 'graphql-hooks';
import { Table } from './Table';
import { GraphQlError } from './GraphQlError';
import { format } from 'graphql-formatter';

export function GraphQlTypeView({
  url,
  structure,
  path,
}: {
  url: string;
  structure: Restructure;
  path: string[];
}) {
  let node = structure.queryType;
  let query = 'query {\n';
  for (let i = 1; i < path.length; i++) {
    const item = path[i];
    query += `${item} {\n`;
    if (node.type !== 'container') {
      throw new Error(
        `expected container "${item}" in ${path.join('.')}, got ${node.type}`,
      );
    }
    console.log(`looking at ${item} in `, node);
    node = node.childMap[item];
    if (!node) {
      throw new Error(`invalid path item ${item} in ${path.join('.')}`);
    }
  }

  if (node.type === 'collection') {
    for (const field of node.fields) {
      if (field.typeRef.kind !== 'OBJECT') {
        query += `${field.name}\n`;
      }
    }
  }

  for (let _ of path) {
    query += '}\n';
  }
  query = format(query);

  const { loading, error, data } = useQuery(query, {});
  console.log('Raw data', data);
  let rows: Record<string, any>[] = [];
  if (data) {
    let walkData = data;
    for (let i = 1; i < path.length; i++) {
      walkData = walkData[path[i]];
    }
    rows = walkData;
  }
  const columns =
    node.type === 'collection'
      ? node.fields.map(({ name, typeRef }) => ({
          key: name,
          label: `${name}: ${formatType(typeRef)}`,
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
  return <div>ok</div>;
}
