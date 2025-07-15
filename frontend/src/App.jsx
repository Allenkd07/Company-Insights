import React from 'react';
import { Header } from './components/Header';
import { SearchForm } from './components/SearchForm';
import { StatusIndicator } from './components/StatusIndicator';
import { CompanyGrid } from './components/CompanyGrid';
import { useCompanyScraper } from './hooks/useCompanyScraper';
import { AlertCircle } from 'lucide-react';

function App() {
  const {
    companies,
    isLoading,
    error,
    scrapeStatus,
    startScraping,
    clearResults,
  } = useCompanyScraper();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Discover Company Information
          </h2>
          <p className="text-gray-600">
            Search for companies using queries or provide direct URLs to extract contact information
          </p>
        </div>

        <SearchForm onSubmit={startScraping} isLoading={isLoading} />

        <StatusIndicator
          status={scrapeStatus.status}
          message={scrapeStatus.message}
          progress={scrapeStatus.progress}
          total={scrapeStatus.total}
        />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800 font-medium">Error</p>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
            <button
              onClick={clearResults}
              className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
            >
              Clear and try again
            </button>
          </div>
        )}

        <CompanyGrid companies={companies} isLoading={isLoading} />
      </main>
    </div>
  );
}

export default App;