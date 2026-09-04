import { ToolId } from '../types';

const STORAGE_KEY = 'merotools_tool_usage_v1';

interface ToolUsageEntry {
  count: number;
  lastUsedAt: string;
}

type ToolUsageMap = Partial<Record<ToolId, ToolUsageEntry>>;

function getUsageMap(): ToolUsageMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // corrupt storage — treat as empty
  }
  return {};
}

function saveUsageMap(map: ToolUsageMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore — e.g. storage full/unavailable
  }
}

export function recordToolUsage(toolId: ToolId): void {
  const map = getUsageMap();
  const existing = map[toolId];
  map[toolId] = {
    count: (existing?.count || 0) + 1,
    lastUsedAt: new Date().toISOString(),
  };
  saveUsageMap(map);
}

// Returns tool ids ranked by usage count (ties broken by most recent use),
// only including tools opened at least twice — a single tap shouldn't
// count as "frequently used".
export function getMostUsedTools(limit: number): ToolId[] {
  const map = getUsageMap();
  return (Object.entries(map) as [ToolId, ToolUsageEntry][])
    .filter(([, entry]) => entry.count >= 2)
    .sort((a, b) => {
      if (b[1].count !== a[1].count) return b[1].count - a[1].count;
      return new Date(b[1].lastUsedAt).getTime() - new Date(a[1].lastUsedAt).getTime();
    })
    .slice(0, limit)
    .map(([toolId]) => toolId);
}
