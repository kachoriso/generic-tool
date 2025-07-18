#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting build process...');

// 依存関係が正しくインストールされているか確認
console.log('📦 Checking dependencies...');
try {
  execSync('npm ci --include=dev', { stdio: 'inherit' });
  console.log('✅ Dependencies verified/installed');
} catch (error) {
  console.log('⚠️  npm ci failed, trying npm install...');
  execSync('npm install', { stdio: 'inherit' });
}

console.log('📦 Running Vite build...');
try {
  execSync('npx vite build', { stdio: 'inherit' });
  console.log('✅ Vite build completed');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// dist フォルダの確認
if (fs.existsSync('dist')) {
  console.log('✅ Build artifacts created successfully');
  
  // dist フォルダの内容を表示
  const files = fs.readdirSync('dist');
  console.log('📁 Generated files:', files);
} else {
  console.error('❌ dist folder not found');
  process.exit(1);
} 