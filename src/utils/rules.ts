import type { CategoryId } from '../types';
import { getAllBlockedDomains } from './categories';
import { getState } from './storage';

// Rule IDs start at 1. We reserve a range for dynamic rules.
const RULE_ID_OFFSET = 1;

function createBlockRule(id: number, domain: string): chrome.declarativeNetRequest.Rule {
  return {
    id,
    priority: 1,
    action: {
      type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
      redirect: {
        extensionPath: '/blocked.html',
      },
    },
    condition: {
      urlFilter: `||${domain}`,
      resourceTypes: [
        chrome.declarativeNetRequest.ResourceType.MAIN_FRAME,
      ],
    },
  };
}

export async function updateBlockingRules(): Promise<void> {
  const state = await getState();

  // Only block during work sessions
  if (state.timerState !== 'work') {
    await clearAllRules();
    return;
  }

  const domains = getAllBlockedDomains(state.blockedSites, state.blockedCategories);
  const newRules = domains.map((domain, index) =>
    createBlockRule(RULE_ID_OFFSET + index, domain)
  );

  // Get existing rule IDs to remove
  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const existingRuleIds = existingRules.map((rule) => rule.id);

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existingRuleIds,
    addRules: newRules,
  });
}

export async function clearAllRules(): Promise<void> {
  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const existingRuleIds = existingRules.map((rule) => rule.id);

  if (existingRuleIds.length > 0) {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: existingRuleIds,
    });
  }
}
