import styles from './ResourceTable.module.css';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  width?: string;
  hideTablet?: boolean;
}

interface Props<T> {
  columns: Column<T>[];
  rows: T[];
  selectedIndex: number;
  onSelect: (idx: number) => void;
  onActivate?: (idx: number) => void;
  rowKey: (row: T) => string;
}

export function ResourceTable<T>({ columns, rows, selectedIndex, onSelect, onActivate, rowKey }: Props<T>) {
  if (rows.length === 0) {
    return <div className={styles.empty}>No resources found.</div>;
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`${styles.th} ${col.hideTablet ? styles.hideTablet : ''}`}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={rowKey(row)}
              className={`${styles.tr} ${idx === selectedIndex ? styles.selected : ''}`}
              onClick={() => onSelect(idx)}
              onDoubleClick={() => onActivate?.(idx)}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`${styles.td} ${col.hideTablet ? styles.hideTablet : ''}`}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
