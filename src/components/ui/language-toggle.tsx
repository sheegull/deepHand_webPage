import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './button';

export const LanguageToggle = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ja' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="w-[50px] h-8 bg-transparent text-white border border-white/20 hover:bg-white/20 active:bg-white/30"
    >
      {i18n.language === 'en' ? 'JP' : 'EN'}
    </Button>
  );
};