import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader } from 'lucide-react';
import database from '../utils/database';

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadMessages();
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const simulateBotResponse = async (userMessage) => {
    setIsTyping(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let botResponse = '';
    
    // Simple response logic based on keywords
    const message = userMessage.toLowerCase();
    
    if (message.includes('course') || message.includes('learn')) {
      const courses = await database.getAllCourses();
      if (courses.length > 0) {
        botResponse = `I can help you with courses! We have ${courses.length} courses available. Some popular ones include: ${courses.slice(0, 2).map(c => c.title).join(', ')}. Would you like to know more about any specific course?`;
      } else {
        botResponse = "I'd be happy to help you find courses! It looks like there are no courses available right now. You can add some using the course panel.";
      }
    } else if (message.includes('help') || message.includes('what can you do')) {
      botResponse = "I can help you with:\n• Finding and recommending courses\n• Answering questions about course content\n• Providing learning guidance\n• Managing your learning schedule\n\nWhat would you like to know more about?";
    } else if (message.includes('instructor') || message.includes('teacher')) {
      botResponse = "Our instructors are experienced professionals in their fields. Each course page shows detailed information about the instructor, including their background and expertise.";
    } else if (message.includes('duration') || message.includes('time')) {
      botResponse = "Course durations vary depending on the complexity and depth of the subject. Most courses range from 4-8 weeks. You can find the specific duration for each course in the course details.";
    } else if (message.includes('level') || message.includes('difficulty')) {
      botResponse = "We offer courses for all skill levels:\n• Beginner: Perfect for those new to the subject\n• Intermediate: For those with some basic knowledge\n• Advanced: For experienced learners looking to deepen their expertise";
    } else if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      botResponse = "Hello! Welcome to CourseBot. I'm here to help you find the perfect courses and answer any questions you might have. How can I assist you today?";
    } else if (message.includes('thank') || message.includes('thanks')) {
      botResponse = "You're welcome! I'm here whenever you need help with courses or learning. Feel free to ask me anything else!";
    } else {
      botResponse = "I understand you're asking about: \"" + userMessage + "\". While I'm still learning, I can help you find courses, provide information about our offerings, or answer questions about learning. Could you please rephrase your question or ask me about courses, instructors, or learning paths?";
    }
    
    setIsTyping(false);
    
    // Add bot response to database
    await database.addMessage(botResponse, 'bot');
    loadMessages();
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
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">AI Course Assistant</h2>
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
                  {message.sender === 'user' ? 'You' : 'CourseBot'}
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
                <span className="text-xs font-medium">CourseBot</span>
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
