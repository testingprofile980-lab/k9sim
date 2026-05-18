import { create } from 'zustand';
import type {
  Pod, Deployment, Service, Node, Namespace, ViewType, PanelType, ModalType,
  Toast, FailureType, K8sEvent, ConfigMap, Secret, StatefulSet, DaemonSet,
  Job, CronJob, Ingress, PersistentVolume, PersistentVolumeClaim, ReplicaSet,
  HPA, ServiceAccount, NetworkPolicy, PodDisruptionBudget, RoleBinding,
  ClusterRole, ClusterRoleBinding, HelmRelease, Context, PopeyeIssue,
} from '../types';
import {
  initialPods, initialDeployments, initialServices, initialNodes, initialNamespaces,
  initialConfigMaps, initialSecrets, initialStatefulSets, initialDaemonSets,
  initialJobs, initialCronJobs, initialIngress, initialPVs, initialPVCs,
  initialReplicaSets, initialHPAs, initialServiceAccounts, initialNetworkPolicies,
  initialPDBs, initialRoleBindings, initialClusterRoles, initialClusterRoleBindings,
  initialHelm, initialContexts, initialPopeye, initialClusterEvents,
} from '../data/initialCluster';
import { scenarios } from '../data/scenarios';

let toastCounter = 0;
const genId = () => `${Date.now()}-${++toastCounter}`;

