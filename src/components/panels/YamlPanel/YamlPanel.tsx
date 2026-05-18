import { useStore } from '../../../store';
import {
  generatePodYaml, generateDeployYaml, generateServiceYaml, generateNodeYaml,
  generateNsYaml, generateConfigMapYaml, generateSecretYaml, generateStatefulSetYaml,
  generateDaemonSetYaml, generateJobYaml, generateCronJobYaml, generateIngressYaml,
  generatePVYaml, generatePVCYaml, generateReplicaSetYaml, generateHPAYaml,
  generateServiceAccountYaml, generateNetworkPolicyYaml, generatePDBYaml,
  generateHelmYaml,
} from '../../../data/yamlGenerators';
import styles from './YamlPanel.module.css';

export function YamlPanel() {
  const s = useStore.getState();
  const activeView = useStore((s) => s.activeView);
  const selectedIndex = useStore((s) => s.selectedIndex);
  const setActivePanel = useStore((s) => s.setActivePanel);

  const getYamlForView = (): { yaml: string; title: string } => {
    const idx = selectedIndex;
    switch (activeView) {
      case 'pods': { const x = s.pods[idx]; return x ? { yaml: generatePodYaml(x), title: `Pod / ${x.name}` } : { yaml: '', title: 'YAML' }; }
      case 'deployments': { const x = s.deployments[idx]; return x ? { yaml: generateDeployYaml(x), title: `Deployment / ${x.name}` } : { yaml: '', title: 'YAML' }; }
      case 'services': { const x = s.services[idx]; return x ? { yaml: generateServiceYaml(x), title: `Service / ${x.name}` } : { yaml: '', title: 'YAML' }; }
      case 'nodes': { const x = s.nodes[idx]; return x ? { yaml: generateNodeYaml(x), title: `Node / ${x.name}` } : { yaml: '', title: 'YAML' }; }
      case 'namespaces': { const x = s.namespaces[idx]; return x ? { yaml: generateNsYaml(x), title: `Namespace / ${x.name}` } : { yaml: '', title: 'YAML' }; }
      case 'configmaps': { const x = s.configmaps[idx]; return x ? { yaml: generateConfigMapYaml(x), title: `ConfigMap / ${x.name}` } : { yaml: '', title: 'YAML' }; }
      case 'secrets': { const x = s.secrets[idx]; return x ? { yaml: generateSecretYaml(x), title: `Secret / ${x.name}` } : { yaml: '', title: 'YAML' }; }
      case 'statefulsets': { const x = s.statefulsets[idx]; return x ? { yaml: generateStatefulSetYaml(x), title: `StatefulSet / ${x.name}` } : { yaml: '', title: 'YAML' }; }
      case 'daemonsets': { const x = s.daemonsets[idx]; return x ? { yaml: generateDaemonSetYaml(x), title: `DaemonSet / ${x.name}` } : { yaml: '', title: 'YAML' }; }
      case 'jobs': { const x = s.jobs[idx]; return x ? { yaml: generateJobYaml(x), title: `Job / ${x.name}` } : { yaml: '', title: 'YAML' }; }
      case 'cronjobs': { const x = s.cronjobs[idx]; return x ? { yaml: generateCronJobYaml(x), title: `CronJob / ${x.name}` } : { yaml: '', title: 'YAML' }; }
      case 'ingress': { const x = s.ingress[idx]; return x ? { yaml: generateIngressYaml(x), title: `Ingress / ${x.name}` } : { yaml: '', title: 'YAML' }; }
      case 'pv': { const x = s.pvs[idx]; return x ? { yaml: generatePVYaml(x), title: `PV / ${x.name}` } : { yaml: '', title: 'YAML' }; }
      case 'pvc': { const x = s.pvcs[idx]; return x ? { yaml: generatePVCYaml(x), title: `PVC / ${x.name}` } : { yaml: '', title: 'YAML' }; }
      case 'replicasets': { const x = s.replicasets[idx]; return x ? { yaml: generateReplicaSetYaml(x), title: `ReplicaSet / ${x.name}` } : { yaml: '', title: 'YAML' }; }
      case 'hpa': { const x = s.hpas[idx]; return x ? { yaml: generateHPAYaml(x), title: `HPA / ${x.name}` } : { yaml: '', title: 'YAML' }; }
      case 'serviceaccounts': { const x = s.serviceaccounts[idx]; return x ? { yaml: generateServiceAccountYaml(x), title: `ServiceAccount / ${x.name}` } : { yaml: '', title: 'YAML' }; }
      case 'networkpolicies': { const x = s.networkpolicies[idx]; return x ? { yaml: generateNetworkPolicyYaml(x), title: `NetworkPolicy / ${x.name}` } : { yaml: '', title: 'YAML' }; }
      case 'pdb': { const x = s.pdbs[idx]; return x ? { yaml: generatePDBYaml(x), title: `PodDisruptionBudget / ${x.name}` } : { yaml: '', title: 'YAML' }; }
      case 'helm': { const x = s.helmReleases[idx]; return x ? { yaml: generateHelmYaml(x), title: `Helm / ${x.name}` } : { yaml: '', title: 'YAML' }; }
      default: return { yaml: '# No YAML available for this resource type', title: 'YAML' };
    }
  };

  const { yaml, title } = getYamlForView();

  const copyYaml = () => {
    navigator.clipboard.writeText(yaml).catch(() => {});
  };

  // basic syntax highlighting for YAML
  const highlightedLines = yaml.split('\n').map((line, i) => {
    if (line.match(/^\s*#/)) return <div key={i} style={{ color: 'var(--text-muted)' }}>{line}</div>;
    const m = line.match(/^(\s*)([\w.\-/]+):(.*)$/);
    if (m) {
      return (
        <div key={i}>
          <span>{m[1]}</span>
          <span style={{ color: 'var(--accent)' }}>{m[2]}</span>
          <span>:</span>
          <span style={{ color: line.includes('"') ? 'var(--green)' : 'var(--text)' }}>{m[3]}</span>
        </div>
      );
    }
    if (line.match(/^\s*-\s/)) {
      return <div key={i}><span style={{ color: 'var(--purple)' }}>{line}</span></div>;
    }
    return <div key={i}>{line}</div>;
  });

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
        <pre className={styles.pre}>{highlightedLines}</pre>
      </div>
    </div>
  );
}
