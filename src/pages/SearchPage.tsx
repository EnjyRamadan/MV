import React, { useState } from 'react';
import { useContacts, SearchFilters } from '../contexts/ContactContext';
import SearchFiltersComponent from '../components/SearchFilters';
import ContactCard from '../components/ContactCard';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';

const SearchPage: React.FC = () => {
  const { searchResults, searchContacts, resetSearch } = useContacts();
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (filters: SearchFilters) => {
    const searchFilters = {
      ...filters,
      query: searchQuery || filters.query,
    };
    searchContacts(searchFilters);
  };

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch({ query: searchQuery });
  };

  const handleReset = () => {
    setSearchQuery('');
    resetSearch();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Search Professionals
        </h1>
        <p className="text-gray-600">
          Find the right contacts with our advanced search filters
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
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, job title, company, or skills..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700">Filters</span>
          </button>
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
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
              Search Results
            </h2>
            {searchResults.length > 0 && (
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Filter className="w-4 h-4" />
                <span>{searchResults.length} results found</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((contact) => (
                <ContactCard key={contact.id} contact={contact} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No results found
              </h3>
              <p className="text-gray-500 mb-6">
                Try adjusting your search criteria or filters
              </p>
              <button
                onClick={() => setShowFilters(true)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Use Advanced Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;