function fmtAge(seconds: number): string {
  if (seconds < 60) return `${Math.floor(seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

function generateCrashLogs(): string[] {
  return [
    `${new Date().toISOString()}  INFO  Starting application...`,
    `${new Date().toISOString()}  INFO  Loading configuration from /etc/config/app.yaml`,
    `${new Date().toISOString()}  ERROR panic: runtime error: invalid memory address or nil pointer dereference`,
    `${new Date().toISOString()}  ERROR goroutine 1 [running]:`,
    `${new Date().toISOString()}  ERROR main.loadConfig(0xc000012640)`,
    `${new Date().toISOString()}  ERROR \t/src/main.go:47 +0x2a8`,
    `${new Date().toISOString()}  ERROR exit status 2`,
  ];
}

function generateOOMLogs(): string[] {
  return [
    `${new Date().toISOString()}  INFO  Application starting`,
    `${new Date().toISOString()}  INFO  Loading dataset into memory...`,
    `${new Date().toISOString()}  WARN  Memory usage at 85%`,
    `${new Date().toISOString()}  WARN  Memory usage at 95%`,
    `${new Date().toISOString()}  ERROR  Killed`,
    `${new Date().toISOString()}  ERROR  container exceeded memory limit 256Mi`,
  ];
}

interface ClusterState {
  pods: Pod[];
  deployments: Deployment[];
  services: Service[];
  nodes: Node[];
  namespaces: Namespace[];
  configmaps: ConfigMap[];
  secrets: Secret[];
  statefulsets: StatefulSet[];
  daemonsets: DaemonSet[];
  jobs: Job[];
  cronjobs: CronJob[];
  ingress: Ingress[];
  pvs: PersistentVolume[];
  pvcs: PersistentVolumeClaim[];
  replicasets: ReplicaSet[];
  hpas: HPA[];
  serviceaccounts: ServiceAccount[];
  networkpolicies: NetworkPolicy[];
  pdbs: PodDisruptionBudget[];
  rolebindings: RoleBinding[];
  clusterroles: ClusterRole[];
  clusterrolebindings: ClusterRoleBinding[];
  helmReleases: HelmRelease[];
  contexts: Context[];
  popeyeIssues: PopeyeIssue[];
  clusterEvents: K8sEvent[];
}

interface UIState {
  activeView: ViewType;
  selectedIndex: number;
  filterStr: string;
  commandMode: boolean;
  filterMode: boolean;
  commandInput: string;
  activePanel: PanelType;
  activeModal: ModalType;
  activeNamespace: string;
  toasts: Toast[];
  metricsVersion: number;
  markedIds: Set<string>;
  sortKey: string | null;
  sortDesc: boolean;
}

interface ScenarioState {
  activeScenarioId: string | null;
  completedTaskIds: string[];
  scenarioComplete: boolean;
  debriefVisible: boolean;
}

interface SettingsState {
  autoRefreshInterval: number;
  showMetrics: boolean;
  hasSeenWelcome: boolean;
}

interface AppStore extends ClusterState, UIState, ScenarioState, SettingsState {
  // cluster actions
  createPod: (pod: Omit<Pod, 'id' | 'events' | 'logs' | 'age' | 'ageSeconds'>) => void;
  deletePod: (id: string) => void;
  restartPod: (id: string) => void;
  injectFailure: (podId: string, failure: FailureType) => void;
  fixPod: (id: string) => void;
  editPodYaml: (id: string, yaml: string) => void;
  scaleDeployment: (id: string, replicas: number) => void;
  rolloutRestart: (deploymentId: string) => void;
  cordonNode: (id: string) => void;
  uncordonNode: (id: string) => void;
  editServiceYaml: (id: string, yaml: string) => void;
  addEvent: (event: K8sEvent) => void;
  tick: () => void;

  // ui actions
  setView: (view: ViewType) => void;
  setSelectedIndex: (idx: number) => void;
  setFilterStr: (s: string) => void;
  setCommandMode: (on: boolean) => void;
  setFilterMode: (on: boolean) => void;
  setCommandInput: (s: string) => void;
  setActivePanel: (panel: PanelType) => void;
  setActiveModal: (modal: ModalType) => void;
  setActiveNamespace: (ns: string) => void;
  setContext: (id: string) => void;
  toggleMark: (id: string) => void;
  clearMarks: () => void;
  setSort: (key: string) => void;
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
  tickMetrics: () => void;

  // scenario actions
  startScenario: (id: string) => void;
  completeTask: (taskId: string) => void;
  exitScenario: () => void;
  showDebrief: () => void;
  closeDebrief: () => void;
  fireValidation: (event: string, target?: string) => void;

  // settings
  setHasSeenWelcome: () => void;
}

export const useStore = create<AppStore>((set, get) => ({
  // cluster
  pods: initialPods,
  deployments: initialDeployments,
  services: initialServices,
  nodes: initialNodes,
  namespaces: initialNamespaces,
  configmaps: initialConfigMaps,
  secrets: initialSecrets,
  statefulsets: initialStatefulSets,
  daemonsets: initialDaemonSets,
  jobs: initialJobs,
  cronjobs: initialCronJobs,
  ingress: initialIngress,
  pvs: initialPVs,
  pvcs: initialPVCs,
  replicasets: initialReplicaSets,
  hpas: initialHPAs,
  serviceaccounts: initialServiceAccounts,
  networkpolicies: initialNetworkPolicies,
  pdbs: initialPDBs,
  rolebindings: initialRoleBindings,
  clusterroles: initialClusterRoles,
  clusterrolebindings: initialClusterRoleBindings,
  helmReleases: initialHelm,
  contexts: initialContexts,
  popeyeIssues: initialPopeye,
  clusterEvents: initialClusterEvents,

  // ui
  activeView: 'pods',
  selectedIndex: 0,
  filterStr: '',
  commandMode: false,
  filterMode: false,
  commandInput: '',
  activePanel: null,
  activeModal: null,
  activeNamespace: 'all',
  toasts: [],
  metricsVersion: 0,
  markedIds: new Set(),
  sortKey: null,
  sortDesc: false,

  // scenario
  activeScenarioId: null,
  completedTaskIds: [],
  scenarioComplete: false,
  debriefVisible: false,

  // settings
  autoRefreshInterval: 2000,
  showMetrics: true,
  hasSeenWelcome: false,

  // cluster actions
  createPod: (podData) => {
    const pod: Pod = {
      ...podData,
      id: `pod-${podData.name}-${Date.now()}`,
      age: '0s',
      ageSeconds: 0,
      events: [
        {
          id: genId(),
          namespace: podData.namespace,
          reason: 'Scheduled',
          message: `Successfully assigned ${podData.namespace}/${podData.name} to ${podData.nodeName || 'k9ssim-node-02'}`,
          type: 'Normal',
          count: 1,
          firstTime: 'just now',
          lastTime: 'just now',
          involvedObject: podData.name,
          kind: 'Pod',
        },
        {
          id: genId(),
          namespace: podData.namespace,
          reason: 'Pulling',
          message: `Pulling image "${podData.image}"`,
          type: 'Normal',
          count: 1,
          firstTime: 'just now',
          lastTime: 'just now',
          involvedObject: podData.name,
          kind: 'Pod',
        },
      ],
      logs: [`${new Date().toISOString()}  INFO  Container starting...`],
    };
    set((s) => ({ pods: [...s.pods, pod] }));
    get().addToast(`Pod ${podData.name} created`, 'success');
  },

  deletePod: (id) => {
    const pod = get().pods.find((p) => p.id === id);
    set((s) => ({ pods: s.pods.filter((p) => p.id !== id), activePanel: null }));
    if (pod) get().addToast(`Pod ${pod.name} deleted`, 'success');
    get().fireValidation('pod-deleted', pod?.failureType || pod?.status);
  },

  restartPod: (id) => {
    const pod = get().pods.find((p) => p.id === id);
    if (!pod) return;
    set((s) => ({
      pods: s.pods.map((p) =>
        p.id === id ? { ...p, status: 'Terminating', ready: '0/1', cpu: '0m', mem: '0Mi' } : p
      ),
    }));
    get().addToast(`Pod ${pod.name} restarting...`, 'info');
    setTimeout(() => {
      set((s) => ({
        pods: s.pods.map((p) =>
          p.id === id ? { ...p, status: 'Running', ready: '1/1', restarts: p.restarts + 1, cpu: '15m', mem: '32Mi', ageSeconds: 0, age: '0s' } : p
        ),
      }));
      get().addToast(`Pod ${pod.name} is Running`, 'success');
    }, 2000);
  },

  injectFailure: (podId, failure) => {
    set((s) => ({
      pods: s.pods.map((p) => {
        if (p.id !== podId) return p;
        const updates: Partial<Pod> = { failureType: failure };
        const now = new Date().toISOString();
        switch (failure) {
          case 'CrashLoopBackOff':
            updates.status = 'CrashLoopBackOff';
            updates.ready = '0/1';
            updates.restarts = (p.restarts || 0) + 1;
            updates.logs = generateCrashLogs();
            updates.events = [
              ...p.events,
              { id: genId(), namespace: p.namespace, reason: 'BackOff', message: 'Back-off restarting failed container', type: 'Warning', count: 1, firstTime: now, lastTime: now, involvedObject: p.name, kind: 'Pod' },
            ];
            break;
          case 'OOMKilled':
            updates.status = 'OOMKilled';
            updates.ready = '0/1';
            updates.restarts = (p.restarts || 0) + 1;
            updates.logs = generateOOMLogs();
            updates.events = [
              ...p.events,
              { id: genId(), namespace: p.namespace, reason: 'OOMKilling', message: 'Container exceeded memory limit. Killing', type: 'Warning', count: 1, firstTime: now, lastTime: now, involvedObject: p.name, kind: 'Pod' },
            ];
            break;
          case 'ImagePullBackOff':
            updates.status = 'ImagePullBackOff';
            updates.ready = '0/1';
            updates.logs = [];
            updates.events = [
              ...p.events,
              { id: genId(), namespace: p.namespace, reason: 'Failed', message: `Failed to pull image "${p.image}": rpc error: code = Unknown desc = failed to pull and unpack image`, type: 'Warning', count: 1, firstTime: now, lastTime: now, involvedObject: p.name, kind: 'Pod' },
              { id: genId(), namespace: p.namespace, reason: 'BackOff', message: 'Back-off pulling image', type: 'Warning', count: 1, firstTime: now, lastTime: now, involvedObject: p.name, kind: 'Pod' },
            ];
            break;
          case 'Pending':
            updates.status = 'Pending';
            updates.ready = '0/1';
            updates.nodeName = '';
            updates.logs = [];
            updates.events = [
              ...p.events,
              { id: genId(), namespace: p.namespace, reason: 'FailedScheduling', message: '0/4 nodes are available: insufficient cpu. preemption: 0/4 nodes are available: 4 No preemption victims found for incoming pod.', type: 'Warning', count: 1, firstTime: now, lastTime: now, involvedObject: p.name, kind: 'Pod' },
            ];
            break;
          case 'Evicted':
            updates.status = 'Evicted';
            updates.ready = '0/1';
            updates.logs = [];
            updates.events = [
              ...p.events,
              { id: genId(), namespace: p.namespace, reason: 'Evicted', message: 'The node was low on resource: disk. Threshold quantity: 10%, available: 3%.', type: 'Warning', count: 1, firstTime: now, lastTime: now, involvedObject: p.name, kind: 'Pod' },
            ];
            break;
          case 'NodeNotReady':
            updates.status = 'Unknown';
            updates.ready = '0/1';
            break;
        }
        return { ...p, ...updates };
      }),
    }));
    get().addToast(`Injected ${failure} into pod`, 'info');
  },

  fixPod: (id) => {
    const pod = get().pods.find((p) => p.id === id);
    if (!pod) return;
    set((s) => ({
      pods: s.pods.map((p) =>
        p.id === id
          ? { ...p, status: 'Running', ready: '1/1', failureType: undefined, logs: [...p.logs, `${new Date().toISOString()}  INFO  Pod recovered`], restarts: p.restarts }
          : p
      ),
    }));
    get().addToast(`Pod ${pod.name} recovered`, 'success');
  },

  editPodYaml: (id) => {
    const pod = get().pods.find((p) => p.id === id);
    if (!pod) return;
    get().addToast(`Changes saved to ${pod.name}`, 'success');
    get().fireValidation('resource-edited', id);
  },

  scaleDeployment: (id, replicas) => {
    const deploy = get().deployments.find((d) => d.id === id);
    if (!deploy) return;
    const delta = replicas - deploy.replicas;
    set((s) => ({
      deployments: s.deployments.map((d) =>
        d.id === id ? { ...d, replicas, readyReplicas: replicas, updatedReplicas: replicas, availableReplicas: replicas } : d
      ),
    }));

    // add/remove worker pods if scaling worker deployment
    if (deploy.name === 'worker' && delta !== 0) {
      if (delta < 0) {
        const workerPods = get().pods.filter((p) => p.namespace === deploy.namespace && p.labels.app === 'worker' && p.status === 'Running');
        const toRemove = workerPods.slice(0, Math.abs(delta));
        toRemove.forEach((p) => {
          set((s) => ({ pods: s.pods.filter((pod) => pod.id !== p.id) }));
        });
        const pendingPod = get().pods.find((p) => p.status === 'Pending');
        if (pendingPod) {
          setTimeout(() => {
            set((s) => ({
              pods: s.pods.map((p) =>
                p.id === pendingPod.id
                  ? { ...p, status: 'Running', ready: '1/1', nodeName: 'k9ssim-node-02', cpu: '220m', mem: '165Mi', failureType: undefined, ageSeconds: 0, age: '0s' }
                  : p
              ),
            }));
            get().addToast(`${pendingPod.name} is now Running`, 'success');
            get().fireValidation('pod-running', 'Pending-resolved');
          }, 1500);
        }
      }
    }

    get().addToast(`${deploy.name} scaled to ${replicas} replica${replicas !== 1 ? 's' : ''}`, 'success');
    get().fireValidation('deployment-scaled', deploy.name);
  },

  rolloutRestart: (deploymentId) => {
    const d = get().deployments.find((x) => x.id === deploymentId);
    if (!d) return;
    // mark pods as terminating then re-create
    const matchingPods = get().pods.filter((p) =>
      p.namespace === d.namespace && Object.entries(d.selector).every(([k, v]) => p.labels[k] === v)
    );
    matchingPods.forEach((p) => {
      set((s) => ({
        pods: s.pods.map((x) => x.id === p.id ? { ...x, status: 'Terminating', ready: '0/1' } : x),
      }));
      setTimeout(() => {
        set((s) => ({
          pods: s.pods.map((x) => x.id === p.id ? { ...x, status: 'Running', ready: '1/1', restarts: x.restarts + 1, ageSeconds: 0, age: '0s' } : x),
        }));
      }, 1500 + Math.random() * 1500);
    });
    get().addToast(`Rollout restart triggered for ${d.name}`, 'info');
  },

  cordonNode: (id) => {
    set((s) => ({
      nodes: s.nodes.map((n) => n.id === id ? { ...n, status: 'SchedulingDisabled' } : n),
    }));
    const n = get().nodes.find((x) => x.id === id);
    if (n) get().addToast(`Node ${n.name} cordoned`, 'info');
  },

  uncordonNode: (id) => {
    set((s) => ({
      nodes: s.nodes.map((n) => n.id === id ? { ...n, status: 'Ready' } : n),
    }));
    const n = get().nodes.find((x) => x.id === id);
    if (n) get().addToast(`Node ${n.name} uncordoned`, 'success');
  },

  editServiceYaml: (id) => {
    const svc = get().services.find((s) => s.id === id);
    if (!svc) return;
    if (id === 'svc-api') {
      set((s) => ({
        services: s.services.map((sv) =>
          sv.id === id ? { ...sv, selector: { app: 'api-server' } } : sv
        ),
      }));
    }
    get().addToast(`Changes saved to ${svc.name}`, 'success');
    get().fireValidation('resource-edited', id);
  },

  addEvent: (event) => {
    set((s) => ({
      pods: s.pods.map((p) => p.name === event.involvedObject ? { ...p, events: [...p.events, event] } : p),
      clusterEvents: [event, ...s.clusterEvents].slice(0, 200),
    }));
  },

  tick: () => {
    // Tick: bump ages, fluctuate metrics, occasionally bump CrashLoop restart count
    set((s) => {
      const tickSec = 2;
      const updatedPods = s.pods.map((p) => {
        const ageSeconds = p.ageSeconds + tickSec;
        let cpu = p.cpu;
        let mem = p.mem;
        let restarts = p.restarts;

        if (p.status === 'Running') {
          // fluctuate CPU and mem slightly
          const cpuNum = parseInt(p.cpu) || 0;
          const memNum = parseInt(p.mem) || 0;
          const cpuDelta = Math.round((Math.random() - 0.5) * Math.max(2, cpuNum * 0.1));
          const memDelta = Math.round((Math.random() - 0.5) * Math.max(1, memNum * 0.05));
          cpu = `${Math.max(1, cpuNum + cpuDelta)}m`;
          mem = `${Math.max(1, memNum + memDelta)}Mi`;
        }
        if (p.status === 'CrashLoopBackOff' && Math.random() < 0.08) {
          restarts = p.restarts + 1;
        }
        return { ...p, ageSeconds, age: fmtAge(ageSeconds), cpu, mem, restarts };
      });

      const updatedNodes = s.nodes.map((n) => {
        const ageSeconds = n.ageSeconds + tickSec;
        const cpuPct = Math.max(1, Math.min(95, n.cpuPct + Math.round((Math.random() - 0.5) * 4)));
        const memPct = Math.max(1, Math.min(95, n.memPct + Math.round((Math.random() - 0.5) * 3)));
        const cpuMillicores = Math.round(parseFloat(n.cpuCapacity) * 1000 * cpuPct / 100);
        const memGi = (parseFloat(n.memCapacity) * memPct / 100).toFixed(1);
        return { ...n, ageSeconds, age: fmtAge(ageSeconds), cpuPct, memPct, cpuUsage: `${cpuMillicores}m`, memUsage: `${memGi}Gi` };
      });

      const bumpAge = <T extends { ageSeconds: number; age: string }>(items: T[]): T[] =>
        items.map((it) => ({ ...it, ageSeconds: it.ageSeconds + tickSec, age: fmtAge(it.ageSeconds + tickSec) }));

      return {
        pods: updatedPods,
        nodes: updatedNodes,
        namespaces: bumpAge(s.namespaces),
        deployments: bumpAge(s.deployments),
        services: bumpAge(s.services),
        replicasets: bumpAge(s.replicasets),
        statefulsets: bumpAge(s.statefulsets),
        daemonsets: bumpAge(s.daemonsets),
        configmaps: bumpAge(s.configmaps),
        secrets: bumpAge(s.secrets),
        jobs: bumpAge(s.jobs),
        cronjobs: bumpAge(s.cronjobs),
        ingress: bumpAge(s.ingress),
        pvs: bumpAge(s.pvs),
        pvcs: bumpAge(s.pvcs),
        hpas: bumpAge(s.hpas),
        serviceaccounts: bumpAge(s.serviceaccounts),
        networkpolicies: bumpAge(s.networkpolicies),
        pdbs: bumpAge(s.pdbs),
        rolebindings: bumpAge(s.rolebindings),
        clusterroles: bumpAge(s.clusterroles),
        clusterrolebindings: bumpAge(s.clusterrolebindings),
        metricsVersion: s.metricsVersion + 1,
      };
    });

    // occasional events
    if (Math.random() < 0.15) {
      const pods = get().pods;
      const runningPods = pods.filter((p) => p.status === 'Running');
      if (runningPods.length > 0) {
        const p = runningPods[Math.floor(Math.random() * runningPods.length)];
        const eventTypes = [
          { reason: 'Pulled', message: `Container image "${p.image}" already present on machine`, type: 'Normal' as const },
          { reason: 'Healthy', message: 'readiness probe succeeded', type: 'Normal' as const },
          { reason: 'SandboxChanged', message: 'Pod sandbox changed, it will be killed and re-created', type: 'Normal' as const },
        ];
        const ev = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        get().addEvent({
          id: genId(),
          namespace: p.namespace,
          reason: ev.reason,
          message: ev.message,
          type: ev.type,
          count: 1,
          firstTime: 'just now',
          lastTime: 'just now',
          involvedObject: p.name,
          kind: 'Pod',
        });
      }
    }
  },

  // ui actions
  setView: (view) => {
    set({ activeView: view, selectedIndex: 0, filterStr: '', activePanel: null, commandMode: false, filterMode: false, commandInput: '', markedIds: new Set(), sortKey: null });
    get().fireValidation('view-changed', view);
  },
  setSelectedIndex: (idx) => set({ selectedIndex: idx }),
  setFilterStr: (s) => set({ filterStr: s, selectedIndex: 0 }),
  setCommandMode: (on) => set({ commandMode: on, filterMode: false, commandInput: on ? ':' : '' }),
  setFilterMode: (on) => set({ filterMode: on, commandMode: false, filterStr: '' }),
  setCommandInput: (s) => set({ commandInput: s }),
  setActivePanel: (panel) => {
    set({ activePanel: panel });
    if (panel) get().fireValidation('panel-opened', panel);
  },
  setActiveModal: (modal) => set({ activeModal: modal }),
  setActiveNamespace: (ns) => set({ activeNamespace: ns, selectedIndex: 0 }),
  setContext: (id) => {
    set((s) => ({
      contexts: s.contexts.map((c) => ({ ...c, current: c.id === id })),
    }));
    const c = get().contexts.find((x) => x.id === id);
    if (c) get().addToast(`Switched context to ${c.name}`, 'success');
  },
  toggleMark: (id) => {
    set((s) => {
      const next = new Set(s.markedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { markedIds: next };
    });
  },
  clearMarks: () => set({ markedIds: new Set() }),
  setSort: (key) => {
    set((s) => ({
      sortKey: s.sortKey === key ? key : key,
      sortDesc: s.sortKey === key ? !s.sortDesc : false,
    }));
  },
  addToast: (message, type = 'success') => {
    const id = genId();
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => get().removeToast(id), 3500);
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  tickMetrics: () => set((s) => ({ metricsVersion: s.metricsVersion + 1 })),

  // scenario actions
  startScenario: (id) => {
    set({ activeScenarioId: id, completedTaskIds: [], scenarioComplete: false, debriefVisible: false });
    get().addToast(`Scenario started: ${scenarios.find((s) => s.id === id)?.title}`, 'info');
  },
  completeTask: (taskId) => {
    const { completedTaskIds, activeScenarioId } = get();
    if (completedTaskIds.includes(taskId)) return;
    const newCompleted = [...completedTaskIds, taskId];
    const scenario = scenarios.find((s) => s.id === activeScenarioId);
    const allDone = scenario ? scenario.tasks.every((t) => newCompleted.includes(t.id)) : false;
    set({ completedTaskIds: newCompleted, scenarioComplete: allDone });
    const task = scenario?.tasks.find((t) => t.id === taskId);
    if (task) get().addToast(`✓ Task complete: ${task.instruction.slice(0, 40)}...`, 'success');
    if (allDone) {
      setTimeout(() => get().showDebrief(), 1000);
    }
  },
  exitScenario: () => set({ activeScenarioId: null, completedTaskIds: [], scenarioComplete: false, debriefVisible: false }),
  showDebrief: () => set({ debriefVisible: true }),
  closeDebrief: () => set({ debriefVisible: false, activeScenarioId: null }),

  fireValidation: (event, target) => {
    const { activeScenarioId, completedTaskIds } = get();
    if (!activeScenarioId) return;
    const scenario = scenarios.find((s) => s.id === activeScenarioId);
    if (!scenario) return;
    for (const task of scenario.tasks) {
      if (completedTaskIds.includes(task.id)) continue;
      if (task.validationEvent === event && (!task.validationTarget || task.validationTarget === target)) {
        get().completeTask(task.id);
        break;
      }
    }
    if (event === 'pod-selected' && target) {
      for (const task of scenario.tasks) {
        if (completedTaskIds.includes(task.id)) continue;
        if (task.validationEvent === 'pod-selected' && task.validationTarget === target) {
          get().completeTask(task.id);
          break;
        }
      }
    }
  },

  setHasSeenWelcome: () => set({ hasSeenWelcome: true }),
}));
