// Frequency cap for interstitial ads. Deliberately dependency-free (no
// native plugin imports) so App.tsx can check this on every tool-close
// without pulling anything heavy into the eager bundle — the actual
// native ad trigger lives in services/adMob.ts, imported dynamically
// only when an ad is actually eligible to show.

const STORAGE_KEY = 'merotools_interstitial_ad_v1';

// Show at most once per this many tool visits — high enough that most
// sessions never see one, so it doesn't feel like every action is
// interrupted.
const TOOL_CLOSE_THRESHOLD = 5;
// Even if a user rapidly opens/closes tools and hits the threshold
// quickly, never show ads more often than this.
const MIN_COOLDOWN_MINUTES = 4;

interface InterstitialAdState {
  toolCloseCount: number;
  lastShownAt: string | null;
}

const DEFAULT_STATE: InterstitialAdState = {
  toolCloseCount: 0,
  lastShownAt: null,
};

function readState(): InterstitialAdState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    // ignore — treat as fresh state
  }
  return { ...DEFAULT_STATE };
}

function writeState(state: InterstitialAdState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore — e.g. storage full/unavailable
  }
}

// Call every time the user leaves a tool back to the Tools/Home list —
// closing a tool (not opening one) is the natural break point, since
// interrupting mid-entry on a calculator would be far more annoying.
export function recordToolClose(): void {
  const state = readState();
  writeState({ ...state, toolCloseCount: state.toolCloseCount + 1 });
}

export function shouldShowInterstitial(): boolean {
  const state = readState();
  if (state.toolCloseCount < TOOL_CLOSE_THRESHOLD) return false;
  if (state.lastShownAt) {
    const minutesSince = (Date.now() - new Date(state.lastShownAt).getTime()) / (1000 * 60);
    if (minutesSince < MIN_COOLDOWN_MINUTES) return false;
  }
  return true;
}

export function markInterstitialShown(): void {
  writeState({ toolCloseCount: 0, lastShownAt: new Date().toISOString() });
}
