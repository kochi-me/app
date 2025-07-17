#!/usr/bin/env node

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

function showSetupInstructions() {
  log('🎯 CourseBot Complete Setup Guide', colors.cyan);
  console.log();
  
  // Check environment variables
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project-id') || supabaseKey.includes('your-anon-key')) {
    logError('Step 1: Configure Supabase credentials');
    console.log('  1. Go to https://supabase.com and create a new project');
    console.log('  2. Copy .env.example to .env: cp .env.example .env');
    console.log('  3. Edit .env with your actual Supabase credentials');
    console.log('  4. Get your credentials from: https://supabase.com/dashboard/project/[your-project]/settings/api');
    console.log();
  } else {
    logSuccess('Step 1: Supabase credentials configured');
  }
  
  logWarning('Step 2: Create database tables');
  console.log('  1. Go to your Supabase dashboard');
  console.log('  2. Navigate to: https://supabase.com/dashboard/project/[your-project]/sql');
  console.log('  3. Copy and run the following SQL schema:');
  console.log();
  
  // Show the SQL schema
  try {
    const schemaPath = join(__dirname, '../database/schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');
    console.log('```sql');
    console.log(schema);
    console.log('```');
  } catch (error) {
    logError('Could not read schema file. Please check database/schema.sql');
  }
  
  console.log();
  logInfo('Step 3: Test and start the application');
  console.log('  npm run db:test    # Test database connection');
  console.log('  npm run db:seed    # Add sample data');
  console.log('  npm start          # Start development server');
  console.log();
  
  log('🔧 Alternative commands:', colors.yellow);
  console.log('  npm run setup-db   # Automated setup (may require RPC functions)');
  console.log('  npm run db:reset   # Clear and reseed data');
  console.log('  npm run dev        # Just start dev server');
  console.log();
  
  log('📚 For detailed setup instructions, see:', colors.blue);
  console.log('  README.md - Quick start guide');
  console.log('  SUPABASE_SETUP.md - Detailed Supabase setup');
}

showSetupInstructions();
