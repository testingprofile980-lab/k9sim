export type PodStatus =
  | 'Running'
  | 'Pending'
  | 'Error'
  | 'CrashLoopBackOff'
  | 'OOMKilled'
  | 'Evicted'
  | 'ImagePullBackOff'
  | 'ErrImagePull'
  | 'ContainerCreating'
  | 'Terminating'
  | 'Init'
  | 'Unknown'
  | 'Completed'
  | 'Succeeded'
  | 'Failed';

export type NodeStatus = 'Ready' | 'NotReady' | 'SchedulingDisabled';
export type NamespaceStatus = 'Active' | 'Terminating';
export type ServiceType = 'ClusterIP' | 'NodePort' | 'LoadBalancer' | 'ExternalName';
export type EventType = 'Normal' | 'Warning';
export type FailureType =
  | 'CrashLoopBackOff'
  | 'ImagePullBackOff'
  | 'OOMKilled'
  | 'Pending'
  | 'Evicted'
  | 'NodeNotReady';

export interface K8sEvent {
  id: string;
  namespace: string;
  reason: string;
  message: string;
  type: EventType;
  count: number;
  firstTime: string;
  lastTime: string;
  involvedObject: string;
  kind?: string;
  source?: string;
}

export interface Pod {
  id: string;
  name: string;
  namespace: string;
  image: string;
  status: PodStatus;
  ready: string;
  restarts: number;
  cpu: string;
  mem: string;
  age: string;
  ageSeconds: number;
  nodeName: string;
  ip?: string;
  qos?: 'Guaranteed' | 'Burstable' | 'BestEffort';
  serviceAccount?: string;
  labels: Record<string, string>;
  annotations?: Record<string, string>;
  events: K8sEvent[];
  logs: string[];
  failureType?: FailureType;
  containers: ContainerSpec[];
  owner?: { kind: string; name: string };
  ownerRsId?: string;
}

export interface ContainerSpec {
  name: string;
  image: string;
  cpuRequest?: string;
  cpuLimit?: string;
  memRequest?: string;
  memLimit?: string;
  envVars?: Record<string, string>;
  ports?: { name?: string; containerPort: number; protocol: 'TCP' | 'UDP' }[];
}

export interface Deployment {
  id: string;
  name: string;
  namespace: string;
  replicas: number;
  readyReplicas: number;
  updatedReplicas: number;
  availableReplicas: number;
  image: string;
  age: string;
  ageSeconds: number;
  selector: Record<string, string>;
  strategy: 'RollingUpdate' | 'Recreate';
  cpuRequest?: string;
  memRequest?: string;
  conditions?: { type: string; status: 'True' | 'False'; reason: string }[];
}

export interface ReplicaSet {
  id: string;
  name: string;
  namespace: string;
  desired: number;
  current: number;
  ready: number;
  age: string;
  ageSeconds: number;
  ownerDeployment: string;
  selector: Record<string, string>;
  image: string;
}

export interface Service {
  id: string;
  name: string;
  namespace: string;
  type: ServiceType;
  clusterIP: string;
  externalIP?: string;
  ports: ServicePort[];
  selector: Record<string, string>;
  age: string;
  ageSeconds: number;
}

export interface ServicePort {
  name?: string;
  port: number;
  targetPort: number;
  protocol: 'TCP' | 'UDP';
  nodePort?: number;
}

export interface Node {
  id: string;
  name: string;
  status: NodeStatus;
  roles: string;
  version: string;
  cpuCapacity: string;
  memCapacity: string;
  cpuUsage: string;
  memUsage: string;
  cpuPct: number;
  memPct: number;
  age: string;
  ageSeconds: number;
  pods: string[];
  internalIP: string;
  externalIP?: string;
  osImage: string;
  kernel: string;
  containerRuntime: string;
  taints?: { key: string; value?: string; effect: string }[];
}

export interface Namespace {
  id: string;
  name: string;
  status: NamespaceStatus;
  age: string;
  ageSeconds: number;
  labels?: Record<string, string>;
}

export interface ConfigMap {
  id: string;
  name: string;
  namespace: string;
  dataKeys: string[];
  data: Record<string, string>;
  age: string;
  ageSeconds: number;
}

export interface Secret {
  id: string;
  name: string;
  namespace: string;
  type: string;
  dataKeys: string[];
  age: string;
  ageSeconds: number;
}

export interface StatefulSet {
  id: string;
  name: string;
  namespace: string;
  replicas: number;
  readyReplicas: number;
  image: string;
  serviceName: string;
  age: string;
  ageSeconds: number;
  selector: Record<string, string>;
}

