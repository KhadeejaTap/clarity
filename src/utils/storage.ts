import { DEFAULT_STATE } from '../types';
import type { ExtensionState } from '../types';

const STORAGE_KEY = 'clarityState';

export async function getState(): Promise<ExtensionState> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return { ...DEFAULT_STATE, ...result[STORAGE_KEY] };
}

export async function setState(updates: Partial<ExtensionState>): Promise<ExtensionState> {
  const current = await getState();
  const newState = { ...current, ...updates };
  await chrome.storage.local.set({ [STORAGE_KEY]: newState });
  return newState;
}

export async function resetState(): Promise<ExtensionState> {
  await chrome.storage.local.set({ [STORAGE_KEY]: DEFAULT_STATE });
  return DEFAULT_STATE;
}
