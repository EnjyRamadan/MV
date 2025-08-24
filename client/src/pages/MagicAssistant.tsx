import React, { useState, useEffect } from "react";
import { Send, Bot, User, MessageSquare, BarChart3, Search, Heart, Upload, CreditCard } from "lucide-react";

const MagicAssistant = () => {
  const [typingDots, setTypingDots] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTypingDots(prev => (prev + 1) % 4);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Narrower */}
      <div className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-3 p-2 bg-gray-700 rounded-lg text-sm">
            <MessageSquare className="w-4 h-4" />
            <span>Magic Assistant Demo</span>
          </div>
          <div className="flex items-center gap-3 p-2 text-gray-400 hover:bg-gray-700 rounded-lg text-sm cursor-pointer">
            <MessageSquare className="w-4 h-4" />
            <span>Previous chat example</span>
          </div>
          <div className="flex items-center gap-3 p-2 text-gray-400 hover:bg-gray-700 rounded-lg text-sm cursor-pointer">
            <MessageSquare className="w-4 h-4" />
            <span>Another conversation</span>
          </div>
        </div>
        
        <div className="flex-1"></div>
        
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-3 h-3 text-white" />
            </div>
            <span>User Account</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="max-w-4xl mx-auto px-6 py-8">
            
            {/* Assistant Message */}
            <div className="flex gap-4 mb-8">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 pt-2">
                <div className="bg-gray-50 rounded-2xl rounded-tl-md p-4 max-w-3xl">
                  <p className="text-gray-800 leading-relaxed">
                    Hello! I'm Magic Assistant — your AI-powered helper. I specialize in helping you discover and connect with the best candidates for your job openings, making hiring faster, easier, and more effective.
                  </p>
                </div>
              </div>
            </div>

            {/* User Message */}
            <div className="flex gap-4 mb-8">
              <div className="flex-shrink-0 w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 pt-2">
                <div className="bg-blue-50 rounded-2xl rounded-tl-md p-4 max-w-3xl">
                  <p className="text-gray-800 leading-relaxed">
                    This looks great! When will you be fully available for conversations?
                  </p>
                </div>
              </div>
            </div>

            {/* Typing Indicator */}
            <div className="flex gap-4 mb-8">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 pt-2">
                <div className="bg-gray-50 rounded-2xl rounded-tl-md p-4 w-20">
                  <div className="flex gap-1">
                    <div className={`w-2 h-2 bg-gray-400 rounded-full ${typingDots >= 1 ? 'animate-bounce' : 'opacity-40'}`}></div>
                    <div className={`w-2 h-2 bg-gray-400 rounded-full ${typingDots >= 2 ? 'animate-bounce' : 'opacity-40'} delay-100`}></div>
                    <div className={`w-2 h-2 bg-gray-400 rounded-full ${typingDots >= 3 ? 'animate-bounce' : 'opacity-40'} delay-200`}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Coming Soon Card */}
            <div className="flex justify-center mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center max-w-md">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-blue-900 text-lg mb-3">Coming Soon</h3>
                <p className="text-blue-700 text-sm leading-relaxed">
                  Magic Assistant is currently in development. We're working hard to bring you an amazing AI chat experience.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Message Magic Assistant..."
                disabled
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
              />
              <button
                disabled
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MagicAssistant;