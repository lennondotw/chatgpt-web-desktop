#!/usr/bin/env bun
import { existsSync, } from 'fs';
import { $, } from 'zx';
import { config, } from './config';

$.verbose = true;

const KEYCHAIN_PROFILE = 'chatgpt-desktop-notarize';

async function setupKeychainProfile() {
  console.log('🔑 Setting up notarization credentials...',);
  console.log('   This will store credentials in your keychain.',);
  console.log('   You need: Apple ID, App-specific password, Team ID',);
  console.log('',);

  await $`xcrun notarytool store-credentials ${KEYCHAIN_PROFILE} --apple-id "$APPLE_ID" --team-id ${config.teamId}`;
  console.log('✅ Keychain profile saved!',);
}

async function notarizeApp(filePath: string,) {
  if (!existsSync(filePath,)) {
    throw new Error(`File not found: ${filePath}`,);
  }

  console.log(`📤 Submitting ${filePath} for notarization...`,);
  const result =
    await $`xcrun notarytool submit ${filePath} --keychain-profile ${KEYCHAIN_PROFILE} --wait`;

  if (result.exitCode !== 0) {
    throw new Error('Notarization failed',);
  }

  console.log('✅ Notarization successful!',);
  return result;
}

async function staple(filePath: string,) {
  console.log(`📎 Stapling notarization ticket to ${filePath}...`,);
  await $`xcrun stapler staple ${filePath}`;
  console.log('✅ Stapled!',);
}

async function main() {
  const args = process.argv.slice(2,);

  if (args.includes('--setup',)) {
    await setupKeychainProfile();
    return;
  }

  // Notarize DMG
  if (existsSync(config.dmgPath,)) {
    await notarizeApp(config.dmgPath,);
    await staple(config.dmgPath,);
  }

  // Notarize ZIP (for Sparkle updates)
  if (existsSync(config.zipPath,)) {
    await notarizeApp(config.zipPath,);
    // ZIP files can't be stapled
  }

  console.log('🎉 All notarization complete!',);
}

main().catch((err,) => {
  console.error('❌ Notarization failed:', err,);
  process.exit(1,);
},);
