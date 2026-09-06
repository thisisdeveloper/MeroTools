// Tracks whether/when to show the "Enjoying Mero Tools?" rating prompt.
// Deliberately dependency-free (no native plugin imports) so App.tsx can
// check this on every launch without pulling anything heavy into the
// eager bundle — the actual native review trigger lives in
// services/appReview.ts, imported dynamically only when the prompt (or
// the Settings "Rate Us" button) is actually acted on.

const STORAGE_KEY = 'merotools_rate_prompt_v1';

// Ask starting from the 4th launch, not immediately — a brand-new user
// hasn't formed an opinion yet on launch 1.
const LAUNCH_THRESHOLD = 4;
// After "Maybe Later", wait this long before asking again.
const COOLDOWN_DAYS = 14;

type RatePromptStatus = 'pending' | 'dismissedPermanently' | 'rated';

interface RatePromptState {
  launchCount: number;
  status: RatePromptStatus;
  lastPromptedAt: string | null;
}

const DEFAULT_STATE: RatePromptState = {
  launchCount: 0,
  status: 'pending',
  lastPromptedAt: null,
};

function readState(): RatePromptState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    // ignore — treat as fresh state
  }
  return { ...DEFAULT_STATE };
}

function writeState(state: RatePromptState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore — e.g. storage full/unavailable
  }
}

// Call once per app launch (App.tsx, on mount).
export function recordAppLaunch(): void {
  const state = readState();
  writeState({ ...state, launchCount: state.launchCount + 1 });
}

export function shouldShowRatePrompt(): boolean {
  const state = readState();
  if (state.status !== 'pending') return false;
  if (state.launchCount < LAUNCH_THRESHOLD) return false;
  if (state.lastPromptedAt) {
    const daysSince = (Date.now() - new Date(state.lastPromptedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince < COOLDOWN_DAYS) return false;
  }
  return true;
}

// "Maybe Later" — don't ask again until the cooldown passes.
export function markPromptDeferred(): void {
  const state = readState();
  writeState({ ...state, lastPromptedAt: new Date().toISOString() });
}

export function markRated(): void {
  const state = readState();
  writeState({ ...state, status: 'rated', lastPromptedAt: new Date().toISOString() });
}

export function markDismissedPermanently(): void {
  const state = readState();
  writeState({ ...state, status: 'dismissedPermanently', lastPromptedAt: new Date().toISOString() });
}
