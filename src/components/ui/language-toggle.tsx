import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./button";

export const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const toggleLanguage = () => {
    i18n.changeLanguage(currentLang === "en" ? "ja" : "en");
  };

  return (
    <Button
      onClick={toggleLanguage}
      variant="outline"
      className="w-[60px] h-9 md:w-[70px] md:h-10 bg-[#1e1e1e] text-white rounded-md border-2 border-white hover:bg-white/20 active:bg-white/30 transition-colors font-alliance font-light text-sm"
    >
      {currentLang === "en" ? "JP" : "EN"}
    </Button>
  );
};