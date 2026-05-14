import { useState } from 'react';
import { useStore } from '../../store';
import { scenarios } from '../../data/scenarios';
import styles from './ScenarioPanel.module.css';

function ScenarioSelector() {
  const startScenario = useStore((s) => s.startScenario);
  const setActiveModal = useStore((s) => s.setActiveModal);

  return (
    <div className={styles.selector}>
      <div className={styles.selectorHeader}>
        <span className={styles.selectorTitle}>Guided Scenarios</span>
        <button className={styles.closeBtn} onClick={() => setActiveModal(null)}>✕</button>
      </div>
      <p className={styles.selectorDesc}>
        Choose a real-world scenario to practice. Each one presents a broken cluster and guides you to fix it.
      </p>
      <div className={styles.scenarioList}>
        {scenarios.map((s) => (
          <button key={s.id} className={styles.scenarioCard} onClick={() => { startScenario(s.id); setActiveModal(null); }}>
            <span className={styles.scenarioTitle}>{s.title}</span>
            <span className={styles.scenarioBrief}>{s.briefing}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function ScenarioPanel() {
  const activeScenarioId = useStore((s) => s.activeScenarioId);
  const completedTaskIds = useStore((s) => s.completedTaskIds);
  const showDebriefState = useStore((s) => s.debriefVisible);
  const exitScenario = useStore((s) => s.exitScenario);
  const closeDebrief = useStore((s) => s.closeDebrief);
  const completeTask = useStore((s) => s.completeTask);
  const [minimized, setMinimized] = useState(false);
  const [showHint, setShowHint] = useState<string | null>(null);

  if (!activeScenarioId) return null;

  const scenario = scenarios.find((s) => s.id === activeScenarioId);
  if (!scenario) return null;

  const currentTaskIndex = scenario.tasks.findIndex((t) => !completedTaskIds.includes(t.id));
  const currentTask = currentTaskIndex >= 0 ? scenario.tasks[currentTaskIndex] : null;

  if (showDebriefState) {
    return (
      <div className={styles.debriefOverlay}>
        <div className={styles.debrief}>
          <div className={styles.debriefHeader}>
            <span className={styles.debriefTitle}>🎉 Scenario Complete!</span>
          </div>
          <div className={styles.debriefTitle2}>{scenario.title}</div>
          <pre className={styles.debriefContent}>{scenario.debrief}</pre>
          <div className={styles.debriefActions}>
            <button className={styles.debriefClose} onClick={closeDebrief}>
              Back to Free Roam
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (minimized) {
    return (
      <div className={styles.minimized} onClick={() => setMinimized(false)}>
        <span className={styles.minIcon}>📋</span>
        <span className={styles.minTitle}>{scenario.title}</span>
        <span className={styles.minProgress}>{completedTaskIds.length}/{scenario.tasks.length}</span>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>📋 {scenario.title}</span>
        <div className={styles.headerActions}>
          <button className={styles.iconBtn} onClick={() => setMinimized(true)} title="Minimize">_</button>
          <button className={styles.iconBtn} onClick={exitScenario} title="Exit scenario">✕</button>
        </div>
      </div>

      <div className={styles.progress}>
        {scenario.tasks.map((t, i) => (
          <div
            key={t.id}
            className={`${styles.progressDot} ${completedTaskIds.includes(t.id) ? styles.done : i === currentTaskIndex ? styles.active : styles.future}`}
            title={t.instruction}
          />
        ))}
        <span className={styles.progressText}>{completedTaskIds.length}/{scenario.tasks.length}</span>
      </div>

      <div className={styles.body}>
        {currentTask ? (
          <>
            <div className={styles.taskNum}>Task {currentTaskIndex + 1} of {scenario.tasks.length}</div>
            <div className={styles.taskInstruction}>{currentTask.instruction}</div>
            <div className={styles.taskActions}>
              <button
                className={styles.hintBtn}
                onClick={() => setShowHint(showHint === currentTask.id ? null : currentTask.id)}
              >
                {showHint === currentTask.id ? 'Hide hint' : '💡 Show hint'}
              </button>
              <button
                className={styles.skipBtn}
                onClick={() => completeTask(currentTask.id)}
                title="Skip this task"
              >
                Skip
              </button>
            </div>
            {showHint === currentTask.id && (
              <div className={styles.hint}>{currentTask.hint}</div>
            )}
          </>
        ) : (
          <div className={styles.allDone}>All tasks complete!</div>
        )}

        <div className={styles.completedList}>
          {completedTaskIds.map((tid) => {
            const t = scenario.tasks.find((t) => t.id === tid);
            if (!t) return null;
            return (
              <div key={tid} className={styles.completedTask}>
                <span className={styles.check}>✓</span>
                <span>{t.instruction}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export { ScenarioSelector };
