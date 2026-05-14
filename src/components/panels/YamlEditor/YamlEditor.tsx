import { useState, useEffect } from 'react';
import { useStore } from '../../../store';
import { generatePodYaml, generateDeployYaml, generateServiceYaml } from '../../../data/yamlGenerators';
import styles from './YamlEditor.module.css';

export function YamlEditor() {
  const activeView = useStore((s) => s.activeView);
  const selectedIndex = useStore((s) => s.selectedIndex);
  const pods = useStore((s) => s.pods);
  const deployments = useStore((s) => s.deployments);
  const services = useStore((s) => s.services);
  const editPodYaml = useStore((s) => s.editPodYaml);
  const editServiceYaml = useStore((s) => s.editServiceYaml);
  const setActivePanel = useStore((s) => s.setActivePanel);

  let initialYaml = '';
  let title = 'Edit YAML';
  let resourceId = '';

  if (activeView === 'pods') {
    const p = pods[selectedIndex];
    if (p) { initialYaml = generatePodYaml(p); title = `Edit Pod / ${p.name}`; resourceId = p.id; }
  } else if (activeView === 'deployments') {
    const d = deployments[selectedIndex];
    if (d) { initialYaml = generateDeployYaml(d); title = `Edit Deployment / ${d.name}`; resourceId = d.id; }
  } else if (activeView === 'services') {
    const s = services[selectedIndex];
    if (s) { initialYaml = generateServiceYaml(s); title = `Edit Service / ${s.name}`; resourceId = s.id; }
  }

  const [yaml, setYaml] = useState(initialYaml);

  useEffect(() => { setYaml(initialYaml); }, [initialYaml]);

  const save = () => {
    if (activeView === 'pods') editPodYaml(resourceId, yaml);
    else if (activeView === 'services') editServiceYaml(resourceId, yaml);
    setActivePanel(null);
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        <div className={styles.actions}>
          <button className={styles.saveBtn} onClick={save}>Save (Ctrl+S)</button>
          <button className={styles.close} onClick={() => setActivePanel(null)}>Cancel (Esc)</button>
        </div>
      </div>
      <div className={styles.content}>
        <textarea
          className={styles.editor}
          value={yaml}
          onChange={(e) => setYaml(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              save();
            }
            if (e.key === 'Escape') {
              setActivePanel(null);
            }
            if (e.key === 'Tab') {
              e.preventDefault();
              const start = e.currentTarget.selectionStart;
              const end = e.currentTarget.selectionEnd;
              setYaml(yaml.substring(0, start) + '  ' + yaml.substring(end));
              requestAnimationFrame(() => {
                e.currentTarget.selectionStart = start + 2;
                e.currentTarget.selectionEnd = start + 2;
              });
            }
          }}
          spellCheck={false}
        />
      </div>
    </div>
  );
}
