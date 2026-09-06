// Wraps @capacitor-community/admob's interstitial ad — this module is
// the only place that imports the native plugin bridge, so callers
// should always `import('./adMob')` dynamically rather than importing
// it at the top of an eagerly-loaded component (App.tsx does this).
//
// Interstitials are full-screen, so unlike a banner there's no
// positioning to get wrong — the only real work here is preloading one
// ahead of time (so there's no loading delay when it's actually shown)
// and re-preloading the next one after each dismissal/failure.

import { AdMob, AdOptions, InterstitialAdPluginEvents } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';
import {
  ADMOB_TEST_MODE,
  IOS_INTERSTITIAL_AD_UNIT_ID,
  ANDROID_INTERSTITIAL_AD_UNIT_ID,
} from '../config/adMobConfig';

function getInterstitialAdUnitId(): string {
  return Capacitor.getPlatform() === 'ios' ? IOS_INTERSTITIAL_AD_UNIT_ID : ANDROID_INTERSTITIAL_AD_UNIT_ID;
}

let initialized = false;
let interstitialReady = false;
let preparing = false;

async function initializeAdMob(): Promise<void> {
  if (initialized || !Capacitor.isNativePlatform()) return;
  try {
    await AdMob.initialize({ initializeForTesting: ADMOB_TEST_MODE });
    initialized = true;
    // Re-preload as soon as the current one is gone, so the next
    // eligible tool-close always has one ready rather than showing
    // nothing (fail-soft skip) or blocking on a fresh load.
    AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
      interstitialReady = false;
      prepareInterstitial();
    });
    AdMob.addListener(InterstitialAdPluginEvents.FailedToShow, () => {
      interstitialReady = false;
      prepareInterstitial();
    });
  } catch {
    // e.g. platform doesn't support ads — leave uninitialized, callers
    // fail soft on every subsequent call too.
  }
}

export async function prepareInterstitial(): Promise<void> {
  if (!Capacitor.isNativePlatform() || preparing || interstitialReady) return;
  try {
    preparing = true;
    await initializeAdMob();
    const options: AdOptions = {
      adId: getInterstitialAdUnitId(),
      isTesting: ADMOB_TEST_MODE,
    };
    await AdMob.prepareInterstitial(options);
    interstitialReady = true;
  } catch {
    // Fails soft — a failed preload just means the next eligible
    // tool-close silently skips showing an ad.
  } finally {
    preparing = false;
  }
}

// No-op (fails soft) if nothing is preloaded yet — callers should not
// block user navigation waiting for an ad to load.
export async function showInterstitialIfReady(): Promise<void> {
  if (!Capacitor.isNativePlatform() || !interstitialReady) return;
  try {
    interstitialReady = false;
    await AdMob.showInterstitial();
  } catch {
    // ignore
  }
}
