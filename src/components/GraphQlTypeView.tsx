import React, { useCallback } from 'react';

import styles from './GraphQlTypeView.module.css';

import { formatType, Restructure } from '../lib/restructure';
import { useQuery } from 'graphql-hooks';
import { Column, Table } from './Table';
import { GraphQlError } from './GraphQlError';
import { buildQueryGraph, QueryField, renderGraph } from './queryBuilder';

export function GraphQlTypeView({
  structure,
  path,
}: {
  url: string;
  structure: Restructure;
  path: string[];
}) {
  const { queryGraph, fields } = buildQueryGraph(structure, path);
  console.log('queryGraph', queryGraph);

  const query = renderGraph(queryGraph);
  const { error, data } = useQuery(query, {});
  console.log('Raw data', data);
  let rows: Record<string, any>[] | undefined = undefined;
  if (data) {
    let walkData = data;
    for (let i = 1; i < path.length; i++) {
      walkData = walkData?.[path[i]];
    }
    rows = Array.isArray(walkData) ? walkData : [walkData];
  }
  const columns: Column[] = [];
  function recurse(fields: QueryField[], path: string[] = []) {
    for (const field of fields) {
      const newPath = [...path, field.name];
      if (field.children && field.children.length > 0) {
        recurse(field.children, newPath);
      } else {
        const name = newPath.join('.');
        columns.push({
          key: name,
          label: `${name}: ${formatType(field.typeRef)}`,
        });
      }
    }
  }
  recurse(fields);
  const getCell = useCallback(
    (row: number, col: number, { key }: { key: string }) => {
      let value: any = rows?.[row];
      for (const item of key.split('.')) {
        value = value?.[item];
      }

      if (value === true) {
        return <div className={styles.true}>true</div>;
      }
      if (value === false) {
        return <div className={styles.false}>false</div>;
      }
      if (value === null) {
        return <div className={styles.null}>NULL</div>;
      }
      if (value === undefined) {
        return <div className={styles.null}>NO VALUE</div>;
      }
      if (value === '') {
        return <div className={styles.empty}>EMPTY STRING</div>;
      }
      if (typeof value === 'number') {
        return <div className={styles.number}>{value}</div>;
      }
      if (typeof value === 'object') {
        return <div className={styles.json}>{JSON.stringify(value)}</div>;
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
