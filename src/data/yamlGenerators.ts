import type { Pod, Deployment, Service, Node, Namespace } from '../types';

export function generatePodYaml(p: Pod): string {
  return `apiVersion: v1
kind: Pod
metadata:
  name: ${p.name}
  namespace: ${p.namespace}
  labels:
${Object.entries(p.labels).map(([k, v]) => `    ${k}: ${v}`).join('\n')}
spec:
  nodeName: ${p.nodeName || '<none>'}
  containers:
${p.containers.map((c) => `  - name: ${c.name}
    image: ${c.image}${c.cpuRequest ? `
    resources:
      requests:
        cpu: ${c.cpuRequest}
        memory: ${c.memRequest || '64Mi'}
      limits:
        cpu: ${c.cpuLimit || c.cpuRequest}
        memory: ${c.memLimit || c.memRequest || '128Mi'}` : ''}`).join('\n')}
status:
  phase: ${p.status}
  conditions:
  - type: Ready
    status: "${p.ready.startsWith('1') ? 'True' : 'False'}"
  containerStatuses:
  - name: ${p.containers[0]?.name || 'container'}
    ready: ${p.ready.startsWith('1')}
    restartCount: ${p.restarts}
    state:
      ${p.status === 'Running' ? 'running:\n        startedAt: "2024-01-15T10:00:00Z"' : `terminated:\n        exitCode: 1\n        reason: ${p.status}`}`;
}

export function generateDeployYaml(d: Deployment): string {
  return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${d.name}
  namespace: ${d.namespace}
spec:
  replicas: ${d.replicas}
  selector:
    matchLabels:
${Object.entries(d.selector).map(([k, v]) => `      ${k}: ${v}`).join('\n')}
  strategy:
    type: ${d.strategy}
  template:
    metadata:
      labels:
${Object.entries(d.selector).map(([k, v]) => `        ${k}: ${v}`).join('\n')}
    spec:
      containers:
      - name: app
        image: ${d.image}${d.cpuRequest ? `
        resources:
          requests:
            cpu: ${d.cpuRequest}
            memory: ${d.memRequest || '128Mi'}` : ''}
status:
  availableReplicas: ${d.readyReplicas}
  readyReplicas: ${d.readyReplicas}
  replicas: ${d.replicas}
  updatedReplicas: ${d.updatedReplicas}`;
}

export function generateServiceYaml(s: Service): string {
  return `apiVersion: v1
kind: Service
metadata:
  name: ${s.name}
  namespace: ${s.namespace}
spec:
  type: ${s.type}
  clusterIP: ${s.clusterIP}
  selector:
${Object.entries(s.selector).length > 0
    ? Object.entries(s.selector).map(([k, v]) => `    ${k}: ${v}`).join('\n')
    : '    {}'}
  ports:
${s.ports.map((p) => `  - port: ${p.port}
    targetPort: ${p.targetPort}
    protocol: ${p.protocol}${p.nodePort ? `\n    nodePort: ${p.nodePort}` : ''}`).join('\n')}`;
}

export function generateNodeYaml(n: Node): string {
  return `apiVersion: v1
kind: Node
metadata:
  name: ${n.name}
  labels:
    kubernetes.io/hostname: ${n.name}
    node-role.kubernetes.io/${n.roles.replace('/', '-')}: ""
spec:
  unschedulable: false
status:
  capacity:
    cpu: "${n.cpuCapacity}"
    memory: "${n.memCapacity}"
  conditions:
  - type: Ready
    status: "${n.status === 'Ready' ? 'True' : 'False'}"
    reason: KubeletReady
  nodeInfo:
    kubeletVersion: ${n.version}
    osImage: Ubuntu 22.04.3 LTS
    containerRuntimeVersion: containerd://1.7.2`;
}

export function generateNsYaml(n: Namespace): string {
  return `apiVersion: v1
kind: Namespace
metadata:
  name: ${n.name}
  labels:
    kubernetes.io/metadata.name: ${n.name}
status:
  phase: ${n.status}`;
}
