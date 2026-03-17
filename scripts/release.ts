#!/usr/bin/env bun
import { $, } from 'zx';
import { config, } from './config';

$.verbose = true;

async function release() {
  const args = process.argv.slice(2,);
  const skipNotarize = args.includes('--skip-notarize',);

  // Step 1: Clean
  console.log('🧹 Cleaning release directory...',);
  await $`rm -rf ${config.releaseDir}`;

  // Step 2: Build
  console.log('🔨 Building...',);
  await $`bun run scripts/build.ts`;

  // Step 3: Verify signature
  console.log('🔍 Verifying code signature...',);
  await $`codesign --verify --deep --strict ${config.appPath}`;
  await $`codesign -dv ${config.appPath}`;

  // Step 4: Notarize (optional)
  if (!skipNotarize) {
    console.log('📤 Notarizing...',);
    await $`bun run scripts/notarize.ts`;
  } else {
    console.log('⏭️  Skipping notarization (--skip-notarize)',);
  }

  // Step 5: Final verification
  console.log('🔍 Final Gatekeeper check...',);
  await $`spctl --assess --type execute --verbose ${config.appPath}`;

  console.log('',);
  console.log('🎉 Release complete!',);
  console.log('',);
  console.log('📦 Artifacts:',);
  console.log(`   ${config.dmgPath}`,);
  console.log(`   ${config.zipPath}`,);
}

release().catch((err,) => {
  console.error('❌ Release failed:', err,);
  process.exit(1,);
},);
