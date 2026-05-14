import { useState } from 'react';
import { useStore } from '../../../store';
import styles from './ScaleDialog.module.css';

export function ScaleDialog() {
  const deployments = useStore((s) => s.deployments);
  const selectedIndex = useStore((s) => s.selectedIndex);
  const scaleDeployment = useStore((s) => s.scaleDeployment);
  const setActiveModal = useStore((s) => s.setActiveModal);

  const deploy = deployments[selectedIndex];
  const [replicas, setReplicas] = useState(deploy?.replicas ?? 1);

  if (!deploy) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    scaleDeployment(deploy.id, replicas);
    setActiveModal(null);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <span className={styles.title}>Scale Deployment</span>
          <button className={styles.close} onClick={() => setActiveModal(null)}>✕</button>
        </div>
        <form onSubmit={submit} className={styles.form}>
          <div className={styles.info}>
            <span className={styles.deployName}>{deploy.name}</span>
            <span className={styles.current}>Currently: {deploy.replicas} replica{deploy.replicas !== 1 ? 's' : ''}</span>
          </div>
          <label className={styles.field}>
            <span className={styles.label}>Desired Replicas</span>
            <input
              className={styles.input}
              type="number"
              min={0}
              max={20}
              value={replicas}
              onChange={(e) => setReplicas(Number(e.target.value))}
              autoFocus
            />
          </label>
          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={() => setActiveModal(null)}>Cancel</button>
            <button type="submit" className={styles.submitBtn}>Scale</button>
          </div>
        </form>
      </div>
    </div>
  );
}
