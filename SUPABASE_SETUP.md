# Supabase Setup Guide

This guide will help you set up Supabase for your CourseBot application. **Supabase configuration is required for the app to function.**

## Step 1: Create a Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization (or create one)
4. Fill in project details:
   - **Name**: CourseBot (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Choose the region closest to your users
5. Click "Create new project"

## Step 2: Get Your Project Credentials

1. After project creation, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (something like: `https://your-project-id.supabase.co`)
   - **anon public** key (from the API Keys section)

## Step 3: Configure Environment Variables

1. Open your `.env` file in the project root
2. Replace the placeholder values with your actual credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 4: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `database/schema.sql` from this project
3. Paste it into the SQL editor and click "Run"

This will create:
- `courses` table with sample data
- `chat_messages` table with initial bot messages
- Proper indexes for performance
- Row Level Security (RLS) policies

## Step 5: Test the Connection

1. Start your development server: `npm run dev`
2. Open the browser console and look for connection messages:
   - ✅ "Connected to Supabase database" = Success!
   - ❌ "Failed to connect to Supabase" = Check your configuration

**Note**: The app will not work without a valid Supabase connection.

## Step 6: Verify Database Operations

1. Try adding a new course through the UI
2. Send a message in the chat
3. Check your Supabase dashboard > **Table Editor** to see if data is being saved

## Troubleshooting

### Common Issues:

1. **"Missing Supabase environment variables"**
   - Check that your `.env` file is in the project root
   - Verify variable names start with `VITE_`
   - Restart your development server after changing `.env`

2. **"Failed to connect to Supabase"**
   - Verify your project URL and anon key are correct
   - Check that your Supabase project is active (not paused)
   - Ensure your network can reach supabase.co

3. **"Database connection error"**
   - Run the SQL schema from `database/schema.sql`
   - Check RLS policies are properly set up
   - Verify table names match the `TABLES` constant in `supabase.js`

### Development vs Production

**Important**: Supabase configuration is required for both development and production environments. The app does not have a fallback mode.

## Security Considerations

The current setup uses RLS policies that allow public access for demo purposes. For production:

1. Set up Supabase Auth for user authentication
2. Update RLS policies to restrict access based on user roles
3. Consider rate limiting for API calls
4. Use environment-specific projects (dev/staging/prod)

## Real-time Features

The database manager includes real-time subscription methods:
- `subscribeToCourses()` - Live updates when courses change
- `subscribeToMessages()` - Live chat updates

These are automatically available once Supabase is configured.

## Next Steps

1. Configure authentication with Supabase Auth
2. Add user management features
3. Implement file upload for course materials
4. Add advanced search and filtering
5. Set up automated backups

For more information, visit the [Supabase Documentation](https://supabase.com/docs).
