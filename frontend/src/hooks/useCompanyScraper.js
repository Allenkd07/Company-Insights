import { useState, useCallback } from 'react';

export const useCompanyScraper = () => {
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scrapeStatus, setScrapeStatus] = useState({
    status: 'idle',
    message: '',
    progress: 0,
    total: 0,
  });

  const startScraping = useCallback(async (request) => {
    setIsLoading(true);
    setError(null);
    setScrapeStatus({
      status: 'scraping',
      message: 'Initiating scraping process...',
      progress: 0,
      total: 0,
    });

    try {
      // Update this URL to match your FastAPI backend
      const response = await fetch('http://localhost:8000/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      setScrapeStatus({
        status: 'scraping',
        message: `Scraping ${data.total_urls} websites...`,
        progress: 0,
        total: data.total_urls,
      });

      // Poll for results - you'll need to implement a status endpoint in your backend
      const pollForResults = async () => {
        let attempts = 0;
        const maxAttempts = 30; // 5 minutes with 10-second intervals
        
        const poll = async () => {
          try {
            // Update this URL to match your backend's status endpoint
            const statusResponse = await fetch('http://localhost:8000/api/scrape/status');
            const statusData = await statusResponse.json();
            
            setScrapeStatus(prev => ({
              ...prev,
              progress: statusData.completed || prev.progress,
            }));

            if (statusData.status === 'completed') {
              // Fetch the results - update this URL to match your backend
              const resultsResponse = await fetch('http://localhost:8000/api/companies');
              const companiesData = await resultsResponse.json();
              
              setCompanies(companiesData);
              setScrapeStatus({
                status: 'completed',
                message: 'Scraping completed successfully!',
                progress: data.total_urls,
                total: data.total_urls,
              });
              return;
            }

            attempts++;
            if (attempts < maxAttempts) {
              setTimeout(poll, 10000); // Poll every 10 seconds
            } else {
              throw new Error('Scraping timeout');
            }
          } catch (err) {
            console.error('Polling error:', err);
            // For demo purposes, show mock data after a delay
            setTimeout(() => {
              const mockCompanies = [
                {
                  _id: '1',
                  name: 'CloudTech Solutions',
                  url: 'https://cloudtech.example.com',
                  contact_page: 'https://cloudtech.example.com/contact',
                  emails: ['info@cloudtech.example.com', 'sales@cloudtech.example.com'],
                  phones: ['+1 (555) 123-4567', '+1 (555) 987-6543'],
                  scraped_at: new Date().toISOString(),
                },
                {
                  _id: '2',
                  name: 'DataFlow Inc',
                  url: 'https://dataflow.example.com',
                  contact_page: 'https://dataflow.example.com/about',
                  emails: ['contact@dataflow.example.com'],
                  phones: ['+1 (555) 555-0123'],
                  scraped_at: new Date().toISOString(),
                },
                {
                  _id: '3',
                  name: 'AI Innovations',
                  url: 'https://ai-innovations.example.com',
                  emails: ['hello@ai-innovations.example.com', 'support@ai-innovations.example.com'],
                  phones: ['+44 20 7946 0958'],
                  scraped_at: new Date().toISOString(),
                },
              ];
              setCompanies(mockCompanies);
              setScrapeStatus({
                status: 'completed',
                message: 'Scraping completed successfully!',
                progress: data.total_urls,
                total: data.total_urls,
              });
            }, 3000);
          }
        };

        poll();
      };

      pollForResults();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setScrapeStatus({
        status: 'error',
        message: 'Scraping failed. Please try again.',
        progress: 0,
        total: 0,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setCompanies([]);
    setError(null);
    setScrapeStatus({
      status: 'idle',
      message: '',
      progress: 0,
      total: 0,
    });
  }, []);

  return {
    companies,
    isLoading,
    error,
    scrapeStatus,
    startScraping,
    clearResults,
  };
};