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

function EventTable({ events }: { events: { id: string; type: string; reason: string; message: string; firstTime: string; lastTime: string; count?: number }[] }) {
  if (events.length === 0) return <div style={{ color: 'var(--text-muted)' }}>&lt;none&gt;</div>;
  return (
    <table className={styles.eventsTable}>
      <thead>
        <tr>
          <th>TYPE</th>
          <th>REASON</th>
          <th>AGE</th>
          <th>FROM</th>
          <th>MESSAGE</th>
        </tr>
      </thead>
      <tbody>
        {events.map((e) => (
          <tr key={e.id}>
            <td style={{ color: e.type === 'Warning' ? 'var(--yellow)' : 'var(--green)' }}>{e.type}</td>
            <td style={{ color: 'var(--accent)' }}>{e.reason}</td>
            <td style={{ color: 'var(--text-muted)' }}>{e.lastTime}</td>
            <td style={{ color: 'var(--text-muted)' }}>kubelet</td>
            <td style={{ color: 'var(--text)', whiteSpace: 'normal', wordBreak: 'break-word' }}>{e.message}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function DescribePanel() {
  const s = useStore.getState();
  const activeView = useStore((s) => s.activeView);
  const selectedIndex = useStore((s) => s.selectedIndex);
  const setActivePanel = useStore((s) => s.setActivePanel);

  let content: React.ReactNode = null;
  let title = 'Describe';

  if (activeView === 'pods') {
    const pod = s.pods[selectedIndex];
    if (pod) {
      title = `Pod / ${pod.name}`;
      content = (
        <>
          <Section title="Metadata">
            <Field label="Name" value={<strong>{pod.name}</strong>} />
            <Field label="Namespace" value={<span style={{ color: 'var(--text-ns)' }}>{pod.namespace}</span>} />
            <Field label="Priority" value="0" />
            <Field label="Service Account" value={pod.serviceAccount || 'default'} />
            <Field label="Node" value={pod.nodeName ? `${pod.nodeName}/10.0.1.x` : '<none>'} />
            <Field label="Start Time" value={pod.age + ' ago'} />
            <Field label="Labels" value={Object.entries(pod.labels).map(([k, v]) => `${k}=${v}`).join(', ')} />
            {pod.annotations && <Field label="Annotations" value={Object.entries(pod.annotations).map(([k, v]) => `${k}: ${v}`).join('\n')} />}
            {pod.owner && <Field label="Controlled By" value={`${pod.owner.kind}/${pod.owner.name}`} />}
            <Field label="IP" value={pod.ip || '<none>'} />
            <Field label="QoS Class" value={pod.qos || 'BestEffort'} />
          </Section>
          <Section title="Status">
            <Field label="Status" value={<span className={`status-${pod.status.toLowerCase().replace(/[^a-z]/g, '')}`}>{pod.status}</span>} />
            <Field label="Ready" value={pod.ready} />
            <Field label="Restarts" value={pod.restarts} />
            <Field label="Age" value={pod.age} />
          </Section>
          <Section title="Containers">
            {pod.containers.map((c) => (
              <div key={c.name} className={styles.container}>
                <Field label="Name" value={<strong>{c.name}</strong>} />
                <Field label="Image" value={c.image} />
                <Field label="Image ID" value={`docker-pullable://${c.image}@sha256:abc123...`} />
                {c.ports && c.ports.length > 0 && (
                  <Field label="Ports" value={c.ports.map((p) => `${p.containerPort}/${p.protocol}`).join(', ')} />
                )}
                <Field label="State" value={<span style={{ color: pod.status === 'Running' ? 'var(--green)' : 'var(--red)' }}>{pod.status === 'Running' ? 'Running' : pod.status === 'Pending' ? 'Waiting' : 'Terminated'}</span>} />
                <Field label="Ready" value={String(pod.ready.startsWith('1'))} />
                <Field label="Restart Count" value={pod.restarts} />
                {c.cpuRequest && (
                  <>
                    <Field label="Limits" value={`cpu: ${c.cpuLimit || '—'}, memory: ${c.memLimit || '—'}`} />
                    <Field label="Requests" value={`cpu: ${c.cpuRequest}, memory: ${c.memRequest || '—'}`} />
                  </>
                )}
                {c.envVars && (
                  <Field label="Environment" value={Object.entries(c.envVars).map(([k, v]) => `${k}=${v}`).join('\n')} />
                )}
                <Field label="Mounts" value={`/var/run/secrets/kubernetes.io/serviceaccount from ${pod.serviceAccount || 'default'}-token (ro)`} />
              </div>
            ))}
          </Section>
          <Section title="Conditions">
            <table className={styles.eventsTable}>
              <thead><tr><th>Type</th><th>Status</th></tr></thead>
              <tbody>
                <tr><td>Initialized</td><td style={{ color: 'var(--green)' }}>True</td></tr>
                <tr><td>Ready</td><td style={{ color: pod.ready.startsWith('1') ? 'var(--green)' : 'var(--red)' }}>{pod.ready.startsWith('1') ? 'True' : 'False'}</td></tr>
                <tr><td>ContainersReady</td><td style={{ color: pod.ready.startsWith('1') ? 'var(--green)' : 'var(--red)' }}>{pod.ready.startsWith('1') ? 'True' : 'False'}</td></tr>
                <tr><td>PodScheduled</td><td style={{ color: pod.nodeName ? 'var(--green)' : 'var(--red)' }}>{pod.nodeName ? 'True' : 'False'}</td></tr>
              </tbody>
            </table>
          </Section>
          <Section title="Events">
            <EventTable events={pod.events} />
          </Section>
        </>
      );
    }
  } else if (activeView === 'deployments') {
    const d = s.deployments[selectedIndex];
    if (d) {
      title = `Deployment / ${d.name}`;
      content = (
        <>
          <Section title="Metadata">
            <Field label="Name" value={<strong>{d.name}</strong>} />
            <Field label="Namespace" value={<span style={{ color: 'var(--text-ns)' }}>{d.namespace}</span>} />
            <Field label="CreationTimestamp" value={d.age + ' ago'} />
            <Field label="Labels" value={Object.entries(d.selector).map(([k, v]) => `${k}=${v}`).join(', ')} />
            <Field label="Annotations" value="deployment.kubernetes.io/revision: 4" />
            <Field label="Selector" value={Object.entries(d.selector).map(([k, v]) => `${k}=${v}`).join(', ')} />
          </Section>
          <Section title="Status">
            <Field label="Replicas" value={`${d.replicas} desired | ${d.updatedReplicas} updated | ${d.replicas} total | ${d.availableReplicas} available | ${d.replicas - d.availableReplicas} unavailable`} />
            <Field label="StrategyType" value={d.strategy} />
            {d.strategy === 'RollingUpdate' && (
              <Field label="RollingUpdateStrategy" value="25% max unavailable, 25% max surge" />
            )}
          </Section>
          <Section title="Pod Template">
            <Field label="Labels" value={Object.entries(d.selector).map(([k, v]) => `${k}=${v}`).join(', ')} />
            <Field label="Containers" value={
              <div>
                <strong>app:</strong>
                <div style={{ paddingLeft: 16 }}>
                  Image: {d.image}<br />
                  Port: 8080/TCP<br />
                  {d.cpuRequest && `Limits: cpu ${d.cpuRequest}, memory: ${d.memRequest}`}<br />
                  {d.cpuRequest && `Requests: cpu ${d.cpuRequest}, memory: ${d.memRequest}`}
                </div>
              </div>
            } />
          </Section>
          {d.conditions && (
            <Section title="Conditions">
              <table className={styles.eventsTable}>
                <thead><tr><th>Type</th><th>Status</th><th>Reason</th></tr></thead>
                <tbody>
                  {d.conditions.map((c, i) => (
                    <tr key={i}>
                      <td>{c.type}</td>
                      <td style={{ color: c.status === 'True' ? 'var(--green)' : 'var(--red)' }}>{c.status}</td>
                      <td>{c.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          )}
        </>
      );
    }
  } else if (activeView === 'services') {
    const svc = s.services[selectedIndex];
    if (svc) {
      title = `Service / ${svc.name}`;
      const hasSelector = Object.keys(svc.selector).length > 0;
      const selectorStr = hasSelector
        ? Object.entries(svc.selector).map(([k, v]) => `${k}=${v}`).join(', ')
        : '<none>';
      const selectorColor = svc.id === 'svc-api' && svc.selector['app'] === 'api-server-wrong' ? 'var(--red)' : 'var(--text)';
      // resolve endpoints
      const matchedPods = s.pods.filter((p) =>
        p.namespace === svc.namespace &&
        Object.entries(svc.selector).every(([k, v]) => p.labels[k] === v) &&
        p.status === 'Running'
      );
      content = (
        <>
          <Section title="Metadata">
            <Field label="Name" value={<strong>{svc.name}</strong>} />
            <Field label="Namespace" value={<span style={{ color: 'var(--text-ns)' }}>{svc.namespace}</span>} />
            <Field label="Age" value={svc.age} />
          </Section>
          <Section title="Spec">
            <Field label="Type" value={svc.type} />
            <Field label="IP Family Policy" value="SingleStack" />
            <Field label="IP Families" value="IPv4" />
            <Field label="IP" value={svc.clusterIP} />
            {svc.externalIP && <Field label="LoadBalancer Ingress" value={svc.externalIP} />}
            <Field label="Port" value={svc.ports.map((p) => `${p.name || '<unnamed>'} ${p.port}/${p.protocol}`).join(', ')} />
            <Field label="TargetPort" value={svc.ports.map((p) => `${p.targetPort}/${p.protocol}`).join(', ')} />
            {svc.ports.find((p) => p.nodePort) && (
              <Field label="NodePort" value={svc.ports.filter((p) => p.nodePort).map((p) => `${p.nodePort}/${p.protocol}`).join(', ')} />
            )}
            <Field label="Selector" value={<span style={{ color: selectorColor }}>{selectorStr}</span>} />
            <Field label="Session Affinity" value="None" />
          </Section>
          <Section title="Endpoints">
            <Field
              label="Endpoints"
              value={
                <span style={{ color: matchedPods.length === 0 ? 'var(--red)' : 'var(--green)' }}>
                  {matchedPods.length === 0
                    ? '<none>  ← WARNING: no pods match the selector!'
                    : matchedPods.map((p) => `${p.ip}:${svc.ports[0]?.targetPort}`).join(', ')}
                </span>
              }
            />
          </Section>
        </>
      );
    }
  } else if (activeView === 'nodes') {
    const n = s.nodes[selectedIndex];
    if (n) {
      title = `Node / ${n.name}`;
      const podsOnNode = s.pods.filter((p) => p.nodeName === n.name);
      content = (
        <>
          <Section title="Metadata">
            <Field label="Name" value={<strong>{n.name}</strong>} />
            <Field label="Roles" value={n.roles} />
            <Field label="Labels" value={`kubernetes.io/hostname=${n.name}, kubernetes.io/os=linux, kubernetes.io/arch=amd64`} />
            <Field label="CreationTimestamp" value={n.age + ' ago'} />
            {n.taints && n.taints.length > 0 && (
              <Field label="Taints" value={n.taints.map((t) => `${t.key}=${t.value || ''}:${t.effect}`).join('\n')} />
            )}
            <Field label="Unschedulable" value={String(n.status === 'SchedulingDisabled')} />
          </Section>
          <Section title="Conditions">
            <table className={styles.eventsTable}>
              <thead><tr><th>Type</th><th>Status</th><th>Reason</th></tr></thead>
              <tbody>
                <tr><td>Ready</td><td style={{ color: n.status === 'Ready' ? 'var(--green)' : 'var(--red)' }}>{n.status === 'Ready' ? 'True' : 'False'}</td><td>KubeletReady</td></tr>
                <tr><td>MemoryPressure</td><td style={{ color: 'var(--green)' }}>False</td><td>KubeletHasSufficientMemory</td></tr>
                <tr><td>DiskPressure</td><td style={{ color: 'var(--green)' }}>False</td><td>KubeletHasNoDiskPressure</td></tr>
                <tr><td>PIDPressure</td><td style={{ color: 'var(--green)' }}>False</td><td>KubeletHasSufficientPID</td></tr>
              </tbody>
            </table>
          </Section>
          <Section title="Addresses">
            <Field label="InternalIP" value={n.internalIP} />
            <Field label="Hostname" value={n.name} />
          </Section>
          <Section title="Capacity">
            <Field label="cpu" value={n.cpuCapacity} />
            <Field label="memory" value={n.memCapacity} />
            <Field label="pods" value="110" />
          </Section>
          <Section title="Allocated Resources">
            <Field label="CPU Requests" value={`${n.cpuUsage} (${n.cpuPct}%)`} />
            <Field label="Memory Requests" value={`${n.memUsage} (${n.memPct}%)`} />
            <Field label="Pods on node" value={`${podsOnNode.length} / 110`} />
          </Section>
          <Section title="System Info">
            <Field label="Kernel Version" value={n.kernel} />
            <Field label="OS Image" value={n.osImage} />
            <Field label="Architecture" value="amd64" />
            <Field label="Container Runtime" value={n.containerRuntime} />
            <Field label="Kubelet Version" value={n.version} />
            <Field label="Kube-Proxy Version" value={n.version} />
          </Section>
        </>
      );
    }
  } else if (activeView === 'namespaces') {
    const ns = s.namespaces[selectedIndex];
    if (ns) {
      title = `Namespace / ${ns.name}`;
      content = (
        <Section title="Metadata">
          <Field label="Name" value={<strong>{ns.name}</strong>} />
          <Field label="Status" value={ns.status} />
          <Field label="Age" value={ns.age} />
          <Field label="Labels" value={Object.entries(ns.labels || {}).map(([k, v]) => `${k}=${v}`).join(', ') || '<none>'} />
        </Section>
      );
    }
  } else if (activeView === 'configmaps') {
    const cm = s.configmaps[selectedIndex];
    if (cm) {
      title = `ConfigMap / ${cm.name}`;
      content = (
        <>
          <Section title="Metadata">
            <Field label="Name" value={<strong>{cm.name}</strong>} />
            <Field label="Namespace" value={<span style={{ color: 'var(--text-ns)' }}>{cm.namespace}</span>} />
            <Field label="Age" value={cm.age} />
          </Section>
          <Section title="Data">
            {Object.entries(cm.data).map(([k, v]) => (
              <div key={k} style={{ marginBottom: 8 }}>
                <div style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{k}:</div>
                <pre style={{ paddingLeft: 16, color: 'var(--text-muted)', margin: 0 }}>{v}</pre>
              </div>
            ))}
          </Section>
        </>
      );
    }
  } else if (activeView === 'secrets') {
    const sec = s.secrets[selectedIndex];
    if (sec) {
      title = `Secret / ${sec.name}`;
      content = (
        <>
          <Section title="Metadata">
            <Field label="Name" value={<strong>{sec.name}</strong>} />
            <Field label="Namespace" value={<span style={{ color: 'var(--text-ns)' }}>{sec.namespace}</span>} />
            <Field label="Type" value={sec.type} />
            <Field label="Age" value={sec.age} />
          </Section>
          <Section title="Data (keys redacted)">
            {sec.dataKeys.map((k) => (
              <Field key={k} label={k} value={<span style={{ color: 'var(--text-muted)' }}>(redacted, ~32 bytes)</span>} />
            ))}
          </Section>
        </>
      );
    }
  } else if (activeView === 'ingress') {
    const ing = s.ingress[selectedIndex];
    if (ing) {
      title = `Ingress / ${ing.name}`;
      content = (
        <>
          <Section title="Metadata">
            <Field label="Name" value={<strong>{ing.name}</strong>} />
            <Field label="Namespace" value={<span style={{ color: 'var(--text-ns)' }}>{ing.namespace}</span>} />
            <Field label="IngressClass" value={ing.className || '<none>'} />
            <Field label="Address" value={ing.address} />
            <Field label="Age" value={ing.age} />
          </Section>
          <Section title="Rules">
            <table className={styles.eventsTable}>
              <thead><tr><th>Host</th><th>Path</th><th>Backend</th></tr></thead>
              <tbody>
                {ing.rules.flatMap((r) =>
                  r.paths.map((p, i) => (
                    <tr key={`${r.host}-${i}`}>
                      <td style={{ color: 'var(--accent)' }}>{r.host}</td>
                      <td>{p.path}</td>
                      <td>{p.serviceName}:{p.servicePort}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Section>
        </>
      );
    }
  } else if (activeView === 'statefulsets') {
    const sts = s.statefulsets[selectedIndex];
    if (sts) {
      title = `StatefulSet / ${sts.name}`;
      content = (
        <>
          <Section title="Metadata">
            <Field label="Name" value={<strong>{sts.name}</strong>} />
            <Field label="Namespace" value={<span style={{ color: 'var(--text-ns)' }}>{sts.namespace}</span>} />
            <Field label="Service Name" value={sts.serviceName} />
            <Field label="Age" value={sts.age} />
          </Section>
          <Section title="Status">
            <Field label="Replicas" value={`${sts.readyReplicas}/${sts.replicas} ready`} />
            <Field label="Selector" value={Object.entries(sts.selector).map(([k, v]) => `${k}=${v}`).join(', ')} />
            <Field label="Image" value={sts.image} />
          </Section>
        </>
      );
    }
  } else if (activeView === 'pv') {
    const pv = s.pvs[selectedIndex];
    if (pv) {
      title = `PersistentVolume / ${pv.name}`;
      content = (
        <Section title="Spec">
          <Field label="Name" value={<strong>{pv.name}</strong>} />
          <Field label="Capacity" value={pv.capacity} />
          <Field label="Access Modes" value={pv.accessModes} />
          <Field label="Reclaim Policy" value={pv.reclaimPolicy} />
          <Field label="Status" value={<span style={{ color: pv.status === 'Bound' ? 'var(--green)' : 'var(--yellow)' }}>{pv.status}</span>} />
          <Field label="Claim" value={pv.claim || '<none>'} />
          <Field label="StorageClass" value={pv.storageClass} />
          <Field label="Age" value={pv.age} />
        </Section>
      );
    }
  } else if (activeView === 'pvc') {
    const pvc = s.pvcs[selectedIndex];
    if (pvc) {
      title = `PVC / ${pvc.name}`;
      content = (
        <Section title="Spec">
          <Field label="Name" value={<strong>{pvc.name}</strong>} />
          <Field label="Namespace" value={<span style={{ color: 'var(--text-ns)' }}>{pvc.namespace}</span>} />
          <Field label="Status" value={<span style={{ color: pvc.status === 'Bound' ? 'var(--green)' : 'var(--yellow)' }}>{pvc.status}</span>} />
          <Field label="Volume" value={pvc.volume || '<none>'} />
          <Field label="Capacity" value={pvc.capacity} />
          <Field label="Access Modes" value={pvc.accessModes} />
          <Field label="StorageClass" value={pvc.storageClass} />
          <Field label="Age" value={pvc.age} />
        </Section>
      );
    }
  } else if (activeView === 'hpa') {
    const hpa = s.hpas[selectedIndex];
    if (hpa) {
      title = `HPA / ${hpa.name}`;
      content = (
        <Section title="Spec">
          <Field label="Name" value={<strong>{hpa.name}</strong>} />
          <Field label="Namespace" value={<span style={{ color: 'var(--text-ns)' }}>{hpa.namespace}</span>} />
          <Field label="Reference" value={hpa.reference} />
          <Field label="Targets" value={hpa.targets} />
          <Field label="Min Replicas" value={hpa.minPods} />
          <Field label="Max Replicas" value={hpa.maxPods} />
          <Field label="Current Replicas" value={hpa.replicas} />
          <Field label="Age" value={hpa.age} />
        </Section>
      );
    }
  } else if (activeView === 'helm') {
    const h = s.helmReleases[selectedIndex];
    if (h) {
      title = `Helm Release / ${h.name}`;
      content = (
        <Section title="Release">
          <Field label="Name" value={<strong>{h.name}</strong>} />
          <Field label="Namespace" value={<span style={{ color: 'var(--text-ns)' }}>{h.namespace}</span>} />
          <Field label="Revision" value={h.revision} />
          <Field label="Status" value={<span style={{ color: h.status === 'deployed' ? 'var(--green)' : 'var(--yellow)' }}>{h.status}</span>} />
          <Field label="Chart" value={h.chart} />
          <Field label="App Version" value={h.appVersion} />
          <Field label="Last Updated" value={h.updated} />
        </Section>
      );
    }
  } else if (activeView === 'events') {
    const ev = s.clusterEvents[selectedIndex];
    if (ev) {
      title = `Event / ${ev.reason}`;
      content = (
        <Section title="Event">
          <Field label="Type" value={<span style={{ color: ev.type === 'Warning' ? 'var(--yellow)' : 'var(--green)' }}>{ev.type}</span>} />
          <Field label="Reason" value={ev.reason} />
          <Field label="Kind" value={ev.kind || 'Pod'} />
          <Field label="Object" value={ev.involvedObject} />
          <Field label="Namespace" value={<span style={{ color: 'var(--text-ns)' }}>{ev.namespace}</span>} />
          <Field label="Message" value={ev.message} />
          <Field label="Count" value={ev.count} />
          <Field label="First Seen" value={ev.firstTime} />
          <Field label="Last Seen" value={ev.lastTime} />
          <Field label="Source" value={ev.source || 'kubelet'} />
        </Section>
      );
    }
  }

  if (!content) {
    content = <div className={styles.empty}>No resource selected, or describe not implemented for this resource.</div>;
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        <button className={styles.close} onClick={() => setActivePanel(null)}>✕ Esc</button>
      </div>
      <div className={styles.content}>
        {content}
      </div>
    </div>
  );
}
