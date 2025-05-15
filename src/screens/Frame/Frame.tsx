import React, { useState } from "react";
import { HeroSectionByAnima } from "./sections/HeroSectionByAnima";
import { RequestDataPageByAnima } from "./sections/RequestDataPageByAnima";

export const Frame = (): JSX.Element => {
  const [currentPage, setCurrentPage] = useState<'hero' | 'request'>('hero');

  const navigateToRequest = () => setCurrentPage('request');
  const navigateToHome = () => setCurrentPage('hero');

  return (
    <div className="bg-transparent flex flex-col items-center w-full min-h-screen">
      <div className="w-full max-w-[2580px] flex-1">
        {currentPage === 'hero' ? (
          <HeroSectionByAnima onRequestClick={navigateToRequest} onLogoClick={navigateToHome} />
        ) : (
          <RequestDataPageByAnima onLogoClick={navigateToHome} />
        )}
      </div>
    </div>
  );
};