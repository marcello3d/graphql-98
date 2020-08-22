import React, { useMemo } from 'react';

import styles from './GraphQlTypeView.module.css';

import {
  Restructure,
  RestructureLookupQuery,
  RestructureQuery,
  RestructureType,
  Variables,
} from '../lib/restructure';
import { useQuery } from 'graphql-hooks';
import { Table } from './Table';
import { GraphQlError } from './GraphQlError';
import { buildQueryGraph, QueryNode, renderQuery } from '../lib/queryBuilder';
import { Column } from 'react-table';
import { formatType } from '../lib/restructureFormatters';
import { useBooleanQuery } from '../hooks/useBooleanQuery';
import { GraphQlValue } from './GraphQlValue';
import { useQueryParam, JsonParam } from 'use-query-params';
import { stringify } from 'query-string';
import { Link } from '@reach/router';
import { EmojiIcon } from './EmojiIcon';

function getColumns(
  url: string,
  fields: QueryNode[],
  expandColumns: boolean,
  typeQueries: Record<string, RestructureLookupQuery[]>,
  fieldType: RestructureType,
  fieldPath: string[] = [],
): Column[] {
  const columns = fields
    .filter(({ disabled = false }) => !disabled)
    .map(({ name, typeRef, children }) => {
      const newFieldPath = [...fieldPath, name];
      const Header = (
        <>
          {name}: <b>{formatType(typeRef)}</b>
        </>
      );
      const fullPath = newFieldPath.join('.');
      if (children && children.length > 0 && expandColumns) {
        return {
          id: fullPath,
          Header,
          columns: getColumns(
            url,
            children,
            expandColumns,
            typeQueries,
            typeRef.type,
            newFieldPath,
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
      ...typeQueries[fieldType.name].map(({ lookupArg, lookupArgs, path }) => {
        const fullPath = path.join('.');
        return {
          id: fullPath,
          Header: `🔗`,
          accessor: (row: any) => {
            const args: Variables = {};
            for (const fieldPathName of fieldPath) {
              row = row?.[fieldPathName];
            }
            if (lookupArg && row[lookupArg.name]) {
              args[lookupArg.name] = row[lookupArg.name];
            } else {
              for (const arg of lookupArgs) {
                if (row[arg.name]) {
                  args[arg.name] = row[arg.name];
                }
              }
            }
            return (
              <Link
                className={styles.link}
                to={`/?${stringify({
                  url,
                  path: fullPath,
                  args: JSON.stringify(args),
                })}`}
              >
                #
              </Link>
            );
          },
        };
      }),
      ...columns,
    ];
  }
  return columns;
}

export function GraphQlTypeView({
  url,
  structure,
  path,
}: {
  url: string;
  structure: Restructure;
  path: string[];
}) {
  const [args] = useQueryParam('args', JsonParam);
  const [substructures, setSubstructures] = useBooleanQuery('ss');
  const [expandColumns, setExpandColumns] = useBooleanQuery('ec');
  const { rootNode, firstNode, variables } = buildQueryGraph(
    structure,
    path,
    substructures,
    args,
  );

  const query = renderQuery(rootNode);
  const { error, data } = useQuery(query, { variables });
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
        url,
        firstNode.children,
        expandColumns,
        structure.typeQueries,
        firstNode.typeRef.type,
      ),
    [
      url,
      expandColumns,
      firstNode.children,
      firstNode.typeRef.type,
      structure.typeQueries,
    ],
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
      ) : firstNode.collection ? (
        <Table columns={columns} data={rows} ValueComponent={GraphQlValue} />
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
    return <GraphQlValue value={data} />;
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
