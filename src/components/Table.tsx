import React from 'react';
import { Column, useTable } from 'react-table';

import styles from './Table.module.css';

export const Table = React.memo(function TableInner({
  columns,
  data,
  renderCell,
}: {
  columns: Column[];
  data?: object[];
  renderCell: (value: any) => React.ReactNode;
}) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable<object>({ columns, data: data || [] });

  return (
    <div className={styles.root}>
      <table className={styles.table} {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup, i) => (
            <tr
              className={styles.columnRow}
              {...headerGroup.getHeaderGroupProps()}
            >
              {headerGroup.headers.map((column) => (
                <th className={styles.column} {...column.getHeaderProps()}>
                  {column.render('Header')}
                </th>
              ))}
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
                  {row.cells.map((cell, i) => {
                    return (
                      <td className={styles.cell} {...cell.getCellProps()}>
                        {renderCell(cell.value)}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
});
