import React, { useState } from 'react';
import { SearchFilters } from '../contexts/ContactContext';
import { X } from 'lucide-react';

interface SearchFiltersProps {
  onSearch: (filters: SearchFilters) => void;
  onReset: () => void;
}

const SearchFiltersComponent: React.FC<SearchFiltersProps> = ({
  onSearch,
  onReset,
}) => {
  const [filters, setFilters] = useState<SearchFilters>({});

  const industries = [
    'Technology',
    'Financial Services',
    'Healthcare',
    'Manufacturing',
    'Retail',
    'Education',
    'Government',
    'Non-profit',
    'Media',
    'Real Estate',
  ];

  const seniorityLevels = [
    'Entry-level',
    'Mid-level',
    'Senior',
    'Director',
    'VP',
    'C-Level',
  ];

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSkillsChange = (value: string) => {
    const skills = value
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s);
    handleFilterChange('skills', skills);
  };

  const handleExperienceChange = (type: 'min' | 'max', value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue)) {
      // If value is empty or invalid, remove the experience filter
      const newExp = { ...filters.experience };
      if (type === 'min') {
        delete newExp?.min;
      } else {
        delete newExp?.max;
      }
      
      // If both min and max are undefined, remove experience filter entirely
      if (!newExp?.min && !newExp?.max) {
        const newFilters = { ...filters };
        delete newFilters.experience;
        setFilters(newFilters);
      } else {
        handleFilterChange('experience', newExp);
      }
    } else {
      handleFilterChange('experience', {
        ...filters.experience,
        [type]: numValue,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleReset = () => {
    setFilters({});
    onReset();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Advanced Filters
        </h3>
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="w-4 h-4" />
          <span>Clear All</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Job Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Title
          </label>
          <input
            type="text"
            value={filters.jobTitle || ''}
            onChange={(e) => handleFilterChange('jobTitle', e.target.value)}
            placeholder="e.g. Software Engineer"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Company */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company
          </label>
          <input
            type="text"
            value={filters.company || ''}
            onChange={(e) => handleFilterChange('company', e.target.value)}
            placeholder="e.g. Google, Microsoft"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            value={filters.location || ''}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            placeholder="e.g. San Francisco, CA"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Industry */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Industry
          </label>
          <select
            value={filters.industry || ''}
            onChange={(e) => handleFilterChange('industry', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Industries</option>
            {industries.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
        </div>

        {/* Seniority Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seniority Level
          </label>
          <select
            value={filters.seniorityLevel || ''}
            onChange={(e) =>
              handleFilterChange('seniorityLevel', e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Levels</option>
            {seniorityLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        {/* Verification Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Verification Status
          </label>
          <select
            value={
              filters.verified === undefined 
                ? '' 
                : filters.verified 
                  ? 'true' 
                  : 'false'
            }
            onChange={(e) => {
              const val = e.target.value;
              handleFilterChange(
                'verified',
                val === '' ? undefined : val === 'true'
              );
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>
        </div>

        {/* Has Contact Info */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Has Contact Info
          </label>
          <select
            value={
              filters.hasContactInfo === undefined 
                ? '' 
                : filters.hasContactInfo 
                  ? 'true' 
                  : 'false'
            }
            onChange={(e) => {
              const val = e.target.value;
              handleFilterChange(
                'hasContactInfo',
                val === '' ? undefined : val === 'true'
              );
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        {/* Experience Range */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Years of Experience
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="number"
              placeholder="Min"
              value={filters.experience?.min || ''}
              onChange={(e) => handleExperienceChange('min', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-gray-500">to</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.experience?.max || ''}
              onChange={(e) => handleExperienceChange('max', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-gray-500 text-sm">years</span>
          </div>
        </div>

        {/* Skills */}
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Skills (comma-separated)
          </label>
          <input
            type="text"
            value={filters.skills?.join(', ') || ''}
            onChange={(e) => handleSkillsChange(e.target.value)}
            placeholder="e.g. React, Node.js, Python, AWS"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={handleReset}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Reset
        </button>
        <button
          type="submit"
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
        >
          Apply Filters
        </button>
      </div>
    </form>
  );
};

export default SearchFiltersComponent;