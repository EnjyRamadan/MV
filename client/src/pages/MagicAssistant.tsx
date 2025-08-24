import React, { useState } from "react";
import { Search, Filter, X } from "lucide-react";

const MagicAssistantSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const handleGenerateFilters = () => {
    setShowPopup(true);
  };

  const handleSearchWithAI = () => {
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Magic Assistant
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Describe your ideal prospect in plain English, and let our AI do the heavy lifting.
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="relative">
            <textarea
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g., 'CTOs in SaaS companies in Berlin with over 100 employees and using AWS'"
              className="w-full min-h-[120px] p-6 text-gray-700 placeholder-gray-400 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base leading-relaxed"
              style={{ fontSize: '16px' }}
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleGenerateFilters}
              className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Generate Filters
            </button>
            <button
              onClick={handleSearchWithAI}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search with AI
            </button>
          </div>
        </div>

        {/* Optional: Add some visual interest with subtle features */}
        <div className="text-center text-gray-500 text-sm">
          <p>Powered by advanced AI to find your perfect prospects</p>
        </div>
      </div>

      {/* Coming Soon Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-8 max-w-sm w-full mx-auto relative">
            <button
              onClick={closePopup}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Coming Soon!
              </h3>
              <p className="text-gray-600 text-sm">
                We're working hard to bring you this amazing feature. Stay tuned!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MagicAssistantSearch;