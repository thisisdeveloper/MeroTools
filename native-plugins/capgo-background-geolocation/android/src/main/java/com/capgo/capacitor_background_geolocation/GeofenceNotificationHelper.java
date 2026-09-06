package com.capgo.capacitor_background_geolocation;

import android.Manifest;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import com.getcapacitor.Logger;
import org.json.JSONObject;

/**
 * FORK ADDITION (see FORK_NOTES.md): the upstream plugin only ever
 * broadcasts the transition in-process (dead if the WebView isn't
 * alive) or POSTs it to a server URL (shows nothing on-device by
 * itself). This shows a real local notification directly from native
 * code — the BroadcastReceiver that delivers geofence transitions runs
 * even when the app process isn't alive (as long as the user hasn't
 * explicitly Force-Stopped the app in Settings), so no WebView, JS
 * bridge, or server round-trip is needed.
 */
final class GeofenceNotificationHelper {

    // Two channels, not one: a channel's importance/vibration is locked in
    // at creation on Android 8+ and can't be changed by the app afterward
    // (only the user can, in system Settings) — so the user-facing Alarm
    // vs Alert choice (services/locationNotificationSettings.ts) needs two
    // separate channel IDs to actually take effect per-notification,
    // rather than one channel whose settings a later notify() call can't
    // override.
    private static final String CHANNEL_ID_ALARM = "location_reminders_alarm";
    private static final String CHANNEL_ID_ALERT = "location_reminders_alert";
    private static int notificationIdCounter = 900000; // arbitrary range, away from other app notification ids

    private GeofenceNotificationHelper() {}

    static void showTransitionNotification(Context context, JSONObject transitionData) {
        JSONObject payload = transitionData.optJSONObject("payload");
        if (payload == null) {
            return;
        }
        String title = payload.optString("title", "");
        String body = payload.optString("body", "");
        if (title.isEmpty() && body.isEmpty()) {
            // Not a Location Reminder geofence (no title/body payload set) — nothing to show.
            return;
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            boolean granted =
                ActivityCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) ==
                PackageManager.PERMISSION_GRANTED;
            if (!granted) {
                Logger.debug("Skipping geofence notification: POST_NOTIFICATIONS not granted");
                return;
            }
        }

        ensureChannels(context);

        // User-facing Settings choice (services/locationNotificationSettings.ts),
        // read out of the same geofence payload option addGeofence()
        // already accepted upstream. Defaults to "alarm" so a geofence
        // registered before this setting existed keeps the stronger
        // behavior rather than silently going quiet.
        String style = payload.optString("style", "alarm");
        boolean isAlarm = !"alert".equals(style);
        String channelId = isAlarm ? CHANNEL_ID_ALARM : CHANNEL_ID_ALERT;

        Intent launchIntent = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
        PendingIntent contentIntent = null;
        if (launchIntent != null) {
            launchIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                flags |= PendingIntent.FLAG_IMMUTABLE;
            }
            contentIntent = PendingIntent.getActivity(context, notificationIdCounter, launchIntent, flags);
        }

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, channelId)
            .setSmallIcon(context.getApplicationInfo().icon)
            .setContentTitle(title.isEmpty() ? body : title)
            .setContentText(title.isEmpty() ? "" : body)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
            .setPriority(isAlarm ? NotificationCompat.PRIORITY_HIGH : NotificationCompat.PRIORITY_DEFAULT)
            .setCategory(NotificationCompat.CATEGORY_REMINDER)
            .setAutoCancel(true);
        if (isAlarm) {
            // Distinct triple-buzz pattern (vs. the single default buzz) so
            // an alarm-style alert is harder to mistake for a routine
            // notification — pre-Oreo fallback only; on Oreo+ the channel's
            // own vibration pattern (set in ensureChannels) governs instead.
            // The strongest attention-grabbing option available without a
            // full-screen intent (a much bigger, riskier change: needs its
            // own manifest permission that Android 14+ requires the user to
            // grant explicitly in Settings, and is really meant for
            // incoming-call-style UI, not a personal reminder).
            builder.setVibrate(new long[] { 0, 500, 250, 500, 250, 500 });
        }
        if (contentIntent != null) {
            builder.setContentIntent(contentIntent);
        }

        try {
            NotificationManagerCompat.from(context).notify(notificationIdCounter++, builder.build());
        } catch (SecurityException exception) {
            Logger.error("Failed to show geofence notification", exception);
        }
    }

    private static void ensureChannels(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return;
        }
        NotificationManager manager = context.getSystemService(NotificationManager.class);
        if (manager == null) {
            return;
        }

        // A channel's vibration/importance can only be set at creation —
        // Android doesn't let an app change it later via code once a
        // channel with this ID already exists, only the user can (in
        // system Settings). Only takes effect on a fresh install.
        if (manager.getNotificationChannel(CHANNEL_ID_ALARM) == null) {
            NotificationChannel alarmChannel = new NotificationChannel(
                CHANNEL_ID_ALARM,
                "Location Reminders (Alarm)",
                NotificationManager.IMPORTANCE_HIGH
            );
            alarmChannel.setDescription(
                "Insistent alert with strong vibration when you arrive at or leave a place."
            );
            alarmChannel.enableVibration(true);
            alarmChannel.setVibrationPattern(new long[] { 0, 500, 250, 500, 250, 500 });
            manager.createNotificationChannel(alarmChannel);
        }

        if (manager.getNotificationChannel(CHANNEL_ID_ALERT) == null) {
            NotificationChannel alertChannel = new NotificationChannel(
                CHANNEL_ID_ALERT,
                "Location Reminders (Alert)",
                NotificationManager.IMPORTANCE_DEFAULT
            );
            alertChannel.setDescription(
                "A regular, quieter notification when you arrive at or leave a place."
            );
            manager.createNotificationChannel(alertChannel);
        }
    }
}
