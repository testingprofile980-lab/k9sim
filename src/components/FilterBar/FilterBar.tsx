import { useRef, useEffect } from 'react';
import { useStore } from '../../store';
import styles from './FilterBar.module.css';

export function FilterBar() {
  const filterMode = useStore((s) => s.filterMode);
  const filterStr = useStore((s) => s.filterStr);
  const setFilterStr = useStore((s) => s.setFilterStr);
  const setFilterMode = useStore((s) => s.setFilterMode);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (filterMode) inputRef.current?.focus();
  }, [filterMode]);

  if (!filterMode && !filterStr) return null;

  return (
    <div className={styles.filterbar}>
      <span className={styles.slash}>/</span>
      <input
        ref={inputRef}
        className={styles.input}
        value={filterStr}
        placeholder="filter..."
        onChange={(e) => setFilterStr(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape' || e.key === 'Enter') {
            setFilterMode(false);
            inputRef.current?.blur();
          }
        }}
        onBlur={() => setFilterMode(false)}
        spellCheck={false}
        autoComplete="off"
      />
      {filterStr && (
        <button className={styles.clear} onClick={() => { setFilterStr(''); setFilterMode(false); }}>
          ✕
        </button>
      )}
    </div>
  );
}
