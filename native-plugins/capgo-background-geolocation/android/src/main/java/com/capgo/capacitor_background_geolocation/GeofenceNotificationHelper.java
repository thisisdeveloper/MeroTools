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

    private static final String CHANNEL_ID = "location_reminders";
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

        ensureChannel(context);

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

        // Distinct triple-buzz pattern (vs. the single default buzz) so a
        // geofence alert is harder to mistake for a routine notification —
        // the strongest attention-grabbing option available without a
        // full-screen intent (a much bigger, riskier change: needs its own
        // manifest permission that Android 14+ requires the user to grant
        // explicitly in Settings, and is really meant for incoming-call-
        // style UI, not a personal reminder).
        long[] vibrationPattern = { 0, 500, 250, 500, 250, 500 };

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(context.getApplicationInfo().icon)
            .setContentTitle(title.isEmpty() ? body : title)
            .setContentText(title.isEmpty() ? "" : body)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_REMINDER)
            .setVibrate(vibrationPattern)
            .setAutoCancel(true);
        if (contentIntent != null) {
            builder.setContentIntent(contentIntent);
        }

        try {
            NotificationManagerCompat.from(context).notify(notificationIdCounter++, builder.build());
        } catch (SecurityException exception) {
            Logger.error("Failed to show geofence notification", exception);
        }
    }

    private static void ensureChannel(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return;
        }
        NotificationManager manager = context.getSystemService(NotificationManager.class);
        if (manager == null || manager.getNotificationChannel(CHANNEL_ID) != null) {
            return;
        }
        NotificationChannel channel = new NotificationChannel(
            CHANNEL_ID,
            "Location Reminders",
            NotificationManager.IMPORTANCE_HIGH
        );
        channel.setDescription("Alerts when you arrive at or leave a place you've set a reminder for.");
        // A channel's vibration/importance can only be set at creation —
        // Android doesn't let an app change it later via code once a
        // channel with this ID already exists, only the user can (in
        // system Settings). Only takes effect on a fresh install.
        channel.enableVibration(true);
        channel.setVibrationPattern(new long[] { 0, 500, 250, 500, 250, 500 });
        manager.createNotificationChannel(channel);
    }
}
