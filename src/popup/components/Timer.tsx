import type { ExtensionState, MessageType } from '../../types';
import styles from './Timer.module.css';

interface Props {
  state: ExtensionState;
  sendMessage: (msg: MessageType) => Promise<ExtensionState | null>;
}

function formatTime(ms: number): string {
  if (ms <= 0) return '00:00';
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function Timer({ state, sendMessage }: Props) {
  const remaining = state.timerEndTime ? state.timerEndTime - Date.now() : 0;
  const isIdle = state.timerState === 'idle';
  const isWork = state.timerState === 'work';
  const isBreak = state.timerState === 'break';

  // Calculate progress percentage
  const totalDuration = isWork
    ? state.workDuration * 60 * 1000
    : state.breakDuration * 60 * 1000;
  const progress = isIdle ? 0 : Math.max(0, Math.min(100, ((totalDuration - remaining) / totalDuration) * 100));

  return (
    <div className={styles.timer}>
      {/* Status label */}
      <div className={styles.status}>
        {isIdle && 'Ready to focus'}
        {isWork && '🔥 Focus Time'}
        {isBreak && '☕ Break Time'}
      </div>

      {/* Countdown */}
      <div className={styles.countdown}>
        {isIdle
          ? formatTime(state.workDuration * 60 * 1000)
          : formatTime(Math.max(0, remaining))}
      </div>

      {/* Progress bar */}
      <div className={styles.progressBar}>
        <div
          className={`${styles.progressFill} ${isBreak ? styles.breakFill : ''}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        {isIdle && (
          <button
            className={styles.startButton}
            onClick={() => sendMessage({ type: 'START_TIMER' })}
          >
            ▶ Start Focus
          </button>
        )}

        {isWork && (
          <>
            <button
              className={styles.stopButton}
              onClick={() => sendMessage({ type: 'PAUSE_TIMER' })}
            >
              ⏹ Stop
            </button>
          </>
        )}

        {isBreak && (
          <button
            className={styles.skipButton}
            onClick={() => sendMessage({ type: 'SKIP_BREAK' })}
          >
            ⏭ Skip Break
          </button>
        )}
      </div>

      {/* Today's stats */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{state.pomodoroCount}</span>
          <span className={styles.statLabel}>Pomodoros today</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{state.workDuration}m</span>
          <span className={styles.statLabel}>Focus length</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{state.breakDuration}m</span>
          <span className={styles.statLabel}>Break length</span>
        </div>
      </div>
    </div>
  );
}
