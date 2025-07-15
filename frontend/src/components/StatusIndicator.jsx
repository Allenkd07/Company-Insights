import React from 'react';
import { CheckCircle, AlertCircle, Loader, Clock } from 'lucide-react';

export const StatusIndicator = ({ status, message, progress = 0, total = 0 }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'scraping':
        return <Loader className="w-5 h-5 animate-spin text-blue-600" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'scraping':
        return 'bg-blue-50 border-blue-200';
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (status === 'idle') return null;

  return (
    <div className={`rounded-lg border p-4 mb-6 ${getStatusColor()}`}>
      <div className="flex items-center space-x-3">
        {getStatusIcon()}
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{message}</p>
          {status === 'scraping' && total > 0 && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Progress</span>
                <span>{progress}/{total} websites</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(progress / total) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};