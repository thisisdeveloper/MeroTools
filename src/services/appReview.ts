// Wraps the native in-app review dialogs (SKStoreReviewController on
// iOS, Play Core's ReviewManager on Android) — no store URL needed to
// trigger these, the OS shows its own star-rating card without leaving
// the app. Kept in its own module (separate from rateAppPrompt.ts,
// which is dependency-free) since this one imports the native plugin
// bridge — callers should always `import('./appReview')` dynamically
// rather than importing it at the top of an eagerly-loaded component.

import { InAppReview } from '@capacitor-community/in-app-review';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { PLAY_STORE_URL, APP_STORE_URL } from '../config/appStoreLinks';

// Both platforms' native review APIs are a no-op (no error, nothing
// shown) if the app isn't actually live on that store yet, or if the
// user has already been asked the platform's own max number of times —
// safe to call unconditionally.
export async function requestNativeReview(): Promise<void> {
  await InAppReview.requestReview();
}

// Direct "open the store listing" action — a user who deliberately
// opened Settings to rate the app may want the full store page (to
// also read/write a detailed review), not just the quick native star
// prompt.
export async function openStorePage(): Promise<void> {
  const platform = Capacitor.getPlatform();
  const url = platform === 'ios' ? APP_STORE_URL : PLAY_STORE_URL;
  if (!url) return; // e.g. iOS listing not live yet — nothing to open
  await Browser.open({ url });
}

// Settings' persistent "Rate Us" button: opens the Play Store listing
// directly on Android (live), but falls back to the native review
// prompt on iOS since there's no App Store URL yet — requestNativeReview
// is a safe no-op if the app isn't actually live there either, rather
// than a button that visibly does nothing.
export async function rateApp(): Promise<void> {
  if (Capacitor.getPlatform() === 'ios') {
    await requestNativeReview();
  } else {
    await openStorePage();
  }
}
