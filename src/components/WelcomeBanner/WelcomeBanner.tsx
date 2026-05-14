import { useStore } from '../../store';
import styles from './WelcomeBanner.module.css';

export function WelcomeBanner() {
  const hasSeenWelcome = useStore((s) => s.hasSeenWelcome);
  const setHasSeenWelcome = useStore((s) => s.setHasSeenWelcome);
  const startScenario = useStore((s) => s.startScenario);
  const setActiveModal = useStore((s) => s.setActiveModal);

  if (hasSeenWelcome) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.banner}>
        <div className={styles.logo}>K9sSim</div>
        <h1 className={styles.headline}>Learn Kubernetes operations — right in your browser</h1>
        <p className={styles.sub}>
          A pixel-faithful simulation of <strong>k9s</strong>, the keyboard-driven Kubernetes terminal UI.
          No cluster. No install. No cost.
        </p>
        <div className={styles.actions}>
          <button
            className={styles.primaryBtn}
            onClick={() => {
              setHasSeenWelcome();
            }}
          >
            Free Roam →
          </button>
          <button
            className={styles.secondaryBtn}
            onClick={() => {
              setHasSeenWelcome();
              setActiveModal('podCreator');
              // use setTimeout to trigger scenario selector
              setTimeout(() => {
                setActiveModal(null);
                startScenario('crashed-pod');
              }, 0);
            }}
          >
            Start Scenario
          </button>
        </div>
        <div className={styles.hint}>
          Press <kbd className={styles.kbd}>?</kbd> anytime for keyboard shortcuts · <kbd className={styles.kbd}>:</kbd> for commands
        </div>
      </div>
    </div>
  );
}
