import { useStore } from '../../store';
import type { Namespace } from '../../types';
import { ResourceTable, type Column } from '../ResourceTable/ResourceTable';

const columns: Column<Namespace>[] = [
  { key: 'name', header: 'NAME', width: '50%', render: (n) => <span style={{ color: 'var(--text-ns)', fontWeight: 'bold' }}>{n.name}</span> },
  {
    key: 'status',
    header: 'STATUS',
    width: '25%',
    render: (n) => (
      <span style={{ color: n.status === 'Active' ? 'var(--green)' : 'var(--yellow)' }}>{n.status}</span>
    ),
  },
  { key: 'age', header: 'AGE', width: '25%', render: (n) => <span style={{ color: 'var(--text-muted)' }}>{n.age}</span> },
];

export function NamespacesView() {
  const namespaces = useStore((s) => s.namespaces);
  const filterStr = useStore((s) => s.filterStr);
  const selectedIndex = useStore((s) => s.selectedIndex);
  const setSelectedIndex = useStore((s) => s.setSelectedIndex);
  const setActiveNamespace = useStore((s) => s.setActiveNamespace);
  const setActivePanel = useStore((s) => s.setActivePanel);

  const filtered = namespaces.filter((n) => !filterStr || n.name.includes(filterStr));

  return (
    <ResourceTable
      columns={columns}
      rows={filtered}
      selectedIndex={selectedIndex}
      onSelect={setSelectedIndex}
      onActivate={(idx) => {
        const ns = filtered[idx];
        if (ns) setActiveNamespace(ns.name);
        setActivePanel('describe');
      }}
      rowKey={(n) => n.id}
    />
  );
}
