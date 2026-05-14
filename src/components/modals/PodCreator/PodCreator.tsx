import { useState } from 'react';
import { useStore } from '../../../store';
import type { Pod } from '../../../types';
import styles from './PodCreator.module.css';

export function PodCreator() {
  const createPod = useStore((s) => s.createPod);
  const setActiveModal = useStore((s) => s.setActiveModal);
  const namespaces = useStore((s) => s.namespaces);
  const nodes = useStore((s) => s.nodes);

  const [name, setName] = useState('');
  const [image, setImage] = useState('nginx:latest');
  const [namespace, setNamespace] = useState('default');
  const [cpuRequest, setCpuRequest] = useState('100m');
  const [memRequest, setMemRequest] = useState('128Mi');
  const [envKey, setEnvKey] = useState('');
  const [envVal, setEnvVal] = useState('');
  const [envVars, setEnvVars] = useState<Record<string, string>>({});

  const addEnv = () => {
    if (envKey) {
      setEnvVars((e) => ({ ...e, [envKey]: envVal }));
      setEnvKey('');
      setEnvVal('');
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !image) return;
    const pod: Omit<Pod, 'id' | 'events' | 'logs' | 'age'> = {
      name: name.replace(/\s+/g, '-').toLowerCase(),
      namespace,
      image,
      status: 'Running',
      ready: '1/1',
      restarts: 0,
      cpu: cpuRequest,
      mem: memRequest,
      nodeName: nodes[0]?.name || 'k9ssim-node-02',
      labels: { app: name.replace(/\s+/g, '-').toLowerCase() },
      containers: [
        {
          name: 'app',
          image,
          cpuRequest,
          cpuLimit: cpuRequest,
          memRequest,
          memLimit: memRequest,
          envVars,
        },
      ],
    };
    createPod(pod);
    setActiveModal(null);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <span className={styles.title}>Create Pod</span>
          <button className={styles.close} onClick={() => setActiveModal(null)}>✕</button>
        </div>
        <form onSubmit={submit} className={styles.form}>
          <label className={styles.field}>
            <span className={styles.label}>Name *</span>
            <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="my-pod" required />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Image *</span>
            <input className={styles.input} value={image} onChange={(e) => setImage(e.target.value)} placeholder="nginx:latest" required />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Namespace</span>
            <select className={styles.input} value={namespace} onChange={(e) => setNamespace(e.target.value)}>
              {namespaces.map((ns) => <option key={ns.id} value={ns.name}>{ns.name}</option>)}
            </select>
          </label>
          <label className={styles.field}>
            <span className={styles.label}>CPU Request</span>
            <input className={styles.input} value={cpuRequest} onChange={(e) => setCpuRequest(e.target.value)} placeholder="100m" />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Memory Request</span>
            <input className={styles.input} value={memRequest} onChange={(e) => setMemRequest(e.target.value)} placeholder="128Mi" />
          </label>
          <div className={styles.envSection}>
            <span className={styles.label}>Environment Variables</span>
            <div className={styles.envRow}>
              <input className={styles.input} placeholder="KEY" value={envKey} onChange={(e) => setEnvKey(e.target.value)} />
              <input className={styles.input} placeholder="VALUE" value={envVal} onChange={(e) => setEnvVal(e.target.value)} />
              <button type="button" className={styles.addBtn} onClick={addEnv}>Add</button>
            </div>
            {Object.entries(envVars).map(([k, v]) => (
              <div key={k} className={styles.envTag}>
                <span>{k}={v}</span>
                <button type="button" onClick={() => setEnvVars((ev) => { const n = { ...ev }; delete n[k]; return n; })}>✕</button>
              </div>
            ))}
          </div>
          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={() => setActiveModal(null)}>Cancel</button>
            <button type="submit" className={styles.submitBtn}>Create Pod</button>
          </div>
        </form>
      </div>
    </div>
  );
}
