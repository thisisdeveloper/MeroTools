import { ToolId } from '../types';

const STORAGE_KEY = 'merotools_favorite_tools_v1';

export function getFavoriteToolIds(): ToolId[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // corrupt storage — treat as empty
  }
  return [];
}

function saveFavoriteToolIds(ids: ToolId[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore — e.g. storage full/unavailable
  }
}

// Flips the tool's favorite membership and returns the updated list, so
// callers can set their state directly from the result.
export function toggleFavoriteTool(toolId: ToolId): ToolId[] {
  const current = getFavoriteToolIds();
  const next = current.includes(toolId)
    ? current.filter((id) => id !== toolId)
    : [...current, toolId];
  saveFavoriteToolIds(next);
  return next;
}
