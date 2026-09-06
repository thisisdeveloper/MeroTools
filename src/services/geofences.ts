// Glue between the reminders store and the native geofencing plugin.
// The plugin itself (a local fork — see native-plugins/capgo-background-
// geolocation/FORK_NOTES.md) shows the actual notification natively, with
// no WebView/JS dependency once a geofence is registered; this module's
// job is just keeping native registrations in sync with saved location
// reminders, and the one-time permission flow.

import { BackgroundGeolocation } from '@capgo/background-geolocation';
import { ReminderRecord } from '../types';
import { getLocationNotificationStyle } from './locationNotificationSettings';

let geofencingConfigured = false;

// Configures native geofencing (idempotent — safe to call repeatedly).
// requestPermissions:false because permission requests are driven
// explicitly by requestLocationPermission() below, only when the user
// actually adds a location reminder, not implicitly here.
async function ensureGeofencingConfigured(): Promise<void> {
  if (geofencingConfigured) return;
  await BackgroundGeolocation.setupGeofencing({
    notifyOnEntry: true,
    notifyOnExit: true,
    requestPermissions: false,
    backgroundLocation: true,
  });
  geofencingConfigured = true;
}

export interface LocationPermissionStatus {
  foregroundGranted: boolean;
  backgroundGranted: boolean;
}

export async function checkLocationPermission(): Promise<LocationPermissionStatus> {
  const status = await BackgroundGeolocation.checkPermissions();
  return {
    foregroundGranted: status.location === 'granted',
    backgroundGranted: status.backgroundLocation === 'granted' || status.backgroundLocation === 'always',
  };
}

// Staged request, per the original spec ("permission only when needed"):
// foreground ("When In Use") first, then upgrade to background ("Always")
// only once foreground is actually granted — matches how both platforms
// expect this flow to be presented to the user.
export async function requestLocationPermission(): Promise<LocationPermissionStatus> {
  const foregroundStatus = await BackgroundGeolocation.requestPermissions({ permissions: ['location', 'notification'] });
  if (foregroundStatus.location !== 'granted') {
    return { foregroundGranted: false, backgroundGranted: false };
  }
  const backgroundStatus = await BackgroundGeolocation.requestPermissions({ permissions: ['backgroundLocation'] });
  return {
    foregroundGranted: true,
    backgroundGranted: backgroundStatus.backgroundLocation === 'granted' || backgroundStatus.backgroundLocation === 'always',
  };
}

// Foreground-only prompt, deliberately not escalating to background/Always
// — used by the map picker's "use my location" button, which only needs
// a one-off fix to center the map. Requesting Always there would jump
// ahead of the staged flow above, which should stay the only place that
// asks for Always (when a location reminder is actually being saved).
export async function requestForegroundLocationPermission(): Promise<boolean> {
  const status = await BackgroundGeolocation.requestPermissions({ permissions: ['location'] });
  return status.location === 'granted';
}

export interface SimpleCoords {
  lat: number;
  lng: number;
}

const CURRENT_LOCATION_TIMEOUT_MS = 10000;

// One-shot "where am I right now" fix. The plugin only exposes a
// continuous watcher (start/callback/stop), not a dedicated single-shot
// API, so this takes the first delivered position (allowing a possibly-
// stale cached fix for speed, since this is just for centering a map,
// not for anything precision-sensitive) and immediately stops the watch.
export async function getCurrentLocationOnce(): Promise<SimpleCoords | null> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (result: SimpleCoords | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      BackgroundGeolocation.stop().catch(() => {});
      resolve(result);
    };
    const timer = setTimeout(() => finish(null), CURRENT_LOCATION_TIMEOUT_MS);
    BackgroundGeolocation.start({ requestPermissions: false, stale: true }, (position, error) => {
      if (error || !position) {
        finish(null);
        return;
      }
      finish({ lat: position.latitude, lng: position.longitude });
    }).catch(() => finish(null));
  });
}

// Registers (or re-registers) the native geofence for a location
// reminder, storing the native id isn't needed separately — the
// reminder's own id is used as the geofence identifier directly, so
// there's nothing extra to persist or look up.
export async function registerGeofence(reminder: ReminderRecord): Promise<void> {
  if (reminder.type !== 'location' || !reminder.location) return;
  await ensureGeofencingConfigured();
  const { lat, lng, radiusMeters, trigger, name } = reminder.location;
  await BackgroundGeolocation.addGeofence({
    identifier: reminder.id,
    latitude: lat,
    longitude: lng,
    radius: radiusMeters,
    notifyOnEntry: trigger === 'enter',
    notifyOnExit: trigger === 'exit',
    payload: {
      title: reminder.title,
      body: reminder.notes || name,
      // Read fresh on every register so a Settings change takes effect
      // for new/edited reminders immediately — see
      // reapplyLocationNotificationStyle for updating already-registered
      // ones. The native side (GeofenceNotificationHelper.java /
      // CapgoCapacitorBackgroundGeolocationPlugin.swift) reads this to
      // decide how insistently to present the notification.
      style: getLocationNotificationStyle(),
    },
  });
}

export async function unregisterGeofence(reminderId: string): Promise<void> {
  try {
    await BackgroundGeolocation.removeGeofence({ identifier: reminderId });
  } catch {
    // Already gone (e.g. never successfully registered) — nothing to do.
  }
}

// Unlike reconcileGeofences (which only fills in what's missing),
// this force-refreshes every active location reminder's native
// registration so a changed notification-style Setting applies right
// away instead of waiting for the next edit/save or app-launch
// reconcile that happens to skip already-monitored regions.
export async function reapplyLocationNotificationStyle(reminders: ReminderRecord[]): Promise<void> {
  const active = reminders.filter((r) => r.type === 'location' && r.location && !r.isCompleted);
  for (const reminder of active) {
    try {
      await unregisterGeofence(reminder.id);
      await registerGeofence(reminder);
    } catch {
      // Leave it be — the next app-launch reconcile will retry.
    }
  }
}

// Reconciles native registrations against the current reminders list —
// call once on app launch. Covers the OS having dropped a region (e.g.
// after a device restart, on platforms/versions where that can happen)
// by re-adding anything that should be monitored but isn't, and removes
// native regions for reminders that were deleted/disabled/changed type
// since the last launch.
export async function reconcileGeofences(reminders: ReminderRecord[]): Promise<void> {
  const activeLocationReminders = reminders.filter((r) => r.type === 'location' && r.location && !r.isCompleted);
  const wantedIds = new Set(activeLocationReminders.map((r) => r.id));

  await ensureGeofencingConfigured();

  let monitoredIds: string[] = [];
  try {
    monitoredIds = (await BackgroundGeolocation.getMonitoredGeofences()).regions;
  } catch {
    monitoredIds = [];
  }

  for (const id of monitoredIds) {
    if (!wantedIds.has(id)) await unregisterGeofence(id);
  }
  for (const reminder of activeLocationReminders) {
    if (!monitoredIds.includes(reminder.id)) {
      try {
        await registerGeofence(reminder);
      } catch {
        // Permission not granted, or platform region-limit reached —
        // leave it unregistered rather than throwing app-launch-wide.
      }
    }
  }
}
