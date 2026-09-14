import styles from './Streak.module.css';

interface Props {
  currentStreak: number;
  pomodoroCount: number;
}

export default function Streak({ currentStreak, pomodoroCount }: Props) {
  return (
    <div className={styles.streak}>
      <div className={styles.badge} title="Current streak">
        <span className={styles.fire}>🔥</span>
        <span className={styles.count}>{currentStreak}</span>
      </div>
      <div className={styles.badge} title="Pomodoros today">
        <span className={styles.fire}>🍅</span>
        <span className={styles.count}>{pomodoroCount}</span>
      </div>
    </div>
  );
}
