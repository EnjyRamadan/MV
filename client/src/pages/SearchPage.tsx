import React, { useState, useEffect } from 'react';
import { useContacts, SearchFilters } from '../contexts/ContactContext';
import SearchFiltersComponent from '../components/SearchFilters';
import ContactCard from '../components/ContactCard';
import { Search, Filter, SlidersHorizontal, Loader } from 'lucide-react';

const SearchPage: React.FC = () => {
  const { contacts, searchResults, searchContacts, resetSearch, loading, error } = useContacts();
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Debug logs
  useEffect(() => {
    console.log('🔍 SearchPage - contacts:', contacts.length);
    console.log('📊 SearchPage - searchResults:', searchResults.length);
    console.log('⏳ SearchPage - loading:', loading);
    console.log('❌ SearchPage - error:', error);
  }, [contacts, searchResults, loading, error]);

  const handleSearch = (filters: SearchFilters) => {
    console.log('🚀 SearchPage - handleSearch called with:', filters);
    console.log('📝 SearchPage - current searchQuery:', searchQuery);
    
    const searchFilters = {
      ...filters,
      query: searchQuery || filters.query,
    };
    
    console.log('🔎 SearchPage - final search filters:', searchFilters);
    searchContacts(searchFilters);
    setHasSearched(true);
  };

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('⚡ SearchPage - quick search with query:', searchQuery);
    handleSearch({ query: searchQuery });
  };

  const handleReset = () => {
    console.log('🔄 SearchPage - reset called');
    setSearchQuery('');
    setHasSearched(false);
    resetSearch();
  };

  const displayContacts = hasSearched ? searchResults : [];
  const showAllContacts = () => {
    console.log('👀 SearchPage - show all contacts');
    setHasSearched(true);
    searchContacts({});
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading contacts...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-medium mb-2">Error Loading Contacts</h3>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Search Professionals
        </h1>
        <p className="text-gray-600">
          Find the right contacts with our advanced search filters ({contacts.length} contacts available)
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <form onSubmit={handleQuickSearch} className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                console.log('📝 Search query changed:', e.target.value);
                setSearchQuery(e.target.value);
              }}
              placeholder="Search by name, job title, company, or skills..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              console.log('🔧 Toggle filters:', !showFilters);
              setShowFilters(!showFilters);
            }}
            className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700">Filters</span>
          </button>
          <button
            type="submit"
            className="bg-gradient-to-r from-[#0b07f0] to-[#0b07f0] text-white px-6 py-3 rounded-lg font-medium hover:from-[#0b07f0] hover:to-[#0b07f0] transition-all"
          >
            Search
          </button>
        </form>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <SearchFiltersComponent onSearch={handleSearch} onReset={handleReset} />
        </div>
      )}

      {/* Results */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {hasSearched ? 'Search Results' : 'All Contacts'}
            </h2>
            <div className="flex items-center space-x-4">
              {!hasSearched && (
                <button
                  onClick={showAllContacts}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Show All Contacts
                </button>
              )}
              {displayContacts.length > 0 && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Filter className="w-4 h-4" />
                  <span>{displayContacts.length} results found</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {displayContacts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayContacts.map((contact) => (
                <ContactCard key={contact.id} contact={contact} />
              ))}
            </div>
          ) : hasSearched ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No results found
              </h3>
              <p className="text-gray-500 mb-6">
                Try adjusting your search criteria or filters
              </p>
              <div className="space-x-4">
                <button
                  onClick={() => setShowFilters(true)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Use Advanced Filters
                </button>
                <button
                  onClick={handleReset}
                  className="text-gray-600 hover:text-gray-700 font-medium"
                >
                  Clear Search
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ready to search
              </h3>
              <p className="text-gray-500 mb-6">
                Enter a search term or use filters to find contacts
              </p>
              <button
                onClick={showAllContacts}
                className="bg-gradient-to-r from-[#0b07f0] to-[#0b07f0] text-white px-6 py-2 rounded-lg font-medium hover:from-[#0b07f0] hover:to-[#0b07f0] shadow-md hover:shadow-lg transition-all"
              >
                Show All Contacts ({contacts.length})
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;