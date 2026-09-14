import type { ExtensionState, MessageType } from '../../types';
import { CATEGORIES } from '../../utils/categories';
import styles from './Categories.module.css';

interface Props {
  state: ExtensionState;
  sendMessage: (msg: MessageType) => Promise<ExtensionState | null>;
}

export default function Categories({ state, sendMessage }: Props) {
  return (
    <div className={styles.categories}>
      <p className={styles.hint}>Toggle categories to block groups of sites at once.</p>
      <div className={styles.list}>
        {CATEGORIES.map((category) => {
          const isBlocked = state.blockedCategories.includes(category.id);
          return (
            <button
              key={category.id}
              className={`${styles.category} ${isBlocked ? styles.blocked : ''}`}
              onClick={() =>
                sendMessage({ type: 'TOGGLE_CATEGORY', categoryId: category.id })
              }
            >
              <div className={styles.categoryInfo}>
                <span className={styles.icon}>{category.icon}</span>
                <div>
                  <span className={styles.label}>{category.label}</span>
                  <span className={styles.count}>
                    {category.domains.length} sites
                  </span>
                </div>
              </div>
              <div className={`${styles.toggle} ${isBlocked ? styles.toggleOn : ''}`}>
                <div className={styles.toggleDot} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
