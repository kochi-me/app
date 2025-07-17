#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { spawn } from 'child_process';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

async function startDevelopment() {
  log('🚀 Starting CourseBot Development Environment...', colors.cyan);
  
  // Check environment variables
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    logError('Missing Supabase environment variables!');
    logInfo('Please create a .env file with:');
    console.log('VITE_SUPABASE_URL=https://your-project-id.supabase.co');
    console.log('VITE_SUPABASE_ANON_KEY=your-anon-key-here');
    process.exit(1);
  }
  
  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Test database connection
    logInfo('Testing database connection...');
    const { data, error } = await supabase.from('courses').select('*').limit(1);
    
    if (error) {
      if (error.code === 'PGRST116') {
        logError('Database tables do not exist!');
        logInfo('Please run the database setup first:');
        console.log('  npm run setup-db');
        console.log('  or manually run database/schema.sql in your Supabase dashboard');
        process.exit(1);
      } else {
        throw error;
      }
    }
    
    logSuccess('Database connection successful!');
    
    // Check if we have sample data
    if (data.length === 0) {
      logWarning('No courses found. Would you like to seed sample data?');
      logInfo('Run: npm run db:seed');
    } else {
      logInfo(`Found ${data.length} courses in database`);
    }
    
    // Start dev server
    log('Starting development server...', colors.cyan);
    const devServer = spawn('npm', ['run', 'dev'], { stdio: 'inherit' });
    
    devServer.on('close', (code) => {
      if (code !== 0) {
        logError(`Dev server exited with code ${code}`);
      }
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      log('Shutting down...', colors.yellow);
      devServer.kill('SIGINT');
      process.exit(0);
    });
    
  } catch (error) {
    logError(`Failed to start development environment: ${error.message}`);
    process.exit(1);
  }
}

startDevelopment();
