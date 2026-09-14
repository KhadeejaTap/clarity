import { useState } from 'react';
import type { ExtensionState, MessageType } from '../../types';
import styles from './BlockList.module.css';

interface Props {
  state: ExtensionState;
  sendMessage: (msg: MessageType) => Promise<ExtensionState | null>;
}

export default function BlockList({ state, sendMessage }: Props) {
  const [input, setInput] = useState('');

  const handleAdd = async () => {
    const domain = input.trim();
    if (!domain) return;
    await sendMessage({ type: 'ADD_SITE', domain });
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  return (
    <div className={styles.blocklist}>
      <div className={styles.inputRow}>
        <input
          type="text"
          className={styles.input}
          placeholder="Enter domain (e.g. twitter.com)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className={styles.addButton} onClick={handleAdd}>
          + Add
        </button>
      </div>

      {state.blockedSites.length === 0 ? (
        <p className={styles.empty}>No sites blocked yet. Add domains above.</p>
      ) : (
        <ul className={styles.list}>
          {state.blockedSites.map((site) => (
            <li key={site} className={styles.item}>
              <span className={styles.domain}>🚫 {site}</span>
              <button
                className={styles.removeButton}
                onClick={() => sendMessage({ type: 'REMOVE_SITE', domain: site })}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