export interface DaemonSet {
  id: string;
  name: string;
  namespace: string;
  desired: number;
  current: number;
  ready: number;
  upToDate: number;
  available: number;
  image: string;
  age: string;
  ageSeconds: number;
  selector: Record<string, string>;
}

export interface Job {
  id: string;
  name: string;
  namespace: string;
  completions: string;
  duration: string;
  image: string;
  age: string;
  ageSeconds: number;
  status: 'Running' | 'Complete' | 'Failed';
}

export interface CronJob {
  id: string;
  name: string;
  namespace: string;
  schedule: string;
  suspend: boolean;
  active: number;
  lastSchedule: string;
  image: string;
  age: string;
  ageSeconds: number;
}

export interface Ingress {
  id: string;
  name: string;
  namespace: string;
  className?: string;
  hosts: string[];
  address: string;
  ports: string;
  age: string;
  ageSeconds: number;
  rules: IngressRule[];
}

export interface IngressRule {
  host: string;
  paths: { path: string; serviceName: string; servicePort: number }[];
}

export interface PersistentVolume {
  id: string;
  name: string;
  capacity: string;
  accessModes: string;
  reclaimPolicy: string;
  status: 'Bound' | 'Available' | 'Released' | 'Failed';
  claim?: string;
  storageClass: string;
  age: string;
  ageSeconds: number;
}

export interface PersistentVolumeClaim {
  id: string;
  name: string;
  namespace: string;
  status: 'Bound' | 'Pending' | 'Lost';
  volume?: string;
  capacity: string;
  accessModes: string;
  storageClass: string;
  age: string;
  ageSeconds: number;
}

export interface HPA {
  id: string;
  name: string;
  namespace: string;
  reference: string;
  targets: string;
  minPods: number;
  maxPods: number;
  replicas: number;
  age: string;
  ageSeconds: number;
}

export interface ServiceAccount {
  id: string;
  name: string;
  namespace: string;
  secrets: number;
  age: string;
  ageSeconds: number;
}

export interface NetworkPolicy {
  id: string;
  name: string;
  namespace: string;
  podSelector: string;
  policyTypes: string;
  age: string;
  ageSeconds: number;
}

export interface PodDisruptionBudget {
  id: string;
  name: string;
  namespace: string;
  minAvailable?: string;
  maxUnavailable?: string;
  allowedDisruptions: number;
  age: string;
  ageSeconds: number;
}

export interface RoleBinding {
  id: string;
  name: string;
  namespace: string;
  role: string;
  subjects: string;
  age: string;
  ageSeconds: number;
}

export interface ClusterRole {
  id: string;
  name: string;
  age: string;
  ageSeconds: number;
}

export interface ClusterRoleBinding {
  id: string;
  name: string;
  role: string;
  subjects: string;
  age: string;
  ageSeconds: number;
}

export interface HelmRelease {
  id: string;
  name: string;
  namespace: string;
  revision: number;
  status: 'deployed' | 'failed' | 'pending-upgrade' | 'superseded';
  chart: string;
  appVersion: string;
  updated: string;
}

export interface Context {
  id: string;
  name: string;
  cluster: string;
  user: string;
  namespace: string;
  current: boolean;
}

export interface PopeyeIssue {
  id: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  resource: string;
  kind: string;
  namespace: string;
  message: string;
  ruleId: string;
}

export type ViewType =
  | 'pods'
  | 'deployments'
  | 'services'
  | 'nodes'
  | 'namespaces'
  | 'configmaps'
  | 'secrets'
  | 'statefulsets'
  | 'daemonsets'
  | 'jobs'
  | 'cronjobs'
  | 'ingress'
  | 'pv'
  | 'pvc'
  | 'replicasets'
  | 'hpa'
  | 'serviceaccounts'
  | 'networkpolicies'
  | 'pdb'
  | 'rolebindings'
  | 'clusterroles'
  | 'clusterrolebindings'
  | 'events'
  | 'helm'
  | 'contexts'
  | 'pulse'
  | 'xray'
  | 'popeye';

export type PanelType = 'logs' | 'describe' | 'yaml' | 'editor' | 'portforward' | 'exec' | null;
export type ModalType = 'podCreator' | 'scale' | 'failureInjector' | 'help' | 'cordon' | null;

export interface ScenarioTask {
  id: string;
  instruction: string;
  hint: string;
  validationEvent: string;
  validationTarget?: string;
}

export interface Scenario {
  id: string;
  title: string;
  briefing: string;
  tasks: ScenarioTask[];
  debrief: string;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
