import { useState } from 'react';
import { useExtensionState } from './hooks/useExtensionState';
import Timer from './components/Timer';
import BlockList from './components/BlockList';
import Categories from './components/Categories';
import Streak from './components/Streak';
import styles from './App.module.css';

type Tab = 'timer' | 'blocklist' | 'categories';

export default function App() {
  const { state, loading, sendMessage } = useExtensionState();
  const [activeTab, setActiveTab] = useState<Tab>('timer');

  if (loading) {
    return (
      <div className={styles.loading}>
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>✦ Clarity</h1>
        <Streak
          currentStreak={state.currentStreak}
          pomodoroCount={state.pomodoroCount}
        />
      </header>

      {/* Tabs */}
      <nav className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'timer' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('timer')}
        >
          ⏱️ Timer
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'blocklist' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('blocklist')}
        >
          🚫 Sites
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'categories' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          📁 Categories
        </button>
      </nav>

      {/* Tab Content */}
      <main className={styles.content}>
        {activeTab === 'timer' && (
          <Timer state={state} sendMessage={sendMessage} />
        )}
        {activeTab === 'blocklist' && (
          <BlockList state={state} sendMessage={sendMessage} />
        )}
        {activeTab === 'categories' && (
          <Categories state={state} sendMessage={sendMessage} />
        )}
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <span>Total focus: {Math.floor(state.totalFocusMinutes / 60)}h {state.totalFocusMinutes % 60}m</span>
      </footer>
    </div>
  );
}
