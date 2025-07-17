import React from 'react';
import { AlertCircle, Database, ExternalLink } from 'lucide-react';

const DatabaseConnectionError = ({ error }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
          <AlertCircle className="h-6 w-6 text-red-600" />
        </div>
        
        <h1 className="text-xl font-bold text-gray-900 text-center mb-2">
          Database Connection Required
        </h1>
        
        <p className="text-gray-600 text-center mb-6">
          CourseBot requires a Supabase database connection to function. Please configure your database settings.
        </p>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-red-800 mb-2">Error Details:</h3>
          <p className="text-sm text-red-700">{error?.message || 'Database connection failed'}</p>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 flex items-center">
            <Database className="h-4 w-4 mr-2" />
            Setup Instructions:
          </h3>
          
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>Create a Supabase project at <a href="https://supabase.com" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">supabase.com</a></li>
            <li>Copy your project URL and anon key</li>
            <li>Create a <code className="bg-gray-100 px-1 rounded">.env</code> file with your credentials</li>
            <li>Run the database schema from <code className="bg-gray-100 px-1 rounded">database/schema.sql</code></li>
            <li>Restart your development server</li>
          </ol>
          
          <div className="flex items-center justify-center pt-4">
            <a
              href="https://github.com/your-repo/blob/main/SUPABASE_SETUP.md"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Setup Guide
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseConnectionError;
