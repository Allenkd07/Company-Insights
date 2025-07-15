import React from 'react';
import { Search, Database } from 'lucide-react';

export const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Company Insight Scraper</h1>
              <p className="text-sm text-gray-500">Discover and analyze company data</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Database className="w-4 h-4" />
            <span>MongoDB Connected</span>
          </div>
        </div>
      </div>
    </header>
  );
};