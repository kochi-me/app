#!/usr/bin/env node

import { spawn } from 'child_process';
import { existsSync } from 'fs';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function log(message, color = colors.white) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { stdio: 'inherit' });
    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

async function deployToGitHubPages() {
  log('🚀 Deploying to GitHub Pages...', colors.cyan);
  
  try {
    // Check if gh-pages is installed
    logInfo('Checking for gh-pages package...');
    if (!existsSync('node_modules/gh-pages')) {
      logInfo('Installing gh-pages...');
      await runCommand('npm', ['install', '--save-dev', 'gh-pages']);
    }
    
    // Build the app
    logInfo('Building the app...');
    await runCommand('npm', ['run', 'build']);
    
    // Deploy to gh-pages
    logInfo('Deploying to GitHub Pages...');
    await runCommand('npx', ['gh-pages', '-d', 'dist']);
    
    logSuccess('Deployment complete!');
    logInfo('Your app will be available at: https://[username].github.io/[repository-name]');
    
  } catch (error) {
    logError(`Deployment failed: ${error.message}`);
    process.exit(1);
  }
}

deployToGitHubPages();
