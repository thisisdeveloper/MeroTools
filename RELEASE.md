# Mero Tools — Android Release Notes

Reference doc for taking this app to the Play Store. Written 2026-08-24.

## App identity

| | |
|---|---|
| Package / Application ID | `np.com.kumarusnil.merotools` |
| App name | Mero Tools |
| Current version | `1.0.0` (versionCode `1`) |
| Min SDK / Target SDK | 24 / 36 |

## Local toolchain (already installed on this Mac)

Nothing here existed before this project — needed for any future local Android build:

- JDK 17 (`brew install openjdk@17`) — used for the Android SDK command-line tools themselves
- JDK 21 (`brew install openjdk@21`) — required by Capacitor's Android module to compile; this is the one `JAVA_HOME` must point to for Gradle builds
- Android SDK command-line tools (`brew install --cask android-commandlinetools`), installed to `/opt/homebrew/share/android-commandlinetools`
- Installed SDK packages: `platform-tools`, `platforms;android-36`, `build-tools;36.0.0`

Env vars needed before any Gradle command:
```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
export PATH="$JAVA_HOME/bin:$PATH"
export ANDROID_HOME=/opt/homebrew/share/android-commandlinetools
```

## Signing key

- Keystore file: `/Users/sk/meroTools/android-signing-keys/merotools-release.jks` — **lives outside this git repo on purpose**, never committed
- Key alias: `merotools`
- Password: generated once and shown to you in chat — **make sure it's in a password manager**. It is not written anywhere in this repo or on disk in plaintext. If it's lost, this listing can never be updated again under the same signing identity; you'd have to publish as a new app.
- Certificate fingerprints (Play Console may ask for these):
  - SHA1: `73:2B:FF:C4:4A:4B:ED:E2:A4:88:8A:80:3F:63:A8:A7:B5:AF:E2:D3`
  - SHA256: `72:F8:13:F5:52:A4:7A:73:96:8D:C0:A5:98:AB:68:54:B2:45:B8:69:0B:9A:19:79:00:CF:32:4B:0F:27:37:0E`
  - Expires: 2054-01-09

Release signing config (`android/app/build.gradle`) reads the password from environment variables only — it is never written to a file in this project.

## Build commands

```bash
# one-time env setup (every new terminal session)
export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
export PATH="$JAVA_HOME/bin:$PATH"
export ANDROID_HOME=/opt/homebrew/share/android-commandlinetools

# debug APK — for sideloading onto your own phone to test
npm run android:sync && cd android && ./gradlew assembleDebug
# → android/app/build/outputs/apk/debug/app-debug.apk

# signed release AAB — what you upload to Play Console
export MEROTOOLS_KEYSTORE_PATH="/Users/sk/meroTools/android-signing-keys/merotools-release.jks"
export MEROTOOLS_KEYSTORE_PASSWORD='<your password from the password manager>'
export MEROTOOLS_KEY_ALIAS="merotools"
export MEROTOOLS_KEY_PASSWORD='<same password>'
npm run android:sync && cd android && ./gradlew bundleRelease
# → android/app/build/outputs/bundle/release/app-release.aab

# bump version before a new release (patch/minor/major)
npm run android:version -- patch
```

## Done

- [x] Capacitor Android project scaffolded, icons + splash generated from in-app flag art
- [x] Bundle size cut 510 KB → 282 KB main chunk via lazy-loading all 16 tools
- [x] UI bugs fixed: calendar dark-mode cell background, tool-page back button hiding titles
- [x] Tailwind v4 dark-mode bug fixed (manual Light/Dark/System toggle was a no-op before this)
- [x] Forex API bug fixed (NRB API call was missing required `from`/`to` date params — guaranteed 400 before)
- [x] Privacy Policy built into the app as a real page (`src/components/PrivacyPolicyPage.tsx`), reachable via `#privacy` on a fresh load with no server config needed
- [x] Feature graphic generated (`assets/feature-graphic.png`, 1024×500)
- [x] Debug APK built and tested on a real device
- [x] Signed release AAB built and signature-verified
- [x] Versioning convention in place (`npm run android:version`)
- [x] Changes committed to git

## Still pending — outside this repo

1. **Host the web app publicly.** Play Console requires the privacy policy as a URL it can visit from outside the app — `https://your-domain/#privacy` once hosted. You said you'd handle hosting yourself; send me the URL once it's live and I'll verify the link resolves correctly.
2. **Play Console store listing** — title, short/full description, category, contact email, screenshots (at least 2 phone screenshots — can generate these from the running app on request), the feature graphic (ready), content rating questionnaire, and the Data Safety form (should be simple and honest: no personal data collected, no accounts, no analytics/ads SDKs — everything is local storage or public rate APIs).
3. Recommended: run the AAB through an **internal testing track** first before a public production release.
4. **Push local git commits to `origin`** — was left pending, not yet done.

## Known non-blocking notes

- Gold/Silver tool's "Live" badge is cosmetic — `src/services/metals.ts` never actually fetches live rates, just relabels cached/default data with a fresh timestamp. Not broken, just not truthfully "live." Worth fixing before public launch if accuracy matters to you.
- `package.json` still lists unused leftovers from the original AI Studio template (`@google/genai`, `express`, `dotenv`, `tsx`) — none are imported anywhere in `src/`. Safe to remove, just hasn't been asked for.
- `README.md` and `metadata.json` still describe the AI-Studio/Gemini starter template rather than this app.
- `minifyEnabled` is `false` on the release build type — turning on R8/ProGuard would shrink the AAB further; optional, untested.
