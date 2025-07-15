import React from 'react';
import { Globe, Mail, Phone, ExternalLink, Calendar, MapPin } from 'lucide-react';

export const CompanyCard = ({ company }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{company.name}</h3>
            <div className="flex items-center space-x-2 text-gray-600">
              <Globe className="w-4 h-4" />
              <a
                href={company.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                {new URL(company.url).hostname}
              </a>
              <ExternalLink className="w-3 h-3" />
            </div>
          </div>
          <div className="text-right">
            {company.scraped_at && (
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>{new Date(company.scraped_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {company.emails.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Email Addresses</span>
              </div>
              <div className="space-y-1">
                {company.emails.map((email, index) => (
                  <a
                    key={index}
                    href={`mailto:${email}`}
                    className="block text-sm text-blue-600 hover:text-blue-800 transition-colors pl-6"
                  >
                    {email}
                  </a>
                ))}
              </div>
            </div>
          )}

          {company.phones.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Phone Numbers</span>
              </div>
              <div className="space-y-1">
                {company.phones.map((phone, index) => (
                  <a
                    key={index}
                    href={`tel:${phone}`}
                    className="block text-sm text-blue-600 hover:text-blue-800 transition-colors pl-6"
                  >
                    {phone}
                  </a>
                ))}
              </div>
            </div>
          )}

          {company.contact_page && (
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Contact Page</span>
              </div>
              <a
                href={company.contact_page}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors pl-6 flex items-center space-x-1"
              >
                <span>View Contact Page</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-50 px-6 py-3 border-t">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>{company.emails.length} emails • {company.phones.length} phones</span>
          <span>ID: {company._id.slice(-8)}</span>
        </div>
      </div>
    </div>
  );
};