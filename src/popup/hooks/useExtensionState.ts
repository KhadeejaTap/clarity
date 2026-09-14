import { useState, useEffect, useCallback } from 'react';
import type { ExtensionState, MessageType, MessageResponse } from '../../types';
import { DEFAULT_STATE } from '../../types';

export function useExtensionState() {
  const [state, setLocalState] = useState<ExtensionState>(DEFAULT_STATE);
  const [loading, setLoading] = useState(true);

  const sendMessage = useCallback(async (message: MessageType): Promise<ExtensionState | null> => {
    try {
      const response: MessageResponse = await chrome.runtime.sendMessage(message);
      if (response.success) {
        setLocalState(response.state);
        return response.state;
      } else {
        console.error('Message failed:', response.error);
        return null;
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      return null;
    }
  }, []);

  // Load initial state
  useEffect(() => {
    sendMessage({ type: 'GET_STATE' }).finally(() => setLoading(false));
  }, [sendMessage]);

  // Poll for timer updates every second when timer is active
  useEffect(() => {
    if (state.timerState === 'idle') return;

    const interval = setInterval(() => {
      sendMessage({ type: 'GET_STATE' });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.timerState, sendMessage]);

  return { state, loading, sendMessage };
}
