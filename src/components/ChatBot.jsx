import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader, Sparkles } from 'lucide-react';
import database from '../utils/database';
import aiAgent from '../utils/aiAgent';

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [aiProvider, setAiProvider] = useState('Loading...');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadMessages();
    loadCourses();
    checkAiProviders();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const messagesData = await database.getAllMessages();
      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadCourses = async () => {
    try {
      const coursesData = await database.getAllCourses();
      setCourses(coursesData);
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const checkAiProviders = () => {
    const providers = aiAgent.getAvailableProviders();
    if (providers.length > 0) {
      setAiProvider(providers[0]);
    } else {
      setAiProvider('Fallback');
    }
  };

  const updateProviderStatus = () => {
    const currentProvider = aiAgent.getCurrentProvider();
    setAiProvider(currentProvider === 'fallback' ? 'Fallback' : currentProvider || 'Loading...');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const simulateBotResponse = async (userMessage) => {
    setIsTyping(true);
    
    try {
      // Use AI agent to generate response
      const botResponse = await aiAgent.generateResponse(userMessage, {
        courses,
        selectedCourse
      });
      
      // Update provider status
      updateProviderStatus();
      
      setIsTyping(false);
      
      // Add bot response to database
      await database.addMessage(botResponse, 'bot');
      loadMessages();
      
    } catch (error) {
      console.error('Error generating AI response:', error);
      setIsTyping(false);
      
      // Fallback response
      const fallbackResponse = "I'm having trouble connecting to my AI brain right now. Please try again in a moment, or ask me about our available courses!";
      await database.addMessage(fallbackResponse, 'bot');
      loadMessages();
      
      setAiProvider('Fallback');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message to database
    await database.addMessage(inputMessage, 'user');
    setInputMessage('');
    loadMessages();

    // Generate bot response
    await simulateBotResponse(inputMessage);
  };

  const formatMessage = (message) => {
    return message.split('\n').map((line, index) => (
      <div key={index}>{line}</div>
    ));
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Kōchime AI Guide</h2>
          </div>
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Sparkles className="h-3 w-3" />
            <span>{aiProvider}</span>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-1">Ask me anything about courses and learning!</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                {message.sender === 'user' ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
                <span className="text-xs font-medium">
                  {message.sender === 'user' ? 'You' : 'Kōchime AI'}
                </span>
              </div>
              <div className="text-sm">{formatMessage(message.message)}</div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-200 text-gray-900">
              <div className="flex items-center space-x-2 mb-1">
                <Bot className="h-4 w-4" />
                <span className="text-xs font-medium">Kōchime AI</span>
              </div>
              <div className="flex items-center space-x-1">
                <Loader className="h-4 w-4 animate-spin" />
                <span className="text-sm">Typing...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask me about courses, learning paths, or anything else..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={isTyping || !inputMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBot;
