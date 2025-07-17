#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync } from 'fs';

console.log('🚀 Starting build process...');

try {
  // Viteビルドを実行（フロントエンド）
  console.log('📦 Running Vite build...');
  execSync('npx vite build', { stdio: 'inherit' });
  
  // バックエンドは本番でもTSXで実行するため、ビルド不要
  console.log('✅ Backend will run with tsx in production');
  
  // distフォルダの確認
  if (existsSync('dist')) {
    console.log('✅ Build successful! dist folder created.');
    execSync('ls -la dist/', { stdio: 'inherit' });
  } else {
    console.error('❌ Build failed: dist folder not found');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} 