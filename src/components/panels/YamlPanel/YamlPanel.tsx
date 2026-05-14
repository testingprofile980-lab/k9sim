import { useStore } from '../../../store';
import { generatePodYaml, generateDeployYaml, generateServiceYaml, generateNodeYaml, generateNsYaml } from '../../../data/yamlGenerators';
import styles from './YamlPanel.module.css';

export function YamlPanel() {
  const activeView = useStore((s) => s.activeView);
  const selectedIndex = useStore((s) => s.selectedIndex);
  const pods = useStore((s) => s.pods);
  const deployments = useStore((s) => s.deployments);
  const services = useStore((s) => s.services);
  const nodes = useStore((s) => s.nodes);
  const namespaces = useStore((s) => s.namespaces);
  const setActivePanel = useStore((s) => s.setActivePanel);

  let yaml = '';
  let title = 'YAML';

  if (activeView === 'pods') {
    const p = pods[selectedIndex];
    if (p) { yaml = generatePodYaml(p); title = `Pod / ${p.name}`; }
  } else if (activeView === 'deployments') {
    const d = deployments[selectedIndex];
    if (d) { yaml = generateDeployYaml(d); title = `Deployment / ${d.name}`; }
  } else if (activeView === 'services') {
    const s = services[selectedIndex];
    if (s) { yaml = generateServiceYaml(s); title = `Service / ${s.name}`; }
  } else if (activeView === 'nodes') {
    const n = nodes[selectedIndex];
    if (n) { yaml = generateNodeYaml(n); title = `Node / ${n.name}`; }
  } else if (activeView === 'namespaces') {
    const ns = namespaces[selectedIndex];
    if (ns) { yaml = generateNsYaml(ns); title = `Namespace / ${ns.name}`; }
  }

  const copyYaml = () => {
    navigator.clipboard.writeText(yaml).catch(() => {});
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        <div className={styles.actions}>
          <button className={styles.btn} onClick={copyYaml}>Copy</button>
          <button className={styles.close} onClick={() => setActivePanel(null)}>✕ Esc</button>
        </div>
      </div>
      <div className={styles.content}>
        <pre className={styles.pre}>{yaml}</pre>
      </div>
    </div>
  );
}
