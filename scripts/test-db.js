#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
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

async function testAndSeed() {
  log('🧪 Testing database connection and seeding data...', colors.cyan);
  
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
    // Test connection to courses table
    logInfo('Testing courses table...');
    const { data: coursesData, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .limit(1);
    
    if (coursesError) {
      logError(`Courses table error: ${coursesError.message}`);
      logWarning('Please run the SQL schema in your Supabase dashboard first!');
      logInfo('Go to: https://supabase.com/dashboard/project/[your-project]/sql');
      logInfo('Then run the contents of database/schema.sql');
      process.exit(1);
    }
    
    // Test connection to chat_messages table
    logInfo('Testing chat_messages table...');
    const { data: messagesData, error: messagesError } = await supabase
      .from('chat_messages')
      .select('*')
      .limit(1);
    
    if (messagesError) {
      logError(`Chat messages table error: ${messagesError.message}`);
      logWarning('Please run the SQL schema in your Supabase dashboard first!');
      process.exit(1);
    }
    
    logSuccess('Database connection successful!');
    logInfo(`Found ${coursesData.length} courses and ${messagesData.length} messages`);
    
    // Check if we should seed data
    const shouldSeed = process.argv.includes('--seed') || process.argv.includes('-s');
    const shouldReset = process.argv.includes('--reset') || process.argv.includes('-r');
    
    if (shouldReset) {
      logWarning('Clearing existing data...');
      await clearData(supabase);
      await seedData(supabase);
    } else if (shouldSeed && coursesData.length === 0) {
      logInfo('No courses found, seeding sample data...');
      await seedData(supabase);
    } else if (shouldSeed) {
      logInfo('Data already exists. Use --reset to clear and reseed.');
    }
    
    logSuccess('Database test complete!');
    
  } catch (error) {
    logError(`Database test failed: ${error.message}`);
    process.exit(1);
  }
}

async function clearData(supabase) {
  // Clear messages first (due to foreign key constraint)
  const { error: messagesError } = await supabase
    .from('chat_messages')
    .delete()
    .neq('id', 0);
  
  if (messagesError) {
    logWarning(`Failed to clear messages: ${messagesError.message}`);
  } else {
    logSuccess('Cleared existing messages');
  }
  
  // Clear courses
  const { error: coursesError } = await supabase
    .from('courses')
    .delete()
    .neq('id', 0);
  
  if (coursesError) {
    logWarning(`Failed to clear courses: ${coursesError.message}`);
  } else {
    logSuccess('Cleared existing courses');
  }
}

async function seedData(supabase) {
  logInfo('Seeding sample data...');
  
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

// Show help
function showHelp() {
  log('🧪 CourseBot Database Test & Seed Script', colors.cyan);
  console.log();
  log('Usage:', colors.yellow);
  console.log('  npm run db:test           # Test database connection');
  console.log('  npm run db:test --seed    # Test and seed sample data');
  console.log('  npm run db:test --reset   # Test, clear, and reseed data');
  console.log();
  log('Options:', colors.yellow);
  console.log('  --seed, -s     Seed sample data if tables are empty');
  console.log('  --reset, -r    Clear all data and reseed');
  console.log('  --help, -h     Show this help message');
  console.log();
  log('Prerequisites:', colors.yellow);
  console.log('  1. Tables must exist in your Supabase database');
  console.log('  2. Run database/schema.sql in your Supabase dashboard first');
  console.log('  3. Make sure your .env file contains valid Supabase credentials');
}

// Main execution
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp();
} else {
  testAndSeed();
}
