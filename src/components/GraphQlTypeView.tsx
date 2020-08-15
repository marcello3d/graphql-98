import React, { ChangeEvent, useCallback, useMemo } from 'react';

import styles from './GraphQlTypeView.module.css';

import { Restructure } from '../lib/restructure';
import { useQuery } from 'graphql-hooks';
import { Table } from './Table';
import { GraphQlError } from './GraphQlError';
import { buildQueryGraph, QueryField, renderQuery } from './queryBuilder';
import { Column } from 'react-table';
import { formatType } from '../lib/restructureFormatters';
import { BooleanParam, useQueryParam } from 'use-query-params';

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
  return fields
    .filter(({ disabled = false }) => !disabled)
    .map(({ name, typeRef, children }) => {
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
  const [querySubstructures, setSubstructures] = useQueryParam(
    'ss',
    BooleanParam,
  );
  const substructures = !!querySubstructures;
  const { queryGraph, fields } = buildQueryGraph(
    structure,
    path,
    substructures,
  );
  console.log('queryGraph', queryGraph);

  const onChangeSubstructures = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setSubstructures(event.currentTarget.checked ? true : undefined);
    },
    [setSubstructures],
  );

  const query = renderQuery(queryGraph);
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
        <legend>GraphQL Query</legend>
        <div className={styles.row}>
          <input
            type="checkbox"
            checked={substructures}
            onChange={onChangeSubstructures}
            id="substructures"
          />{' '}
          <label htmlFor="substructures">Query substructures</label>
        </div>
        <textarea className={styles.query} readOnly={true} value={query} />
      </fieldset>
      {error ? (
        <GraphQlError title="Query error" error={error} />
      ) : (
        <Table columns={columns} data={rows} renderCell={cellValue} />
      )}
    </>
  );
}
