import type { Category } from '../types';

export const CATEGORIES: Category[] = [
  {
    id: 'social',
    label: 'Social Media',
    icon: '📱',
    domains: [
      'facebook.com', 'www.facebook.com',
      'twitter.com', 'www.twitter.com', 'x.com', 'www.x.com',
      'instagram.com', 'www.instagram.com',
      'tiktok.com', 'www.tiktok.com',
      'snapchat.com', 'www.snapchat.com',
      'linkedin.com', 'www.linkedin.com',
      'threads.net', 'www.threads.net',
      'bsky.app',
    ],
  },
  {
    id: 'entertainment',
    label: 'Entertainment',
    icon: '🎬',
    domains: [
      'youtube.com', 'www.youtube.com',
      'netflix.com', 'www.netflix.com',
      'twitch.tv', 'www.twitch.tv',
      'hulu.com', 'www.hulu.com',
      'disneyplus.com', 'www.disneyplus.com',
      'hbomax.com', 'www.hbomax.com',
      'crunchyroll.com', 'www.crunchyroll.com',
      'spotify.com', 'open.spotify.com',
    ],
  },
  {
    id: 'news',
    label: 'News & Media',
    icon: '📰',
    domains: [
      'reddit.com', 'www.reddit.com', 'old.reddit.com',
      'news.ycombinator.com',
      'cnn.com', 'www.cnn.com',
      'bbc.com', 'www.bbc.com',
      'buzzfeed.com', 'www.buzzfeed.com',
      'tmz.com', 'www.tmz.com',
    ],
  },
  {
    id: 'shopping',
    label: 'Shopping',
    icon: '🛍️',
    domains: [
      'amazon.com', 'www.amazon.com',
      'ebay.com', 'www.ebay.com',
      'etsy.com', 'www.etsy.com',
      'aliexpress.com', 'www.aliexpress.com',
      'shein.com', 'www.shein.com',
      'temu.com', 'www.temu.com',
    ],
  },
  {
    id: 'gaming',
    label: 'Gaming',
    icon: '🎮',
    domains: [
      'store.steampowered.com',
      'epicgames.com', 'www.epicgames.com',
      'roblox.com', 'www.roblox.com',
      'itch.io',
      'miniclip.com', 'www.miniclip.com',
      'poki.com', 'www.poki.com',
    ],
  },
];

export function getCategoryDomains(categoryId: string): string[] {
  const category = CATEGORIES.find((c) => c.id === categoryId);
  return category ? category.domains : [];
}

export function getAllBlockedDomains(
  blockedSites: string[],
  blockedCategories: string[]
): string[] {
  const categoryDomains = blockedCategories.flatMap(getCategoryDomains);
  const allDomains = [...new Set([...blockedSites, ...categoryDomains])];
  return allDomains;
}
