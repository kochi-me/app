import React, { useState, useEffect } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import Navbar from './components/Navbar';
import CourseList from './components/CourseList';
import ChatBot from './components/ChatBot';
import DatabaseConnectionError from './components/DatabaseConnectionError';
import database from './utils/database';
import './App.css';

function App() {
  const [connectionError, setConnectionError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkDatabaseConnection();
  }, []);

  const checkDatabaseConnection = async () => {
    try {
      const result = await database.testConnection();
      if (!result.success) {
        setConnectionError(result.error);
      }
    } catch (error) {
      setConnectionError(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to database...</p>
        </div>
      </div>
    );
  }

  if (connectionError) {
    return <DatabaseConnectionError error={connectionError} />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={40} minSize={25}>
            <div className="h-full bg-white border-r border-gray-200">
              <CourseList />
            </div>
          </Panel>
          
          <PanelResizeHandle className="w-2 bg-gray-200 hover:bg-gray-300 transition-colors cursor-col-resize" />
          
          <Panel defaultSize={60} minSize={35}>
            <div className="h-full bg-white">
              <ChatBot />
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

export default App;
