import { useStore } from '../../../store';
import styles from './DescribePanel.module.css';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>{title}:</div>
      <div className={styles.sectionBody}>{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>{label}:</span>
      <span className={styles.fieldValue}>{value}</span>
    </div>
  );
}

export function DescribePanel() {
  const activeView = useStore((s) => s.activeView);
  const selectedIndex = useStore((s) => s.selectedIndex);
  const pods = useStore((s) => s.pods);
  const deployments = useStore((s) => s.deployments);
  const services = useStore((s) => s.services);
  const nodes = useStore((s) => s.nodes);
  const namespaces = useStore((s) => s.namespaces);
  const setActivePanel = useStore((s) => s.setActivePanel);

  let content: React.ReactNode = null;
  let title = 'Describe';

  if (activeView === 'pods') {
    const pod = pods[selectedIndex];
    if (pod) {
      title = `Pod / ${pod.name}`;
      content = (
        <>
          <Section title="Metadata">
            <Field label="Name" value={<strong>{pod.name}</strong>} />
            <Field label="Namespace" value={<span style={{ color: 'var(--text-ns)' }}>{pod.namespace}</span>} />
            <Field label="Node" value={pod.nodeName || '—'} />
            <Field label="Age" value={pod.age} />
            <Field label="Labels" value={Object.entries(pod.labels).map(([k, v]) => `${k}=${v}`).join(', ')} />
          </Section>
          <Section title="Status">
            <Field label="Phase" value={<span className={`status-${pod.status.toLowerCase().replace(/[^a-z]/g, '')}`}>{pod.status}</span>} />
            <Field label="Ready" value={pod.ready} />
            <Field label="Restarts" value={pod.restarts} />
          </Section>
          <Section title="Containers">
            {pod.containers.map((c) => (
              <div key={c.name} className={styles.container}>
                <Field label="Name" value={c.name} />
                <Field label="Image" value={c.image} />
                {c.cpuRequest && <Field label="CPU Request/Limit" value={`${c.cpuRequest} / ${c.cpuLimit || '—'}`} />}
                {c.memRequest && <Field label="MEM Request/Limit" value={`${c.memRequest} / ${c.memLimit || '—'}`} />}
              </div>
            ))}
          </Section>
          {pod.events.length > 0 && (
            <Section title="Events">
              <table className={styles.eventsTable}>
                <thead>
                  <tr>
                    <th>TYPE</th>
                    <th>REASON</th>
                    <th>MESSAGE</th>
                  </tr>
                </thead>
                <tbody>
                  {pod.events.map((e) => (
                    <tr key={e.id}>
                      <td style={{ color: e.type === 'Warning' ? 'var(--yellow)' : 'var(--green)' }}>{e.type}</td>
                      <td style={{ color: 'var(--accent)' }}>{e.reason}</td>
                      <td style={{ color: 'var(--text)', whiteSpace: 'normal', wordBreak: 'break-word' }}>{e.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          )}
        </>
      );
    }
  } else if (activeView === 'deployments') {
    const deploy = deployments[selectedIndex];
    if (deploy) {
      title = `Deployment / ${deploy.name}`;
      content = (
        <>
          <Section title="Metadata">
            <Field label="Name" value={<strong>{deploy.name}</strong>} />
            <Field label="Namespace" value={<span style={{ color: 'var(--text-ns)' }}>{deploy.namespace}</span>} />
            <Field label="Age" value={deploy.age} />
          </Section>
          <Section title="Spec">
            <Field label="Replicas" value={`${deploy.readyReplicas}/${deploy.replicas} ready`} />
            <Field label="Strategy" value={deploy.strategy} />
            <Field label="Selector" value={Object.entries(deploy.selector).map(([k, v]) => `${k}=${v}`).join(', ')} />
          </Section>
          <Section title="Container">
            <Field label="Image" value={deploy.image} />
            {deploy.cpuRequest && <Field label="CPU Request" value={deploy.cpuRequest} />}
            {deploy.memRequest && <Field label="MEM Request" value={deploy.memRequest} />}
          </Section>
        </>
      );
    }
  } else if (activeView === 'services') {
    const svc = services[selectedIndex];
    if (svc) {
      title = `Service / ${svc.name}`;
      const hasSelector = Object.keys(svc.selector).length > 0;
      const selectorStr = hasSelector
        ? Object.entries(svc.selector).map(([k, v]) => `${k}=${v}`).join(', ')
        : '—';
      const selectorColor = svc.id === 'svc-api' && svc.selector['app'] === 'api-server-wrong' ? 'var(--red)' : 'var(--text)';
      content = (
        <>
          <Section title="Metadata">
            <Field label="Name" value={<strong>{svc.name}</strong>} />
            <Field label="Namespace" value={<span style={{ color: 'var(--text-ns)' }}>{svc.namespace}</span>} />
            <Field label="Age" value={svc.age} />
          </Section>
          <Section title="Spec">
            <Field label="Type" value={svc.type} />
            <Field label="ClusterIP" value={svc.clusterIP} />
            <Field label="Ports" value={svc.ports.map((p) => `${p.port}:${p.targetPort}/${p.protocol}`).join(', ')} />
            <Field label="Selector" value={<span style={{ color: selectorColor }}>{selectorStr}</span>} />
          </Section>
        </>
      );
    }
  } else if (activeView === 'nodes') {
    const node = nodes[selectedIndex];
    if (node) {
      title = `Node / ${node.name}`;
      content = (
        <>
          <Section title="Metadata">
            <Field label="Name" value={<strong>{node.name}</strong>} />
            <Field label="Roles" value={node.roles} />
            <Field label="Age" value={node.age} />
            <Field label="Version" value={node.version} />
          </Section>
          <Section title="Resources">
            <Field label="CPU" value={`${node.cpuUsage} / ${node.cpuCapacity}`} />
            <Field label="MEM" value={`${node.memUsage} / ${node.memCapacity}`} />
          </Section>
          <Section title="Status">
            <Field label="Status" value={<span style={{ color: node.status === 'Ready' ? 'var(--green)' : 'var(--red)' }}>{node.status}</span>} />
          </Section>
        </>
      );
    }
  } else if (activeView === 'namespaces') {
    const ns = namespaces[selectedIndex];
    if (ns) {
      title = `Namespace / ${ns.name}`;
      content = (
        <Section title="Metadata">
          <Field label="Name" value={<strong>{ns.name}</strong>} />
          <Field label="Status" value={ns.status} />
          <Field label="Age" value={ns.age} />
        </Section>
      );
    }
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        <button className={styles.close} onClick={() => setActivePanel(null)}>✕ Esc</button>
      </div>
      <div className={styles.content}>
        {content || <div className={styles.empty}>No resource selected</div>}
      </div>
    </div>
  );
}
