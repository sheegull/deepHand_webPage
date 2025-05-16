import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./button";

export const LanguageToggle = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = (e: React.MouseEvent) => {
    e.stopPropagation();
    i18n.changeLanguage(i18n.language === "en" ? "ja" : "en");
  };

  return (
    <Button
      onClick={toggleLanguage}
      variant="outline"
      className="w-[40px] md:w-[40px] h-7 md:h-9 bg-[#1e1e1e] text-white rounded-md border-2 border-white hover:bg-white/20 active:bg-white/30 transition-colors font-alliance font-light text-xs md:text-sm"
    >
      {i18n.language === "en" ? "JP" : "EN"}
    </Button>
  );
};