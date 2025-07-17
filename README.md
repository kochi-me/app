# CourseBot - React App with Tailwind CSS

A two-panel React application with course management and AI chatbot functionality.

## Features

- 📚 **Course Management**: Add, view, and manage courses
- 🤖 **AI Chatbot**: Interactive assistant for course-related queries
- 📱 **Responsive Design**: Built with Tailwind CSS for modern UI
- 🔄 **Resizable Panels**: Adjustable layout for better user experience
- 💾 **Easy Migration**: Simple in-memory database that can be migrated to Supabase

## Getting Started

### Prerequisites
- Node.js (version 20 or higher recommended)
- npm or yarn

### Installation and Running

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   # Create a .env file with your Supabase credentials
   cp .env.example .env
   # Edit .env with your actual Supabase URL and anon key
   ```

3. **Quick start with database setup:**
   ```bash
   # Test database connection and start development server
   npm start
   ```

4. **Or set up database manually:**
   ```bash
   # Show complete setup guide
   npm run setup
   
   # Option 1: Automated setup (recommended)
   npm run setup-db
   
   # Option 2: Manual setup
   # Copy database/schema.sql to Supabase SQL Editor and run it
   
   # Then test the connection
   npm run db:test
   
   # Start development server
   npm run dev
   ```

## Available Scripts

- `npm start` - Quick start with connection check and dev server
- `npm run setup` - Show complete setup guide with SQL schema
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run setup-db` - Automated database setup
- `npm run db:test` - Test database connection
- `npm run db:seed` - Seed sample data if tables are empty
- `npm run db:reset` - Clear and reseed database with fresh data

## Project Structure

```
src/
├── components/
│   ├── Navbar.jsx          # Top navigation bar
│   ├── CourseList.jsx      # Left panel - course management
│   └── ChatBot.jsx         # Right panel - AI assistant
├── utils/
│   └── database.js         # In-memory database manager
├── App.jsx                 # Main application component
├── App.css                 # Application styles
├── index.css               # Global styles with Tailwind
└── main.jsx               # Application entry point
```

## Features Overview

### Course Management
- View all available courses
- Add new courses with details (title, description, instructor, duration, level)
- Select courses to view detailed information
- Filter courses by level (Beginner, Intermediate, Advanced)

### AI Chatbot
- Interactive chat interface
- Course recommendations based on user queries
- Context-aware responses about:
  - Course information
  - Instructor details
  - Learning guidance
  - Schedule assistance

### Resizable Panels
- Drag the divider between panels to resize
- Minimum sizes enforced for usability
- Responsive design for different screen sizes

## Database Setup

### Supabase Configuration Required

This application requires Supabase to be configured. Follow these steps:

1. **Follow the detailed setup guide**: See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for complete instructions

2. **Quick setup:**
   ```bash
   # Create a Supabase project at https://supabase.com
   # Copy your credentials to .env file
   cp .env.example .env
   # Edit .env with your Supabase URL and anon key
   
   # Run the database schema
   # Copy contents of database/schema.sql to Supabase SQL Editor
   ```

3. **Environment variables:**
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### Connection Status
The app shows connection status in the navbar:
- 🟢 **Supabase Connected**: Successfully connected to Supabase
- � **Connection Failed**: Check your configuration and try again

⚠️ **Important**: The app will not work without a properly configured Supabase connection.

## Database Migration

The application uses an in-memory database for development. To migrate to Supabase:

1. Install Supabase client:
   ```bash
   npm install @supabase/supabase-js
   ```

2. Replace the `database.js` implementation with Supabase calls
3. Update the `migrateToSupabase()` method in `DatabaseManager`

## Technologies Used

- **React 19**: Frontend framework
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Build tool and dev server
- **Lucide React**: Icon library
- **React Resizable Panels**: For resizable layout
- **ESLint**: Code linting

## Troubleshooting

### Common Issues

#### `TypeError: crypto.hash is not a function` or Engine Warnings
This error occurs because Node.js v19.1.0 is not well supported by current packages. Here are the solutions:

1. **Recommended: Upgrade to Node.js v20 LTS (Most Stable)**
   ```bash
   # Using nvm (Node Version Manager)
   nvm install 20
   nvm use 20
   npm install
   ```

2. **Alternative: Use Node.js v18 LTS**
   ```bash
   # Using nvm
   nvm install 18
   nvm use 18
   npm install
   ```

3. **Temporary fix: Use the legacy OpenSSL provider**
   ```bash
   # Run with the flag directly
   node --legacy-openssl-provider node_modules/.bin/vite
   ```

4. **Or create a .nvmrc file for consistent Node.js version**
   ```bash
   echo "20" > .nvmrc
   nvm use
   ```

#### Other Common Issues
- **Port already in use**: Change the port in `vite.config.js` or use `npm run dev -- --port 3001`
- **Module resolution issues**: Delete `node_modules` and `package-lock.json`, then run `npm install`

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
