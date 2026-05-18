import type {
  Pod, Deployment, Service, Node, Namespace, ConfigMap, Secret,
  StatefulSet, DaemonSet, Job, CronJob, Ingress, PersistentVolume,
  PersistentVolumeClaim, ReplicaSet, HPA, ServiceAccount, NetworkPolicy,
  PodDisruptionBudget, HelmRelease,
} from '../types';

const indent = (lvl: number) => '  '.repeat(lvl);

export function generatePodYaml(p: Pod): string {
  return `apiVersion: v1
kind: Pod
metadata:
  name: ${p.name}
  namespace: ${p.namespace}
  uid: ${p.id}
  labels:
${Object.entries(p.labels).map(([k, v]) => `    ${k}: ${v}`).join('\n')}${p.annotations ? `
  annotations:
${Object.entries(p.annotations).map(([k, v]) => `    ${k}: "${v}"`).join('\n')}` : ''}${p.owner ? `
  ownerReferences:
  - apiVersion: apps/v1
    kind: ${p.owner.kind}
    name: ${p.owner.name}
    controller: true
    blockOwnerDeletion: true` : ''}
spec:
  serviceAccountName: ${p.serviceAccount || 'default'}
  nodeName: ${p.nodeName || '<none>'}
  restartPolicy: Always
  dnsPolicy: ClusterFirst
  containers:
${p.containers.map((c) => `  - name: ${c.name}
    image: ${c.image}
    imagePullPolicy: IfNotPresent${c.ports ? `
    ports:
${c.ports.map((port) => `    - containerPort: ${port.containerPort}
      protocol: ${port.protocol}${port.name ? `\n      name: ${port.name}` : ''}`).join('\n')}` : ''}${c.cpuRequest || c.memRequest ? `
    resources:
      requests:${c.cpuRequest ? `
        cpu: ${c.cpuRequest}` : ''}${c.memRequest ? `
        memory: ${c.memRequest}` : ''}
      limits:${c.cpuLimit ? `
        cpu: ${c.cpuLimit}` : ''}${c.memLimit ? `
        memory: ${c.memLimit}` : ''}` : ''}${c.envVars ? `
    env:
${Object.entries(c.envVars).map(([k, v]) => `    - name: ${k}\n      value: "${v}"`).join('\n')}` : ''}`).join('\n')}
status:
  phase: ${p.status === 'Running' ? 'Running' : p.status === 'Pending' ? 'Pending' : p.status === 'Succeeded' ? 'Succeeded' : p.status === 'Failed' ? 'Failed' : 'Running'}
  podIP: ${p.ip || ''}
  hostIP: 10.0.1.${10 + (p.nodeName.endsWith('01') ? 0 : p.nodeName.endsWith('02') ? 1 : 2)}
  qosClass: ${p.qos || 'BestEffort'}
  conditions:
  - type: Initialized
    status: "True"
  - type: Ready
    status: "${p.ready.startsWith('1') ? 'True' : 'False'}"
  - type: ContainersReady
    status: "${p.ready.startsWith('1') ? 'True' : 'False'}"
  - type: PodScheduled
    status: "${p.nodeName ? 'True' : 'False'}"
  containerStatuses:
${p.containers.map((c) => `  - name: ${c.name}
    image: ${c.image}
    ready: ${p.ready.startsWith('1')}
    restartCount: ${p.restarts}
    state:
      ${p.status === 'Running' ? `running:\n        startedAt: "2024-01-15T10:00:00Z"` : p.status === 'CrashLoopBackOff' ? `waiting:\n        reason: CrashLoopBackOff\n        message: "back-off 5m0s restarting failed container=${c.name}"` : p.status === 'ImagePullBackOff' ? `waiting:\n        reason: ImagePullBackOff\n        message: "Back-off pulling image"` : p.status === 'Pending' ? `waiting:\n        reason: ContainerCreating` : `terminated:\n        exitCode: 1\n        reason: ${p.status}`}`).join('\n')}`;
}

