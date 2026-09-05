# Local fork notes

This is a vendored copy of `@capgo/background-geolocation@8.4.3`
(MPL-2.0, https://github.com/Cap-go/capacitor-background-geolocation),
referenced via a `file:` dependency in the app's `package.json` instead
of the npm registry, so it can be patched directly.

## Why

The upstream plugin's only geofence-transition delivery paths are:
1. An in-process broadcast to the JS bridge (`notifyListeners` on iOS,
   `LocalBroadcastManager` on Android) — dead if the WebView isn't alive.
2. An HTTP POST to a server `url` you configure — shows nothing on the
   device by itself; something on the other end would need to send a
   push notification back.

Neither shows a notification when the app is backgrounded/killed and no
server is involved. Location Reminders needs exactly that: a real local
notification, with no server dependency (see the app's location-reminder
architecture discussion — no Firebase/APNs/backend for the trigger path,
only the app's existing Django backend's `/places/search/` for location
*search*, which is unrelated).

## What was changed

- **Android**: `GeofenceBroadcastReceiver.onReceive()` now also calls
  the new `GeofenceNotificationHelper.showTransitionNotification()`,
  which posts a real `NotificationCompat` notification built from the
  `title`/`body` keys already present in the geofence's `payload` (the
  same `payload` option `addGeofence()` already accepted upstream — no
  API changes, we just read two more keys out of it). Runs inside the
  same `BroadcastReceiver`, which Android instantiates even if the app
  process wasn't already running, as long as the user hasn't explicitly
  Force-Stopped the app in Settings (an intentional, unavoidable Android
  restriction — not something this patch works around).
- **iOS**: `handleGeofenceTransition()` now also calls the new
  `showTransitionNotification()`, scheduling a `UNNotificationRequest`
  from the same `title`/`body` payload keys. `CLLocationManager` region
  monitoring can relaunch/wake the app in the background to run this
  delegate method even after the app was terminated — again, not true
  for an explicit user force-quit, which iOS itself restricts.

Both additions are purely additive (existing JS-listener and URL-POST
behavior is untouched) and no-op if a geofence's payload has no
`title`/`body` (so this fork is safe to use for any future non-Location-
Reminder geofence too, if the app ever adds one that doesn't want a
native notification).

## Updating this fork later

If you ever want to pull in a newer upstream version: diff this folder
against a fresh `npm view @capgo/background-geolocation@<version>
dist.tarball` download, and re-apply the two changes above (search for
"FORK ADDITION" in both native source files).
