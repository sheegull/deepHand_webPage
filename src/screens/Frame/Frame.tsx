import React, { useState, useCallback, useEffect } from "react";
import { logNavigation } from "../../lib/analytics";
import { HeroSectionByAnima } from "./sections/HeroSectionByAnima";
import { RequestDataPageByAnima } from "./sections/RequestDataPageByAnima";

export const Frame = (): JSX.Element => {
  const [currentPage, setCurrentPage] = useState<'hero' | 'request'>(() => {
    // Check current URL path to determine initial page
    const path = window.location.pathname;
    return path === '/request' ? 'request' : 'hero';
  });
  const [isLoading, setIsLoading] = useState(false);

  const navigateToHome = () => {
    setCurrentPage('hero');
    window.history.pushState({}, '', '/');
  };

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setCurrentPage(path === '/request' ? 'request' : 'hero');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToRequest = useCallback(async (from: string) => {
    setIsLoading(true);
    
    // Preserve URL parameters
    const currentUrl = new URL(window.location.href);
    const searchParams = currentUrl.searchParams.toString();
    const targetPath = `/request${searchParams ? `?${searchParams}` : ''}`;
    
    // Update browser history
    window.history.pushState({}, '', targetPath);
    
    // Log navigation event
    await logNavigation({
      from,
      to: 'request',
      element: from,
      timestamp: Date.now(),
    });
    
    setCurrentPage('request');
    setIsLoading(false);
  }, []);

  return (
    <div className="bg-transparent flex flex-col items-center w-full min-h-screen">
      <div className="w-full max-w-[2580px] flex-1">
        {currentPage === 'hero' ? (
          <HeroSectionByAnima 
            onRequestClick={() => navigateToRequest('request-button')}
            onNavClick={(element) => navigateToRequest(element)}
            onLogoClick={navigateToHome}
            isLoading={isLoading}
          />
        ) : (
          <RequestDataPageByAnima 
            onLogoClick={navigateToHome}
            onFooterClick={(element) => navigateToRequest(element)}
          />
        )}
      </div>
    </div>
  );
};