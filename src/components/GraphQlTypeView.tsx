import React, { useMemo } from 'react';

import styles from './GraphQlTypeView.module.css';

import {
  Restructure,
  RestructureQuery,
  RestructureType,
} from '../lib/restructure';
import { useQuery } from 'graphql-hooks';
import { Table } from './Table';
import { GraphQlError } from './GraphQlError';
import { buildQueryGraph, QueryField, renderQuery } from './queryBuilder';
import { Column } from 'react-table';
import { formatType } from '../lib/restructureFormatters';
import { useBooleanQuery } from '../hooks/useBooleanQuery';

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
  if (typeof value === 'string') {
    if (/^\s*(http|https):\/\//.test(value)) {
      return (
        <div className={styles.url}>
          <div className={styles.overflow}>
            <a href={value} rel="nofollow noreferrer noopener" target="_blank">
              {value}
            </a>
          </div>
        </div>
      );
    }
    return (
      <div className={styles.text}>
        <div className={styles.overflow}>{value}</div>
      </div>
    );
  }
  return (
    <div className={styles.json}>
      <div className={styles.overflow}>
        {JSON.stringify(value).replace(/([{,])"(.*?)":/g, '$1 $2: ')}
      </div>
    </div>
  );
}

function getColumns(
  fields: QueryField[],
  expandColumns: boolean,
  typeQueries: Record<string, RestructureQuery[]>,
  fieldType: RestructureType,
  path: string[] = [],
): Column[] {
  const columns = fields
    .filter(({ disabled = false }) => !disabled)
    .map(({ name, typeRef, children }) => {
      const newPath = [...path, name];
      const Header = (
        <>
          {name}: <b>{formatType(typeRef)}</b>
        </>
      );
      const fullPath = newPath.join('.');
      if (children && children.length > 0 && expandColumns) {
        return {
          id: fullPath,
          Header,
          columns: getColumns(
            children,
            expandColumns,
            typeQueries,
            typeRef.type,
            newPath,
          ),
        };
      } else {
        return {
          id: fullPath,
          Header,
          accessor: fullPath,
        };
      }
    });
  if (typeQueries[fieldType.name]) {
    return [
      ...typeQueries[fieldType.name].map(({ field, lookupArgs, path }) => {
        const fullPath = path.join('.');
        return {
          id: fullPath,
          Header: '🔗',
          accessor: fullPath,
        };
      }),
      ...columns,
    ];
  }
  return columns;
}

export function GraphQlTypeView({
  structure,
  path,
}: {
  url: string;
  structure: Restructure;
  path: string[];
}) {
  const [substructures, setSubstructures] = useBooleanQuery('ss');
  const [expandColumns, setExpandColumns] = useBooleanQuery('ec');
  const { queryGraph, field, fields } = buildQueryGraph(
    structure,
    path,
    substructures,
  );

  const query = renderQuery(queryGraph);
  const { error, data } = useQuery(query, {});
  let rows: object[] | undefined = undefined;
  if (data) {
    console.log('Raw data', data);
    let walkData = data;
    for (let i = 1; i < path.length; i++) {
      walkData = walkData?.[path[i]];
    }
    if (Array.isArray(walkData)) {
      rows = walkData;
    }
  }
  const columns = useMemo(
    () =>
      getColumns(
        fields,
        expandColumns,
        structure.typeQueries,
        field.typeRef.type,
      ),
    [expandColumns, field.typeRef.type, fields, structure.typeQueries],
  );
  return (
    <>
      <fieldset>
        <legend>GraphQL Query</legend>
        <div className={styles.row}>
          <input
            type="checkbox"
            checked={substructures}
            onChange={setSubstructures}
            id="substructures"
          />{' '}
          <label htmlFor="substructures">Query substructures</label>
        </div>
        <div className={styles.row}>
          <input
            type="checkbox"
            checked={expandColumns}
            onChange={setExpandColumns}
            id="expand_substructures"
          />{' '}
          <label htmlFor="expand_substructures">Expand columns</label>
        </div>
        <textarea className={styles.query} readOnly={true} value={query} />
      </fieldset>
      {error ? (
        <GraphQlError title="Query error" error={error} />
      ) : field.collection ? (
        <Table columns={columns} data={rows} renderCell={cellValue} />
      ) : (
        <Tree data={data} />
      )}
    </>
  );
}

function Tree({ data }: { data: any }) {
  function recurse(data: any) {
    if (data && typeof data === 'object') {
      return (
        <>
          <ul>
            {Object.keys(data).map((key) => (
              <li key={key} className={styles.treeNode}>
                <span className={styles.treeKey}>{key}</span>{' '}
                {recurse(data[key])}
              </li>
            ))}
          </ul>
        </>
      );
    }
    return cellValue(data);
  }
  return (
    <ul className="tree-view">
      <li>
        Result
        {recurse(data)}
      </li>
    </ul>
  );
}
