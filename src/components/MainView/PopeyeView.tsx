import { useStore } from '../../store';
import styles from './PopeyeView.module.css';

export function PopeyeView() {
  const issues = useStore((s) => s.popeyeIssues);
  const activeNamespace = useStore((s) => s.activeNamespace);
  const filterStr = useStore((s) => s.filterStr);

  const filtered = issues
    .filter((i) => activeNamespace === 'all' || i.namespace === activeNamespace || i.namespace === '-')
    .filter((i) => !filterStr || i.message.toLowerCase().includes(filterStr.toLowerCase()) || i.resource.toLowerCase().includes(filterStr.toLowerCase()));

  const grouped: Record<string, typeof filtered> = {};
  filtered.forEach((i) => {
    const key = `${i.kind}/${i.namespace}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(i);
  });

  const errors = filtered.filter((i) => i.level === 'ERROR').length;
  const warns = filtered.filter((i) => i.level === 'WARN').length;
  const infos = filtered.filter((i) => i.level === 'INFO').length;
  const total = filtered.length;
  const score = Math.max(0, 100 - errors * 8 - warns * 3 - infos);
  const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';

  return (
    <div className={styles.popeye}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span className={styles.sailor}>⚓</span>
          <span>Popeye — Kubernetes Cluster Sanitizer</span>
        </div>
        <div className={styles.scoreCard}>
          <div className={`${styles.grade} ${styles[`grade${grade}`]}`}>{grade}</div>
          <div className={styles.scoreDetail}>
            <div className={styles.scoreValue}>{score}/100</div>
            <div className={styles.scoreLabel}>cluster score</div>
          </div>
        </div>
      </div>

      <div className={styles.summary}>
        <div className={`${styles.summaryCard} ${styles.errorCard}`}>
          <div className={styles.summaryValue}>{errors}</div>
          <div className={styles.summaryLabel}>ERRORS</div>
        </div>
        <div className={`${styles.summaryCard} ${styles.warnCard}`}>
          <div className={styles.summaryValue}>{warns}</div>
          <div className={styles.summaryLabel}>WARNINGS</div>
        </div>
        <div className={`${styles.summaryCard} ${styles.infoCard}`}>
          <div className={styles.summaryValue}>{infos}</div>
          <div className={styles.summaryLabel}>INFO</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryValue}>{total}</div>
          <div className={styles.summaryLabel}>TOTAL ISSUES</div>
        </div>
      </div>

      <div className={styles.groups}>
        {Object.entries(grouped).map(([key, items]) => (
          <div key={key} className={styles.group}>
            <div className={styles.groupHeader}>
              <span className={styles.groupKind}>{key.split('/')[0]}</span>
              <span className={styles.groupNs}>· {key.split('/')[1]}</span>
              <span className={styles.groupCount}>{items.length} issue{items.length !== 1 ? 's' : ''}</span>
            </div>
            {items.map((i) => (
              <div key={i.id} className={styles.issue}>
                <span className={`${styles.level} ${styles[`level${i.level}`]}`}>{i.level}</span>
                <span className={styles.resource}>{i.resource}</span>
                <span className={styles.message}>{i.message}</span>
                <span className={styles.ruleId}>{i.ruleId}</span>
              </div>
            ))}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className={styles.clean}>
            ✓ No issues found. Cluster is healthy!
          </div>
        )}
      </div>
    </div>
  );
}
