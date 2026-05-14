import { useEffect } from 'react';
import { useStore } from '../../store';
import { useKeyboard } from '../../hooks/useKeyboard';
import { TopBar } from '../TopBar/TopBar';
import { HotkeyBar } from '../HotkeyBar/HotkeyBar';
import { NavTabs } from '../NavTabs/NavTabs';
import { FilterBar } from '../FilterBar/FilterBar';
import { MainView } from '../MainView/MainView';
import { CommandBar } from '../CommandBar/CommandBar';
import { StatusBar } from '../StatusBar/StatusBar';
import { LogPanel } from '../panels/LogPanel/LogPanel';
import { DescribePanel } from '../panels/DescribePanel/DescribePanel';
import { YamlPanel } from '../panels/YamlPanel/YamlPanel';
import { YamlEditor } from '../panels/YamlEditor/YamlEditor';
import { PortForwardModal } from '../modals/PortForwardModal/PortForwardModal';
import { PodCreator } from '../modals/PodCreator/PodCreator';
import { ScaleDialog } from '../modals/ScaleDialog/ScaleDialog';
import { FailureInjector } from '../modals/FailureInjector/FailureInjector';
import { HelpOverlay } from '../HelpOverlay/HelpOverlay';
import { ScenarioPanel } from '../ScenarioPanel/ScenarioPanel';
import { ToastNotification } from '../ToastNotification/ToastNotification';
import { WelcomeBanner } from '../WelcomeBanner/WelcomeBanner';
import { ExecPanel } from '../panels/ExecPanel/ExecPanel';
import styles from './K9sRoot.module.css';

export function K9sRoot() {
  const activePanel = useStore((s) => s.activePanel);
  const activeModal = useStore((s) => s.activeModal);
  const tickMetrics = useStore((s) => s.tickMetrics);

  useKeyboard();

  useEffect(() => {
    const interval = setInterval(tickMetrics, 3000);
    return () => clearInterval(interval);
  }, [tickMetrics]);

  return (
    <div className={`${styles.root} k9s-root`}>
      <TopBar />
      <HotkeyBar />
      <NavTabs />
      <FilterBar />
      <div className={styles.content}>
        <MainView />
        {activePanel === 'logs' && <LogPanel />}
        {activePanel === 'describe' && <DescribePanel />}
        {activePanel === 'yaml' && <YamlPanel />}
        {activePanel === 'editor' && <YamlEditor />}
        {activePanel === 'exec' && <ExecPanel />}
      </div>
      <StatusBar />

      {/* Overlay modals */}
      {activePanel === 'portforward' && <PortForwardModal />}
      {activeModal === 'podCreator' && <PodCreator />}
      {activeModal === 'scale' && <ScaleDialog />}
      {activeModal === 'failureInjector' && <FailureInjector />}
      {activeModal === 'help' && <HelpOverlay />}

      {/* Scenario UI */}
      <ScenarioPanel />

      {/* Overlays */}
      <WelcomeBanner />
      <ToastNotification />
      <CommandBar />
    </div>
  );
}
