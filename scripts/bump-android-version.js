#!/usr/bin/env node
// Bumps package.json's semver version and mirrors it into the Android build
// so both stay in lockstep. versionCode (Play Store's monotonically
// increasing build id) always +1; versionName (user-facing string) mirrors
// package.json's version.
//
// Usage: node scripts/bump-android-version.js [patch|minor|major]

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const releaseType = process.argv[2] || 'patch';

if (!['patch', 'minor', 'major'].includes(releaseType)) {
  console.error(`Unknown release type "${releaseType}". Use patch, minor, or major.`);
  process.exit(1);
}

const pkgPath = join(__dirname, '..', 'package.json');
const gradlePath = join(__dirname, '..', 'android', 'app', 'build.gradle');

execSync(`npm version ${releaseType} --no-git-tag-version`, { stdio: 'inherit', cwd: join(__dirname, '..') });

const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
const versionName = pkg.version;

let gradle = readFileSync(gradlePath, 'utf8');

const codeMatch = gradle.match(/versionCode\s+(\d+)/);
if (!codeMatch) {
  console.error('Could not find versionCode in android/app/build.gradle');
  process.exit(1);
}
const nextVersionCode = parseInt(codeMatch[1], 10) + 1;

gradle = gradle
  .replace(/versionCode\s+\d+/, `versionCode ${nextVersionCode}`)
  .replace(/versionName\s+"[^"]*"/, `versionName "${versionName}"`);

writeFileSync(gradlePath, gradle);

console.log(`Bumped to versionName "${versionName}" (versionCode ${nextVersionCode}).`);
console.log('Run `npm run android:sync` next, then build the signed AAB in Android Studio.');
