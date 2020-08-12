import React, { useCallback } from 'react';

import styles from './GraphQlTypeView.module.css';

import { formatType, Restructure } from '../lib/restructure';
import { useQuery } from 'graphql-hooks';
import { Table } from './Table';
import { GraphQlError } from './GraphQlError';
import { buildQueryGraph, renderGraph } from './queryBuilder';

export function GraphQlTypeView({
  url,
  structure,
  path,
}: {
  url: string;
  structure: Restructure;
  path: string[];
}) {
  const { queryGraph, fields } = buildQueryGraph(structure, path);
  const query = renderGraph(queryGraph);
  console.log('queryGraph', queryGraph);

  const { error, data } = useQuery(query, {});
  console.log('Raw data', data);
  let rows: Record<string, any>[] | undefined = undefined;
  if (data) {
    let walkData = data;
    for (let i = 1; i < path.length; i++) {
      walkData = walkData[path[i]];
    }
    rows = Array.isArray(walkData) ? walkData : [walkData];
  }
  const columns = fields.map(({ name, typeRef }) => ({
    key: name,
    label: `${name}: ${formatType(typeRef)}`,
  }));
  const getCell = useCallback(
    (row: number, col: number, { key }: { key: string }) => {
      const value = rows?.[row]?.[key];
      if (value === true) {
        return <div className={styles.true}>true</div>;
      }
      if (value === false) {
        return <div className={styles.false}>false</div>;
      }
      if (value === null) {
        return <div className={styles.null}>NULL</div>;
      }
      if (value === '') {
        return <div className={styles.empty}>EMPTY STRING</div>;
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
