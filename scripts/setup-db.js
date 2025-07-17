#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
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
  magenta: '\x1b[35m',
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

async function setupDatabase() {
  log('🚀 Setting up Supabase database...', colors.cyan);
  
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
    // Test connection
    logInfo('Testing connection to Supabase...');
    const { data, error } = await supabase.from('courses').select('count', { count: 'exact' });
    
    if (error && error.code === 'PGRST116') {
      logWarning('Tables do not exist. Creating database schema...');
      await createTables(supabase);
    } else if (error) {
      throw error;
    } else {
      logSuccess('Connection successful!');
      logInfo(`Found ${data.length} courses in database`);
      
      // Ask if user wants to reset
      const shouldReset = process.argv.includes('--reset') || process.argv.includes('-r');
      if (shouldReset) {
        logWarning('Resetting database...');
        await resetDatabase(supabase);
      }
    }
    
    logSuccess('Database setup complete!');
    
  } catch (error) {
    logError(`Database setup failed: ${error.message}`);
    process.exit(1);
  }
}

async function createTables(supabase) {
  try {
    // Read schema file
    const schemaPath = join(__dirname, '../database/schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    logInfo(`Executing ${statements.length} SQL statements...`);
    
    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          // Try alternative method for some statements
          const { error: altError } = await supabase.from('courses').select('*').limit(1);
          if (altError && altError.code === 'PGRST116') {
            logWarning('Using alternative table creation method...');
            await createTablesManually(supabase);
            return;
          }
        }
      }
    }
    
    logSuccess('Database schema created successfully!');
    
  } catch (error) {
    logWarning('Schema file method failed, creating tables manually...');
    await createTablesManually(supabase);
  }
}

async function createTablesManually(supabase) {
  logInfo('Creating tables manually...');
  
  // Create courses table
  const { error: coursesError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS courses (
        id BIGSERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        instructor TEXT,
        duration TEXT,
        level TEXT CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );
    `
  });
  
  if (coursesError) {
    logError(`Failed to create courses table: ${coursesError.message}`);
    return;
  }
  
  // Create chat_messages table
  const { error: messagesError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS chat_messages (
        id BIGSERIAL PRIMARY KEY,
        message TEXT NOT NULL,
        sender TEXT NOT NULL CHECK (sender IN ('user', 'bot')),
        course_id BIGINT REFERENCES courses(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );
    `
  });
  
  if (messagesError) {
    logError(`Failed to create chat_messages table: ${messagesError.message}`);
    return;
  }
  
  // Insert sample data
  await insertSampleData(supabase);
  
  logSuccess('Tables created manually!');
}

async function insertSampleData(supabase) {
  logInfo('Inserting sample data...');
  
  // Insert sample courses
  const { error: coursesError } = await supabase.from('courses').insert([
    {
      title: 'Introduction to React',
      description: 'Learn the basics of React framework',
      instructor: 'John Doe',
      duration: '4 weeks',
      level: 'Beginner'
    },
    {
      title: 'Advanced JavaScript',
      description: 'Deep dive into JavaScript concepts',
      instructor: 'Jane Smith',
      duration: '6 weeks',
      level: 'Advanced'
    },
    {
      title: 'Node.js Backend Development',
      description: 'Build scalable backend applications',
      instructor: 'Mike Johnson',
      duration: '8 weeks',
      level: 'Intermediate'
    },
    {
      title: 'Database Design Principles',
      description: 'Learn to design efficient databases',
      instructor: 'Sarah Wilson',
      duration: '5 weeks',
      level: 'Intermediate'
    },
    {
      title: 'UI/UX Design Fundamentals',
      description: 'Master user interface and experience design',
      instructor: 'Alex Chen',
      duration: '7 weeks',
      level: 'Beginner'
    }
  ]);
  
  if (coursesError) {
    logWarning(`Sample courses insertion failed: ${coursesError.message}`);
  } else {
    logSuccess('Sample courses inserted!');
  }
  
  // Insert sample messages
  const { error: messagesError } = await supabase.from('chat_messages').insert([
    {
      message: 'Hello! Welcome to the course management system. How can I help you today?',
      sender: 'bot',
      course_id: null
    },
    {
      message: 'I can help you find courses, answer questions about course content, or provide learning guidance.',
      sender: 'bot',
      course_id: null
    }
  ]);
  
  if (messagesError) {
    logWarning(`Sample messages insertion failed: ${messagesError.message}`);
  } else {
    logSuccess('Sample messages inserted!');
  }
}

async function resetDatabase(supabase) {
  logInfo('Clearing existing data...');
  
  // Clear messages first (due to foreign key constraint)
  const { error: messagesError } = await supabase.from('chat_messages').delete().neq('id', 0);
  if (messagesError) {
    logWarning(`Failed to clear messages: ${messagesError.message}`);
  }
  
  // Clear courses
  const { error: coursesError } = await supabase.from('courses').delete().neq('id', 0);
  if (coursesError) {
    logWarning(`Failed to clear courses: ${coursesError.message}`);
  }
  
  // Re-insert sample data
  await insertSampleData(supabase);
  
  logSuccess('Database reset complete!');
}

// Show help
function showHelp() {
  log('🎯 CourseBot Database Setup Script', colors.cyan);
  console.log();
  log('Usage:', colors.yellow);
  console.log('  npm run setup-db          # Set up database');
  console.log('  npm run setup-db --reset  # Reset database with fresh data');
  console.log();
  log('Options:', colors.yellow);
  console.log('  --reset, -r    Reset database and insert fresh sample data');
  console.log('  --help, -h     Show this help message');
  console.log();
  log('Environment:', colors.yellow);
  console.log('  Make sure your .env file contains:');
  console.log('  VITE_SUPABASE_URL=https://your-project-id.supabase.co');
  console.log('  VITE_SUPABASE_ANON_KEY=your-anon-key-here');
}

// Main execution
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp();
} else {
  setupDatabase();
}
