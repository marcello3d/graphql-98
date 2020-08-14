import React, { useMemo } from 'react';

import styles from './GraphQlTypeView.module.css';

import { formatType, Restructure } from '../lib/restructure';
import { useQuery } from 'graphql-hooks';
import { Table } from './Table';
import { GraphQlError } from './GraphQlError';
import { buildQueryGraph, QueryField, renderGraph } from './queryBuilder';
import { Column } from 'react-table';

function cellValue(value: any): React.ReactNode {
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
    return <div className={styles.empty}>EMPTY</div>;
  }
  if (typeof value === 'number') {
    return <div className={styles.number}>{value}</div>;
  }
  if (typeof value === 'object') {
    return <div className={styles.json}>{JSON.stringify(value)}</div>;
  }
  return <div className={styles.text}>{value}</div>;
}

function getColumns(fields: QueryField[], path: string[] = []): Column[] {
  return fields.map(({ name, typeRef, children }) => {
    const newPath = [...path, name];
    const Header = (
      <>
        {name}: <b>{formatType(typeRef)}</b>
      </>
    );
    const fullPath = newPath.join('.');
    if (children && children.length > 0) {
      return {
        id: fullPath,
        Header,
        columns: getColumns(children, newPath),
      };
    } else {
      return {
        id: fullPath,
        Header,
        accessor: fullPath,
      };
    }
  });
}

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
  let rows: object[] | undefined = undefined;
  if (data) {
    let walkData = data;
    for (let i = 1; i < path.length; i++) {
      walkData = walkData?.[path[i]];
    }
    rows = Array.isArray(walkData) ? walkData : [walkData];
  }
  const columns = useMemo(() => getColumns(fields), [fields]);
  return (
    <>
      <fieldset>
        <legend>Raw GraphQL Query</legend>
        <pre>{query}</pre>
      </fieldset>
      {error ? (
        <GraphQlError title="Query error" error={error} />
      ) : (
        <Table columns={columns} data={rows} renderCell={cellValue} />
      )}
    </>
  );
}
