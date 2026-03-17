#!/usr/bin/env bun
import { $, } from 'zx';
import { config, } from './config';

$.verbose = true;

async function build() {
  console.log('🔨 Building TypeScript...',);
  await $`tsc --build`;

  console.log('📦 Packaging with electron-builder...',);
  await $`npx electron-builder --mac --publish never`;

  console.log('✅ Build complete!',);
  console.log(`   App: ${config.appPath}`,);
  console.log(`   DMG: ${config.dmgPath}`,);
  console.log(`   ZIP: ${config.zipPath}`,);
}

build().catch((err,) => {
  console.error('❌ Build failed:', err,);
  process.exit(1,);
},);
