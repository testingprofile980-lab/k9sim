import type { Scenario } from '../types';

export const scenarios: Scenario[] = [
  {
    id: 'crashed-pod',
    title: '01: The Crashed Pod',
    briefing:
      "Your api-server pod is in CrashLoopBackOff. The on-call has paged you at 2am. Find the root cause and fix it before the SLA breach.",
    tasks: [
      {
        id: 'navigate-pods',
        instruction: 'Navigate to the Pods view (press :pods or click the Pods tab)',
        hint: 'Type :pods in the command bar or click "Pods" in the navigation tabs',
        validationEvent: 'view-changed',
        validationTarget: 'pods',
      },
      {
        id: 'identify-crash',
        instruction: 'Find and select the pod in CrashLoopBackOff status',
        hint: 'Look for a pod with red "CrashLoopBackOff" status. Use arrow keys to navigate.',
        validationEvent: 'pod-selected',
        validationTarget: 'CrashLoopBackOff',
      },
      {
        id: 'read-logs',
        instruction: 'Read the logs for the crashing pod (press l)',
        hint: 'With the pod selected, press the "l" key to open the log panel',
        validationEvent: 'panel-opened',
        validationTarget: 'logs',
      },
      {
        id: 'describe-pod',
        instruction: 'Describe the pod to see events (press d)',
        hint: 'Press Escape to close logs, then press "d" to describe the pod',
        validationEvent: 'panel-opened',
        validationTarget: 'describe',
      },
      {
        id: 'delete-pod',
        instruction: 'Delete the crashing pod to trigger a clean restart (press x or Delete)',
        hint: 'Press Escape to close the describe panel, then press "x" or Delete key on the crashing pod',
        validationEvent: 'pod-deleted',
        validationTarget: 'CrashLoopBackOff',
      },
    ],
    debrief: `Great work! You've just triaged a CrashLoopBackOff incident.

Key takeaways:
• CrashLoopBackOff means the container starts, crashes, and Kubernetes keeps restarting it with exponential backoff
• The logs showed a nil pointer dereference — the app panicked on startup, likely due to a missing config
• The Events section in Describe shows the timeline of failures
• Deleting a pod in a Deployment causes Kubernetes to create a fresh replacement pod

In a real cluster, the next step would be to fix the application config (likely a missing ConfigMap or Secret) before the new pod also crashes.`,
  },
  {
    id: 'starved-deployment',
    title: '02: The Starved Deployment',
    briefing:
      'A new worker pod is stuck in Pending status. The team says the deployment was fine yesterday. Investigate and fix the scheduling issue.',
    tasks: [
      {
        id: 'find-pending',
        instruction: 'Find the pod stuck in Pending status in the Pods view',
        hint: 'Navigate to Pods view (:pods) and look for a pod with "Pending" status',
        validationEvent: 'pod-selected',
        validationTarget: 'Pending',
      },
      {
        id: 'read-events',
        instruction: 'Describe the pending pod to read the scheduling events (press d)',
        hint: 'Press "d" on the Pending pod and look at the Events section at the bottom',
        validationEvent: 'panel-opened',
        validationTarget: 'describe',
      },
      {
        id: 'scale-down',
        instruction: 'Scale down the "worker" deployment to free up CPU (navigate to Deployments and press s)',
        hint: 'Go to Deployments (:deploy), select the "worker" deployment, press "s" to scale it to 1 replica',
        validationEvent: 'deployment-scaled',
        validationTarget: 'worker',
      },
      {
        id: 'verify-running',
        instruction: 'Verify the previously Pending pod is now Running',
        hint: 'Return to Pods view (:pods) and confirm the pod status changed to Running',
        validationEvent: 'pod-running',
        validationTarget: 'Pending-resolved',
      },
    ],
    debrief: `Excellent debugging! You've resolved a resource starvation issue.

Key takeaways:
• "Pending" pods can't be scheduled because no node has sufficient resources
• The Events showed: "0/3 nodes are available: insufficient cpu" — a clear signal
• Freeing CPU on the cluster (by scaling down another deployment) allowed the scheduler to place the pod
• In production you'd typically right-size resource requests or add more nodes rather than scaling down existing workloads

This pattern (one deployment starving another) is a common cause of mysterious Pending pods in shared clusters.`,
  },
  {
    id: 'missing-service',
    title: '03: The Missing Service',
    briefing:
      'Users report the API is unreachable. The api-server service exists and pods are running, but traffic is not flowing. Debug the connectivity issue.',
    tasks: [
      {
        id: 'check-service',
        instruction: 'Navigate to the Services view (:svc) and find the api-server service',
        hint: 'Type :svc in the command bar to switch to Services view',
        validationEvent: 'view-changed',
        validationTarget: 'services',
      },
      {
        id: 'describe-service',
        instruction: 'Describe the api-server service and inspect the selector (press d)',
        hint: 'Select the "api-server" service and press "d". Look at the "Selector" field — does it match the pod labels?',
        validationEvent: 'panel-opened',
        validationTarget: 'describe',
      },
      {
        id: 'edit-service',
        instruction: 'Edit the service YAML to fix the wrong selector (press e)',
        hint: 'Press "e" to open the YAML editor. Find the selector field and change "api-server-wrong" to "api-server"',
        validationEvent: 'resource-edited',
        validationTarget: 'svc-api',
      },
      {
        id: 'verify-traffic',
        instruction: 'Check the api-server pod logs to verify traffic is now flowing (go to Pods, press l)',
        hint: 'Navigate to Pods (:pods), select an api-server pod, press "l" to see incoming request logs',
        validationEvent: 'panel-opened',
        validationTarget: 'logs',
      },
    ],
    debrief: `Well done! You've fixed a classic Kubernetes networking misconfiguration.

Key takeaways:
• Kubernetes Services route traffic by matching pod labels using a "selector"
• If the selector doesn't match any pod's labels, the Service has no Endpoints — traffic goes nowhere
• The describe output showed selector "app: api-server-wrong" which matched zero pods
• Fixing the selector to "app: api-server" immediately restored the Endpoints and traffic flow

This is one of the most common Kubernetes issues in the wild. Always check Service selectors when a service appears "missing" despite pods running correctly.`,
  },
];
