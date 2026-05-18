import { useState } from 'react';
import { useStore } from '../../store';
import styles from './XRayView.module.css';

interface TreeNode {
  id: string;
  label: string;
  type: 'namespace' | 'deployment' | 'rs' | 'sts' | 'ds' | 'pod' | 'svc';
  status?: string;
  children?: TreeNode[];
}

function statusColor(status?: string): string {
  if (!status) return 'var(--text-muted)';
  if (status === 'Running' || status === 'Ready' || status === 'Bound' || status === 'Complete') return 'var(--green)';
  if (status === 'Pending') return 'var(--yellow)';
  if (status === 'CrashLoopBackOff' || status === 'OOMKilled' || status === 'Failed' || status === 'Error') return 'var(--red)';
  if (status === 'ImagePullBackOff' || status === 'ErrImagePull') return 'var(--orange)';
  return 'var(--text)';
}

function iconFor(type: TreeNode['type']): string {
  switch (type) {
    case 'namespace': return '📁';
    case 'deployment': return '⬢';
    case 'rs': return '◊';
    case 'sts': return '⬡';
    case 'ds': return '⬢';
    case 'pod': return '●';
    case 'svc': return '◯';
    default: return '·';
  }
}

function TreeRow({ node, depth, expanded, onToggle }: {
  node: TreeNode;
  depth: number;
  expanded: Set<string>;
  onToggle: (id: string) => void;
}) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expanded.has(node.id);
  const childCount = node.children?.length || 0;

  return (
    <>
      <div
        className={styles.row}
        style={{ paddingLeft: `${depth * 18 + 8}px` }}
        onClick={() => hasChildren && onToggle(node.id)}
      >
        <span className={styles.chev}>
          {hasChildren ? (isExpanded ? '▼' : '▶') : ' '}
        </span>
        <span className={styles.icon}>{iconFor(node.type)}</span>
        <span className={styles.kind}>{node.type}</span>
        <span className={styles.label}>{node.label}</span>
        {node.status && (
          <span style={{ color: statusColor(node.status) }} className={styles.status}>
            {node.status}
          </span>
        )}
        {hasChildren && (
          <span className={styles.count}>({childCount})</span>
        )}
      </div>
      {isExpanded && node.children?.map((c) => (
        <TreeRow key={c.id} node={c} depth={depth + 1} expanded={expanded} onToggle={onToggle} />
      ))}
    </>
  );
}

export function XRayView() {
  const pods = useStore((s) => s.pods);
  const deployments = useStore((s) => s.deployments);
  const replicasets = useStore((s) => s.replicasets);
  const statefulsets = useStore((s) => s.statefulsets);
  const daemonsets = useStore((s) => s.daemonsets);
  const services = useStore((s) => s.services);
  const namespaces = useStore((s) => s.namespaces);
  const activeNamespace = useStore((s) => s.activeNamespace);

  const [expanded, setExpanded] = useState<Set<string>>(new Set(['ns-production', 'ns-default', 'ns-monitoring']));

  const toggle = (id: string) => {
    setExpanded((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const tree: TreeNode[] = namespaces
    .filter((n) => activeNamespace === 'all' || n.name === activeNamespace)
    .map((ns) => {
      const nsDeploys = deployments.filter((d) => d.namespace === ns.name);
      const nsStatefulSets = statefulsets.filter((s) => s.namespace === ns.name);
      const nsDaemonSets = daemonsets.filter((d) => d.namespace === ns.name);
      const nsServices = services.filter((s) => s.namespace === ns.name);
      const orphanPods = pods.filter((p) => p.namespace === ns.name && !p.owner);

      const deployNodes: TreeNode[] = nsDeploys.map((d) => {
        const matchingRs = replicasets.filter((r) => r.namespace === d.namespace && r.ownerDeployment === d.name);
        const rsNodes: TreeNode[] = matchingRs.map((rs) => {
          const matchingPods = pods.filter((p) => p.ownerRsId === rs.id);
          return {
            id: `xr-rs-${rs.id}`,
            label: rs.name,
            type: 'rs',
            status: `${rs.ready}/${rs.desired}`,
            children: matchingPods.map((p) => ({
              id: `xr-pod-${p.id}`,
              label: p.name,
              type: 'pod' as const,
              status: p.status,
            })),
          };
        });
        return {
          id: `xr-deploy-${d.id}`,
          label: d.name,
          type: 'deployment',
          status: `${d.readyReplicas}/${d.replicas}`,
          children: rsNodes,
        };
      });

      const stsNodes: TreeNode[] = nsStatefulSets.map((s) => ({
        id: `xr-sts-${s.id}`,
        label: s.name,
        type: 'sts',
        status: `${s.readyReplicas}/${s.replicas}`,
      }));

      const dsNodes: TreeNode[] = nsDaemonSets.map((d) => ({
        id: `xr-ds-${d.id}`,
        label: d.name,
        type: 'ds',
        status: `${d.ready}/${d.desired}`,
      }));

      const svcNodes: TreeNode[] = nsServices.map((s) => ({
        id: `xr-svc-${s.id}`,
        label: s.name,
        type: 'svc',
        status: s.type,
      }));

      const orphanNodes: TreeNode[] = orphanPods.map((p) => ({
        id: `xr-pod-${p.id}`,
        label: p.name,
        type: 'pod',
        status: p.status,
      }));

      return {
        id: `xr-ns-${ns.id}`,
        label: ns.name,
        type: 'namespace',
        status: ns.status,
        children: [...deployNodes, ...stsNodes, ...dsNodes, ...svcNodes, ...orphanNodes],
      };
    });

  return (
    <div className={styles.xray}>
      <div className={styles.header}>
        <span className={styles.title}>XRay View — Cluster Resource Tree</span>
        <span className={styles.sub}>Click to expand/collapse. Showing owner-reference hierarchy.</span>
      </div>
      <div className={styles.tree}>
        {tree.map((n) => (
          <TreeRow key={n.id} node={n} depth={0} expanded={expanded} onToggle={toggle} />
        ))}
      </div>
    </div>
  );
}
