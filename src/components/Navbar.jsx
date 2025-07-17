import React from 'react';
import { BookOpen, MessageSquare, Settings, User } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-8 w-8 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">CourseBot</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-700">AI Assistant</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-gray-500 cursor-pointer hover:text-gray-700" />
            <User className="h-5 w-5 text-gray-500 cursor-pointer hover:text-gray-700" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
