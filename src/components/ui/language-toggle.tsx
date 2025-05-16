import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './button';

export const LanguageToggle = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'ja' : 'en');
  };

  return (
    <Button
      variant="outline"
      onClick={toggleLanguage}
      className="w-[80px] h-11 bg-[#1e1e1e] text-white rounded-md border-2 border-white hover:bg-white/20 active:bg-white/30 transition-colors font-alliance font-light text-sm"
    >
      EN/JP
    </Button>
  );
};