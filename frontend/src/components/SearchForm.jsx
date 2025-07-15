import React, { useState } from 'react';
import { Search, Plus, Minus, Loader } from 'lucide-react';

export const SearchForm = ({ onSubmit, isLoading }) => {
  const [activeTab, setActiveTab] = useState('query');
  const [query, setQuery] = useState('');
  const [urls, setUrls] = useState(['']);
  const [limit, setLimit] = useState(5);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (activeTab === 'query' && query.trim()) {
      onSubmit({ query: query.trim(), limit });
    } else if (activeTab === 'urls') {
      const validUrls = urls.filter(url => url.trim() !== '');
      if (validUrls.length > 0) {
        onSubmit({ urls: validUrls });
      }
    }
  };

  const addUrlField = () => {
    setUrls([...urls, '']);
  };

  const removeUrlField = (index) => {
    setUrls(urls.filter((_, i) => i !== index));
  };

  const updateUrl = (index, value) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const exampleQueries = [
    'cloud computing startups in Europe',
    'fintech companies in Silicon Valley',
    'AI companies in London',
    'e-commerce platforms in Asia',
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            type="button"
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'query'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('query')}
          >
            Search by Query
          </button>
          <button
            type="button"
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'urls'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('urls')}
          >
            Direct URLs
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {activeTab === 'query' ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
                Search Query
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  id="query"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., cloud computing startups in Europe"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {exampleQueries.map((example, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setQuery(example)}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                  disabled={isLoading}
                >
                  {example}
                </button>
              ))}
            </div>

            <div>
              <label htmlFor="limit" className="block text-sm font-medium text-gray-700 mb-2">
                Number of companies to find
              </label>
              <input
                id="limit"
                type="number"
                min="1"
                max="20"
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value))}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company URLs
            </label>
            {urls.map((url, index) => (
              <div key={index} className="flex space-x-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => updateUrl(index, e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
                {urls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeUrlField(index)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    disabled={isLoading}
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addUrlField}
              className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
              disabled={isLoading}
            >
              <Plus className="w-4 h-4" />
              <span>Add URL</span>
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || (activeTab === 'query' && !query.trim()) || (activeTab === 'urls' && !urls.some(url => url.trim()))}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              <span>Scraping...</span>
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              <span>Start Scraping</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};