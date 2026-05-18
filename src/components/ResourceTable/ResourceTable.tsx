import { useStore } from '../../store';
import styles from './ResourceTable.module.css';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  width?: string;
  hideTablet?: boolean;
}

interface Props<T extends { id: string }> {
  columns: Column<T>[];
  rows: T[];
  selectedIndex: number;
  onSelect: (idx: number) => void;
  onActivate?: (idx: number) => void;
  rowKey: (row: T) => string;
}

export function ResourceTable<T extends { id: string }>({ columns, rows, selectedIndex, onSelect, onActivate, rowKey }: Props<T>) {
  const markedIds = useStore((s) => s.markedIds);

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
          {rows.map((row, idx) => {
            const isMarked = markedIds.has(row.id);
            return (
              <tr
                key={rowKey(row)}
                className={`${styles.tr} ${idx === selectedIndex ? styles.selected : ''} ${isMarked ? styles.marked : ''}`}
                onClick={() => onSelect(idx)}
                onDoubleClick={() => onActivate?.(idx)}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={col.key}
                    className={`${styles.td} ${col.hideTablet ? styles.hideTablet : ''}`}
                  >
                    {colIdx === 0 && isMarked && <span className={styles.markIndicator}>▸ </span>}
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
