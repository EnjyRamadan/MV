import React, { useState, useEffect } from "react";
import { Send, Bot, User, Menu, Plus, MessageSquare } from "lucide-react";

const MagicAssistant = () => {
  const [typingDots, setTypingDots] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTypingDots(prev => (prev + 1) % 4);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-700">
          <button className="w-full flex items-center gap-3 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            <span className="font-medium">New chat</span>
          </button>
        </div>
        
        {/* Chat History */}
        <div className="flex-1 p-2 overflow-y-auto">
          <div className="space-y-1">
            <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
              <MessageSquare className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300 truncate">Magic Assistant Demo</span>
            </div>
            <div className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg cursor-pointer transition-colors">
              <MessageSquare className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400 truncate">Previous chat example</span>
            </div>
            <div className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg cursor-pointer transition-colors">
              <MessageSquare className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400 truncate">Another conversation</span>
            </div>
          </div>
        </div>
        
        {/* User Profile */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-gray-300">User Account</span>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <button className="lg:hidden">
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-900">Magic Assistant</h1>
                <p className="text-xs text-gray-500">AI Assistant</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto p-4 space-y-6">
            
            {/* Assistant Message */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="bg-gray-50 rounded-2xl rounded-tl-md p-4">
                  <p className="text-gray-800 leading-relaxed">
                    Hello! I’m Magic Assistant — your AI-powered helper. I specialize in helping you discover and connect with the best candidates for your job openings, making hiring faster, easier, and more effective.
                  </p>
                </div>
              </div>
            </div>

            {/* User Message */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="bg-blue-50 rounded-2xl rounded-tl-md p-4">
                  <p className="text-gray-800 leading-relaxed">
                    This looks great! When will you be fully available for conversations?
                  </p>
                </div>
              </div>
            </div>

            {/* Typing Indicator */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="bg-gray-50 rounded-2xl rounded-tl-md p-4 w-16">
                  <div className="flex gap-1">
                    <div className={`w-2 h-2 bg-gray-400 rounded-full ${typingDots >= 1 ? 'animate-bounce' : 'opacity-40'}`}></div>
                    <div className={`w-2 h-2 bg-gray-400 rounded-full ${typingDots >= 2 ? 'animate-bounce' : 'opacity-40'} delay-100`}></div>
                    <div className={`w-2 h-2 bg-gray-400 rounded-full ${typingDots >= 3 ? 'animate-bounce' : 'opacity-40'} delay-200`}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Coming Soon Notice */}
            <div className="flex justify-center py-8">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center max-w-md">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-blue-900 mb-2">Coming Soon</h3>
                <p className="text-blue-700 text-sm leading-relaxed">
                  Magic Assistant is currently in development. We're working hard to bring you an amazing AI chat experience.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  placeholder="Message Magic Assistant..."
                  disabled
                  rows={1}
                  className="w-full p-4 pr-12 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                />
                <button
                  disabled
                  className="absolute right-3 bottom-3 p-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex justify-center mt-2">
              <p className="text-xs text-gray-500">
                Magic Assistant can make mistakes. Consider checking important information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MagicAssistant;