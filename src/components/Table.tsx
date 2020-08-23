import React from 'react';
import { Column, ColumnInstance, HeaderGroup, useTable } from 'react-table';

import styles from './Table.module.css';

export const Table = React.memo(function TableInner({
  columns,
  data,
  ValueComponent,
}: {
  columns: Column[];
  data?: object[];
  ValueComponent: React.FunctionComponent<{ value: any }>;
}) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable<object>({ columns, data: data || [] });

  const depth = headerGroups.length;

  // This is a bunch of gross hacks to get grouped columns rendering in the style I'd like
  const headers = headerGroups[headerGroups.length - 1].headers;
  const headerStacks = headers.map((group) => {
    const stack: HeaderGroup[] = [];
    function recurse(group?: HeaderGroup) {
      if (group) {
        stack.push(group);
        recurse(group.parent as HeaderGroup);
      }
    }
    recurse(group);
    return stack.reverse();
  });
  function getColSpan(header: HeaderGroup | ColumnInstance): number {
    if (!header.columns) {
      return 1;
    }
    let count = 0;
    for (const col of header.columns) {
      count += getColSpan(col);
    }
    return count;
  }
  return (
    <div className={styles.root}>
      <table className={styles.table} {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup, row) => (
            <tr
              className={styles.columnRow}
              {...headerGroup.getHeaderGroupProps()}
            >
              {headers.map((group, col) => {
                const header = headerStacks[col][row];
                if (!header || header === headerStacks[col - 1]?.[row]) {
                  return null;
                }
                const columnDepth = headerStacks[col].length;
                const rowExtend =
                  row === columnDepth - 1 ? depth - columnDepth : 0;
                return (
                  <th
                    key={col}
                    className={
                      typeof group.Header === 'function'
                        ? styles.emptyColumn
                        : styles.column
                    }
                    colSpan={getColSpan(header)}
                    rowSpan={rowExtend > 0 ? rowExtend + 1 : undefined}
                  >
                    {header.Header}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {data === undefined || rows.length === 0 ? (
            <tr>
              <td className={styles.cell} colSpan={columns.length}>
                <div className={styles.loading}>
                  {data === undefined ? 'Fetching data…' : 'No results'}
                </div>
              </td>
            </tr>
          ) : (
            rows.map((row, i) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell, i) => (
                    <td className={styles.cell} {...cell.getCellProps()}>
                      <ValueComponent value={cell.value} />
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
});
