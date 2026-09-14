import type { MessageType, MessageResponse, CategoryId } from '../types';
import { getState, setState } from '../utils/storage';
import { updateBlockingRules, clearAllRules } from '../utils/rules';

const ALARM_NAME = 'clarity_timer';

// --- Streak helpers ---

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

function isYesterday(dateStr: string): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0];
}

async function updateStreak(): Promise<void> {
  const state = await getState();
  const today = getTodayDate();

  if (state.lastActiveDate === today) {
    // Already updated today
    return;
  }

  if (isYesterday(state.lastActiveDate)) {
    // Consecutive day — increment streak
    await setState({
      currentStreak: state.currentStreak + 1,
      lastActiveDate: today,
    });
  } else {
    // Streak broken — reset to 1
    await setState({
      currentStreak: 1,
      lastActiveDate: today,
    });
  }
}

// --- Timer logic ---

async function startWorkSession(): Promise<void> {
  const state = await getState();
  const endTime = Date.now() + state.workDuration * 60 * 1000;

  await setState({
    timerState: 'work',
    timerEndTime: endTime,
  });

  // Create alarm
  await chrome.alarms.create(ALARM_NAME, {
    when: endTime,
  });

  // Apply blocking rules
  await updateBlockingRules();

  // Update streak
  await updateStreak();
}

async function startBreakSession(): Promise<void> {
  const state = await getState();
  const endTime = Date.now() + state.breakDuration * 60 * 1000;

  await setState({
    timerState: 'break',
    timerEndTime: endTime,
    pomodoroCount: state.pomodoroCount + 1,
    totalFocusMinutes: state.totalFocusMinutes + state.workDuration,
  });

  // Create alarm for break end
  await chrome.alarms.create(ALARM_NAME, {
    when: endTime,
  });

  // Remove blocking rules during break
  await clearAllRules();
}

async function resetTimer(): Promise<void> {
  await chrome.alarms.clear(ALARM_NAME);
  await clearAllRules();
  await setState({
    timerState: 'idle',
    timerEndTime: null,
  });
}

// --- Alarm handler ---

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== ALARM_NAME) return;

  const state = await getState();

  if (state.timerState === 'work') {
    // Work session ended — start break
    await startBreakSession();

    // Notify user
    chrome.notifications?.create?.('work-done', {
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Work session complete! 🎉',
      message: `Nice work! Take a ${state.breakDuration}-minute break.`,
    });
  } else if (state.timerState === 'break') {
    // Break ended — go back to idle
    await setState({
      timerState: 'idle',
      timerEndTime: null,
    });
    await clearAllRules();

    chrome.notifications?.create?.('break-done', {
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Break is over! 🔥',
      message: 'Ready to lock back in?',
    });
  }
});

// --- Message handler ---

chrome.runtime.onMessage.addListener(
  (message: MessageType, _sender, sendResponse: (response: MessageResponse) => void) => {
    handleMessage(message)
      .then((state) => sendResponse({ success: true, state }))
      .catch((error) => sendResponse({ success: false, error: String(error) }));

    // Return true to indicate we will respond asynchronously
    return true;
  }
);

async function handleMessage(message: MessageType) {
  switch (message.type) {
    case 'START_TIMER': {
      await startWorkSession();
      return getState();
    }

    case 'PAUSE_TIMER': {
      // For now, pause just resets (true pause would need storing remaining time)
      await resetTimer();
      return getState();
    }

    case 'RESET_TIMER': {
      await resetTimer();
      // Reset today's pomodoro count
      await setState({ pomodoroCount: 0 });
      return getState();
    }

    case 'SKIP_BREAK': {
      await chrome.alarms.clear(ALARM_NAME);
      await setState({
        timerState: 'idle',
        timerEndTime: null,
      });
      return getState();
    }

    case 'GET_STATE': {
      return getState();
    }

    case 'ADD_SITE': {
      const state = await getState();
      const domain = message.domain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
      if (!state.blockedSites.includes(domain)) {
        await setState({
          blockedSites: [...state.blockedSites, domain],
        });
        await updateBlockingRules();
      }
      return getState();
    }

    case 'REMOVE_SITE': {
      const state = await getState();
      await setState({
        blockedSites: state.blockedSites.filter((s) => s !== message.domain),
      });
      await updateBlockingRules();
      return getState();
    }

    case 'TOGGLE_CATEGORY': {
      const state = await getState();
      const categoryId = message.categoryId;
      const isBlocked = state.blockedCategories.includes(categoryId);
      await setState({
        blockedCategories: isBlocked
          ? state.blockedCategories.filter((c) => c !== categoryId)
          : [...state.blockedCategories, categoryId],
      });
      await updateBlockingRules();
      return getState();
    }

    case 'UPDATE_SETTINGS': {
      await setState({
        workDuration: message.workDuration,
        breakDuration: message.breakDuration,
      });
      return getState();
    }

    default:
      return getState();
  }
}

// --- On install / startup ---

chrome.runtime.onInstalled.addListener(async () => {
  // Initialize state with defaults if first install
  await getState();
  console.log('Clarity extension installed!');
});

chrome.runtime.onStartup.addListener(async () => {
  // Check if timer was running and handle accordingly
  const state = await getState();
  if (state.timerState !== 'idle' && state.timerEndTime) {
    if (Date.now() >= state.timerEndTime) {
      // Timer expired while browser was closed
      await resetTimer();
    } else {
      // Timer still running — re-apply rules if in work mode
      await updateBlockingRules();
    }
  }
});
