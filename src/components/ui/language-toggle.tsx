import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './button';

export const LanguageToggle = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ja' ? 'en' : 'ja';
    i18n.changeLanguage(newLang);
    localStorage.setItem('i18nextLng', newLang);
  };

  return (
    <Button
      onClick={toggleLanguage}
      variant="outline"
      className="w-[40px] h-11 bg-[#1e1e1e] text-white rounded-md border-2 border-white hover:bg-white/20 active:bg-white/30 transition-colors font-alliance font-light text-sm"
    >
      {i18n.language === 'ja' ? 'EN' : '日本語'}
    </Button>
  );
};