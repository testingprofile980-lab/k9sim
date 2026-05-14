export type PodStatus =
  | 'Running'
  | 'Pending'
  | 'Error'
  | 'CrashLoopBackOff'
  | 'OOMKilled'
  | 'Evicted'
  | 'ImagePullBackOff'
  | 'Terminating'
  | 'Unknown'
  | 'Completed';

export type NodeStatus = 'Ready' | 'NotReady';
export type NamespaceStatus = 'Active' | 'Terminating';
export type ServiceType = 'ClusterIP' | 'NodePort' | 'LoadBalancer';
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
  nodeName: string;
  labels: Record<string, string>;
  events: K8sEvent[];
  logs: string[];
  failureType?: FailureType;
  containers: ContainerSpec[];
}

export interface ContainerSpec {
  name: string;
  image: string;
  cpuRequest?: string;
  cpuLimit?: string;
  memRequest?: string;
  memLimit?: string;
  envVars?: Record<string, string>;
}

export interface Deployment {
  id: string;
  name: string;
  namespace: string;
  replicas: number;
  readyReplicas: number;
  updatedReplicas: number;
  image: string;
  age: string;
  selector: Record<string, string>;
  strategy: 'RollingUpdate' | 'Recreate';
  cpuRequest?: string;
  memRequest?: string;
}

export interface Service {
  id: string;
  name: string;
  namespace: string;
  type: ServiceType;
  clusterIP: string;
  ports: ServicePort[];
  selector: Record<string, string>;
  age: string;
}

export interface ServicePort {
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
  age: string;
  pods: string[];
}

export interface Namespace {
  id: string;
  name: string;
  status: NamespaceStatus;
  age: string;
}

export type ViewType = 'pods' | 'deployments' | 'services' | 'nodes' | 'namespaces';
export type PanelType = 'logs' | 'describe' | 'yaml' | 'editor' | 'portforward' | 'exec' | null;
export type ModalType = 'podCreator' | 'scale' | 'failureInjector' | 'help' | null;

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
