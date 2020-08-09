import React from 'react';
import styles from './Table.module.css';

type Column = { key: string; label: React.ReactNode };
export const Table = React.memo(function TableInner({
  columns,
  rowCount,
  getCell,
}: {
  columns: Column[];
  rowCount: number;
  getCell: (row: number, col: number, column: Column) => React.ReactNode;
}) {
  const rows = [];
  for (let row = 0; row < rowCount; row++) {
    rows.push(
      <tr key={row} className={styles.row}>
        {columns.map((column, col) => (
          <td key={column.key} className={styles.cell} tabIndex={0}>
            {getCell(row, col, column)}
          </td>
        ))}
      </tr>,
    );
  }
  return (
    <table className={styles.table}>
      <thead>
        <tr className={styles.columnRow}>
          {columns.map(({ key, label }) => (
            <th key={key} className={styles.column}>
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
});
