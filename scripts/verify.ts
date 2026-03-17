#!/usr/bin/env bun
import { existsSync, } from 'fs';
import { $, } from 'zx';
import { config, } from './config';

$.verbose = true;

async function verify() {
  if (!existsSync(config.appPath,)) {
    console.error(`❌ App not found: ${config.appPath}`,);
    console.log('   Run: bun run scripts/build.ts',);
    process.exit(1,);
  }

  console.log('🔍 Checking code signature...',);
  await $`codesign --verify --deep --strict --verbose=2 ${config.appPath}`;

  console.log('',);
  console.log('📜 Signature details:',);
  await $`codesign -dv --verbose=2 ${config.appPath}`;

  console.log('',);
  console.log('🛡️  Gatekeeper assessment:',);
  try {
    await $`spctl --assess --type execute --verbose ${config.appPath}`;
    console.log('✅ Gatekeeper: PASSED',);
  } catch {
    console.log('⚠️  Gatekeeper: App needs notarization for distribution',);
  }

  console.log('',);
  console.log('🔐 Entitlements:',);
  await $`codesign -d --entitlements - ${config.appPath}`;
}

verify().catch((err,) => {
  console.error('❌ Verification failed:', err,);
  process.exit(1,);
},);