export function generateDeployYaml(d: Deployment): string {
  return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${d.name}
  namespace: ${d.namespace}
  labels:
${Object.entries(d.selector).map(([k, v]) => `    ${k}: ${v}`).join('\n')}
  annotations:
    deployment.kubernetes.io/revision: "4"
spec:
  replicas: ${d.replicas}
  revisionHistoryLimit: 10
  selector:
    matchLabels:
${Object.entries(d.selector).map(([k, v]) => `      ${k}: ${v}`).join('\n')}
  strategy:
    type: ${d.strategy}${d.strategy === 'RollingUpdate' ? `
    rollingUpdate:
      maxUnavailable: 25%
      maxSurge: 25%` : ''}
  template:
    metadata:
      labels:
${Object.entries(d.selector).map(([k, v]) => `        ${k}: ${v}`).join('\n')}
    spec:
      containers:
      - name: app
        image: ${d.image}
        imagePullPolicy: IfNotPresent${d.cpuRequest ? `
        resources:
          requests:
            cpu: ${d.cpuRequest}
            memory: ${d.memRequest || '128Mi'}` : ''}
      restartPolicy: Always
      dnsPolicy: ClusterFirst
status:
  observedGeneration: 4
  replicas: ${d.replicas}
  updatedReplicas: ${d.updatedReplicas}
  readyReplicas: ${d.readyReplicas}
  availableReplicas: ${d.availableReplicas}
  conditions:
${(d.conditions || []).map((c) => `  - type: ${c.type}
    status: "${c.status}"
    reason: ${c.reason}`).join('\n')}`;
}

export function generateServiceYaml(s: Service): string {
  return `apiVersion: v1
kind: Service
metadata:
  name: ${s.name}
  namespace: ${s.namespace}
spec:
  type: ${s.type}
  clusterIP: ${s.clusterIP}${s.externalIP ? `
  externalIPs:
  - ${s.externalIP}` : ''}
  selector:
${Object.entries(s.selector).length > 0
    ? Object.entries(s.selector).map(([k, v]) => `    ${k}: ${v}`).join('\n')
    : '    {}'}
  ports:
${s.ports.map((p) => `  - port: ${p.port}
    targetPort: ${p.targetPort}
    protocol: ${p.protocol}${p.name ? `\n    name: ${p.name}` : ''}${p.nodePort ? `\n    nodePort: ${p.nodePort}` : ''}`).join('\n')}
status:
  loadBalancer:${s.externalIP ? `
    ingress:
    - ip: ${s.externalIP}` : ' {}'}`;
}

export function generateNodeYaml(n: Node): string {
  return `apiVersion: v1
kind: Node
metadata:
  name: ${n.name}
  labels:
    kubernetes.io/hostname: ${n.name}
    kubernetes.io/arch: amd64
    kubernetes.io/os: linux
    node-role.kubernetes.io/${n.roles.replace('/', '-')}: ""${n.taints ? `
spec:
  taints:
${n.taints.map((t) => `  - key: ${t.key}${t.value ? `\n    value: ${t.value}` : ''}\n    effect: ${t.effect}`).join('\n')}` : `
spec:
  unschedulable: false`}
status:
  capacity:
    cpu: "${n.cpuCapacity}"
    memory: "${n.memCapacity}"
    pods: "110"
  allocatable:
    cpu: "${n.cpuCapacity}"
    memory: "${n.memCapacity}"
    pods: "110"
  conditions:
  - type: Ready
    status: "${n.status === 'Ready' ? 'True' : 'False'}"
    reason: KubeletReady
    message: "kubelet is posting ready status"
  - type: MemoryPressure
    status: "False"
  - type: DiskPressure
    status: "False"
  addresses:
  - type: InternalIP
    address: ${n.internalIP}
  - type: Hostname
    address: ${n.name}
  nodeInfo:
    kubeletVersion: ${n.version}
    osImage: ${n.osImage}
    kernelVersion: ${n.kernel}
    containerRuntimeVersion: ${n.containerRuntime}
    architecture: amd64
    operatingSystem: linux`;
}

export function generateNsYaml(n: Namespace): string {
  return `apiVersion: v1
kind: Namespace
metadata:
  name: ${n.name}
  labels:
    kubernetes.io/metadata.name: ${n.name}
spec:
  finalizers:
  - kubernetes
status:
  phase: ${n.status}`;
}

export function generateConfigMapYaml(c: ConfigMap): string {
  return `apiVersion: v1
kind: ConfigMap
metadata:
  name: ${c.name}
  namespace: ${c.namespace}
data:
${Object.entries(c.data).map(([k, v]) => `  ${k}: |\n${v.split('\n').map((l) => indent(2) + l).join('\n')}`).join('\n')}`;
}

export function generateSecretYaml(s: Secret): string {
  return `apiVersion: v1
kind: Secret
metadata:
  name: ${s.name}
  namespace: ${s.namespace}
type: ${s.type}
data:
${s.dataKeys.map((k) => `  ${k}: <base64 redacted>`).join('\n')}`;
}

export function generateStatefulSetYaml(s: StatefulSet): string {
  return `apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: ${s.name}
  namespace: ${s.namespace}
spec:
  serviceName: ${s.serviceName}
  replicas: ${s.replicas}
  selector:
    matchLabels:
${Object.entries(s.selector).map(([k, v]) => `      ${k}: ${v}`).join('\n')}
  template:
    metadata:
      labels:
${Object.entries(s.selector).map(([k, v]) => `        ${k}: ${v}`).join('\n')}
    spec:
      containers:
      - name: ${s.name}
        image: ${s.image}
status:
  replicas: ${s.replicas}
  readyReplicas: ${s.readyReplicas}
  currentReplicas: ${s.replicas}`;
}

export function generateDaemonSetYaml(d: DaemonSet): string {
  return `apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: ${d.name}
  namespace: ${d.namespace}
spec:
  selector:
    matchLabels:
${Object.entries(d.selector).map(([k, v]) => `      ${k}: ${v}`).join('\n')}
  template:
    metadata:
      labels:
${Object.entries(d.selector).map(([k, v]) => `        ${k}: ${v}`).join('\n')}
    spec:
      containers:
      - name: ${d.name}
        image: ${d.image}
status:
  currentNumberScheduled: ${d.current}
  desiredNumberScheduled: ${d.desired}
  numberReady: ${d.ready}
  updatedNumberScheduled: ${d.upToDate}
  numberAvailable: ${d.available}`;
}

export function generateJobYaml(j: Job): string {
  return `apiVersion: batch/v1
kind: Job
metadata:
  name: ${j.name}
  namespace: ${j.namespace}
spec:
  completions: 1
  parallelism: 1
  backoffLimit: 6
  template:
    spec:
      containers:
      - name: job
        image: ${j.image}
      restartPolicy: OnFailure
status:
  succeeded: ${j.status === 'Complete' ? 1 : 0}
  failed: ${j.status === 'Failed' ? 1 : 0}
  conditions:
  - type: ${j.status === 'Complete' ? 'Complete' : j.status === 'Failed' ? 'Failed' : 'Running'}
    status: "True"`;
}

export function generateCronJobYaml(c: CronJob): string {
  return `apiVersion: batch/v1
kind: CronJob
metadata:
  name: ${c.name}
  namespace: ${c.namespace}
spec:
  schedule: "${c.schedule}"
  suspend: ${c.suspend}
  concurrencyPolicy: Allow
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 1
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: cron
            image: ${c.image}
          restartPolicy: OnFailure
status:
  active: ${c.active}
  lastScheduleTime: "${c.lastSchedule}"`;
}

export function generateIngressYaml(i: Ingress): string {
  return `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ${i.name}
  namespace: ${i.namespace}
spec:
  ingressClassName: ${i.className || 'nginx'}
  rules:
${i.rules.map((r) => `  - host: ${r.host}
    http:
      paths:
${r.paths.map((p) => `      - path: ${p.path}
        pathType: Prefix
        backend:
          service:
            name: ${p.serviceName}
            port:
              number: ${p.servicePort}`).join('\n')}`).join('\n')}
status:
  loadBalancer:
    ingress:
    - ip: ${i.address}`;
}

export function generatePVYaml(p: PersistentVolume): string {
  return `apiVersion: v1
kind: PersistentVolume
metadata:
  name: ${p.name}
spec:
  capacity:
    storage: ${p.capacity}
  accessModes:
  - ${p.accessModes === 'RWO' ? 'ReadWriteOnce' : p.accessModes === 'RWX' ? 'ReadWriteMany' : 'ReadOnlyMany'}
  persistentVolumeReclaimPolicy: ${p.reclaimPolicy}
  storageClassName: ${p.storageClass}${p.claim ? `
  claimRef:
    namespace: ${p.claim.split('/')[0]}
    name: ${p.claim.split('/')[1]}` : ''}
status:
  phase: ${p.status}`;
}

export function generatePVCYaml(p: PersistentVolumeClaim): string {
  return `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ${p.name}
  namespace: ${p.namespace}
spec:
  accessModes:
  - ${p.accessModes === 'RWO' ? 'ReadWriteOnce' : 'ReadWriteMany'}
  storageClassName: ${p.storageClass}
  resources:
    requests:
      storage: ${p.capacity}${p.volume ? `
  volumeName: ${p.volume}` : ''}
status:
  phase: ${p.status}${p.volume ? `
  capacity:
    storage: ${p.capacity}` : ''}`;
}

export function generateReplicaSetYaml(r: ReplicaSet): string {
  return `apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: ${r.name}
  namespace: ${r.namespace}
  ownerReferences:
  - apiVersion: apps/v1
    kind: Deployment
    name: ${r.ownerDeployment}
    controller: true
spec:
  replicas: ${r.desired}
  selector:
    matchLabels:
${Object.entries(r.selector).map(([k, v]) => `      ${k}: ${v}`).join('\n')}
  template:
    spec:
      containers:
      - name: app
        image: ${r.image}
status:
  replicas: ${r.current}
  readyReplicas: ${r.ready}`;
}

export function generateHPAYaml(h: HPA): string {
  return `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ${h.name}
  namespace: ${h.namespace}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: ${h.reference.split('/')[0]}
    name: ${h.reference.split('/')[1]}
  minReplicas: ${h.minPods}
  maxReplicas: ${h.maxPods}
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
status:
  currentReplicas: ${h.replicas}
  desiredReplicas: ${h.replicas}`;
}

export function generateServiceAccountYaml(s: ServiceAccount): string {
  return `apiVersion: v1
kind: ServiceAccount
metadata:
  name: ${s.name}
  namespace: ${s.namespace}
secrets:
- name: ${s.name}-token`;
}

export function generateNetworkPolicyYaml(n: NetworkPolicy): string {
  return `apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: ${n.name}
  namespace: ${n.namespace}
spec:
  podSelector: ${n.podSelector === '<none>' ? '{}' : `\n    matchLabels:\n      ${n.podSelector.replace('=', ': ')}`}
  policyTypes:
${n.policyTypes.split(',').map((t) => `  - ${t.trim()}`).join('\n')}`;
}

export function generatePDBYaml(p: PodDisruptionBudget): string {
  return `apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: ${p.name}
  namespace: ${p.namespace}
spec:${p.minAvailable ? `
  minAvailable: ${p.minAvailable}` : ''}${p.maxUnavailable ? `
  maxUnavailable: ${p.maxUnavailable}` : ''}
status:
  disruptionsAllowed: ${p.allowedDisruptions}`;
}

export function generateHelmYaml(h: HelmRelease): string {
  return `# Helm release: ${h.name}
name: ${h.name}
namespace: ${h.namespace}
revision: ${h.revision}
status: ${h.status}
chart: ${h.chart}
appVersion: ${h.appVersion}
updated: ${h.updated}`;
}
