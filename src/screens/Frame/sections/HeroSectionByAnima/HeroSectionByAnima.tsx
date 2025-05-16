import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Menu } from "lucide-react";
import { contactFormSchema } from "../../../../lib/schema";
import { Button } from "../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "../../../../components/ui/navigation-menu";
import { Textarea } from "../../../../components/ui/textarea";
import { LanguageToggle } from "../../../../components/ui/language-toggle";

interface HeroSectionByAnimaProps {
  onRequestClick: () => void;
  onNavClick: (element: string) => void;
  onLogoClick: () => void;
  isLoading: boolean;
}

export const HeroSectionByAnima = ({
  onRequestClick,
  onNavClick,
  onLogoClick,
  isLoading,
}: HeroSectionByAnimaProps): JSX.Element => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitStatus, setSubmitStatus] = React.useState<"idle" | "success" | "error">("idle");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch("https://deephand-forms.workers.dev/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setSubmitStatus("success");
      reset();
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navigation links data
  const navLinks = [
    { text: t('nav.solutions'), href: "#" },
    { text: t('nav.resources'), href: "#" },
    { text: t('nav.pricing'), href: "#" },
    { text: t('nav.aboutUs'), href: "#" },
  ];

  // Footer links data
  const footerLinks = [
    { text: t('footer.termsOfService'), href: "#" },
    { text: t('footer.privacyPolicy'), href: "#" },
  ];

  return (
    <div className="flex flex-col w-full items-start bg-[#1e1e1e] min-h-screen">
      {/* Navigation Bar */}
      <header className="fixed top-0 z-50 w-full h-20 flex items-center justify-between px-4 md:px-20 bg-[#1e1e1e]">
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={onLogoClick}>
            <img className="w-8 h-8 object-cover" alt="Icon" src="/logo.png" />
            <div className="font-alliance font-light text-white text-xl md:text-2xl leading-[28.8px]">
              DeepHand
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <Menu className="w-6 h-6" />
            </div>
          </button>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:block mx-auto">
            <NavigationMenuList className="flex gap-4 lg:gap-8">
              {navLinks.map((link, index) => (
                <NavigationMenuItem 
                  key={index}
                  onClick={() => onNavClick(link.text.toLowerCase())}
                  className="cursor-pointer"
                >
                  <span className="font-alliance font-light text-white text-[13px] lg:text-[15px] leading-[19.2px]">
                    {link.text}
                  </span>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-2 md:gap-4">
            <LanguageToggle />
            <Button
              onClick={() => onNavClick('get-started')}
              className="w-[100px] h-11 bg-white text-[#1e1e1e] border-2 border-white rounded-md font-alliance font-normal text-sm hover:bg-[#1e1e1e] hover:text-white active:bg-[#1e1e1e] active:text-white transition-colors"
            >
              {t('nav.getStarted')}
            </Button>
            <Button
              onClick={() => onNavClick('login')}
              variant="outline"
              className="w-[80px] md:w-[100px] h-11 bg-[#1e1e1e] text-white rounded-md border-2 border-white hover:bg-white/20 active:bg-white/30 transition-colors font-alliance font-light text-sm"
            >
              {t('nav.login')}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`absolute top-20 left-0 right-0 bg-[#1e1e1e] transition-all duration-300 ease-in-out ${
            isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
          } md:hidden border-t border-gray-700 shadow-lg`}
        >
          <nav className="flex flex-col py-3">
            {navLinks.map((link, index) => (
              <a
                key={index}
                onClick={() => onNavClick(link.text.toLowerCase())}
                className="py-2 px-4 text-white hover:bg-white/20 active:bg-white/30 transition-colors text-sm"
              >
                {link.text}
              </a>
            ))}
            <div className="flex flex-col gap-2 mt-2 p-2 border-t border-gray-700">
              <Button className="w-full h-11 bg-white text-[#1e1e1e] border-2 border-white rounded-md font-alliance font-normal text-sm hover:bg-[#1e1e1e] hover:text-white active:bg-[#1e1e1e] active:text-white transition-colors">
                {t('nav.getStarted')}
              </Button>
              <Button
                variant="outline"
                className="w-full h-11 bg-[#1e1e1e] text-white rounded-md border-2 border-white hover:bg-white/20 active:bg-white/30 transition-colors font-alliance font-light text-sm"
              >
                {t('nav.login')}
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative w-full px-4 md:px-[92px] flex-1 shadow-[0px_4px_4px_#00000040] mt-20">
        <div className="flex flex-wrap justify-center md:justify-between py-[100px] md:py-[219px] gap-16">
          {/* Left Content */}
          <div className="flex flex-col max-w-[654px] gap-10 text-center md:text-left">
            <h1 className="font-alliance font-normal text-white text-4xl md:text-[64px] leading-[1.1] mt-[65px]">
              {t('hero.title')}
            </h1>
            <p className="font-alliance font-light text-zinc-400 text-lg md:text-xl leading-[30px] max-w-[555px]">
              {t('hero.subtitle')}
            </p>
            <Button
              onClick={onRequestClick}
              className="w-40 h-[52px] bg-[#234ad9] text-white rounded-md font-alliance font-medium text-base mx-auto md:mx-0 hover:bg-[#1e3eb8] active:bg-[#183099] transition-colors"
            >
              {t('hero.requestButton')}
            </Button>
          </div>

          {/* Contact Form Card */}
          <Card className="w-full md:w-[460px] bg-[#ffffff10] rounded-2xl shadow-[0px_0px_40px_#0000004d] border-none">
            <CardHeader className="px-8 pt-8 pb-0">
              <CardTitle className="font-alliance font-normal text-white text-2xl leading-[28.8px]">
                {t('contact.title')}
              </CardTitle>
              <CardDescription className="font-alliance font-light text-[#aaaaaa] text-sm leading-[16.8px]">
                {t('contact.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pt-6">
              <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-2">
                  <label className="font-alliance font-normal text-slate-200 text-sm leading-[16.8px]">
                    {t('contact.name')} *
                  </label>
                  <Input
                    {...register("name")}
                    placeholder={t('contact.placeholder.name')}
                    className={`h-12 bg-[#ffffff10] rounded-lg border ${
                      errors.name ? "border-red-500" : "border-white/20"
                    } text-white placeholder:text-white/50 font-light text-sm`}
                  />
                  {errors.name && (
                    <span className="text-red-500 text-sm">
                      {t('validation.required', { field: t('contact.name') })}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-alliance font-normal text-slate-200 text-sm leading-[16.8px]">
                    {t('contact.email')} *
                  </label>
                  <Input
                    {...register("email")}
                    placeholder={t('contact.placeholder.email')}
                    className={`h-12 bg-[#ffffff10] rounded-lg border ${
                      errors.email ? "border-red-500" : "border-white/20"
                    } text-white placeholder:text-white/50 font-light text-sm`}
                  />
                  {errors.email && (
                    <span className="text-red-500 text-sm">{t('validation.email')}</span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-alliance font-normal text-slate-200 text-sm leading-[16.8px]">
                    {t('contact.message')} *
                  </label>
                  <Textarea
                    {...register("message")}
                    placeholder={t('contact.placeholder.message')}
                    className={`h-[100px] bg-[#ffffff10] rounded-lg border ${
                      errors.message ? "border-red-500" : "border-white/20"
                    } text-white placeholder:text-white/50 font-light text-sm`}
                  />
                  {errors.message && (
                    <span className="text-red-500 text-sm">
                      {t('validation.required', { field: t('contact.message') })}
                    </span>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={`h-12 rounded-lg font-alliance font-medium text-white text-base mt-6 transition-colors
                    ${
                      isSubmitting
                        ? "bg-[#234ad9]/70"
                        : "bg-[#234ad9] hover:bg-[#1e3eb8] active:bg-[#183099]"
                    }`}
                >
                  {isSubmitting ? t('contact.submitting') : t('contact.submit')}
                </Button>

                {submitStatus === "success" && (
                  <p className="text-green-500 text-sm text-center mt-2">
                    {t('contact.success')}
                  </p>
                )}
                {submitStatus === "error" && (
                  <p className="text-red-500 text-sm text-center mt-2">
                    {t('contact.error')}
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="flex flex-col md:flex-row items-center justify-between w-full mt-20 gap-4 md:gap-0 pb-8">
          <div className="font-alliance font-light text-zinc-400 text-[10px] leading-[16.8px]">
            © 2025 DeepHand. All Rights Reserved.
          </div>
          <div className="flex items-center gap-6">
            {footerLinks.map((link, index) => (
              <a
                key={index}
                onClick={() => onNavClick(link.text.toLowerCase().replace(/\s+/g, '-'))}
                className="font-alliance font-light text-zinc-400 text-[10px] leading-[16.8px]"
              >
                {link.text}
              </a>
            ))}
          </div>
        </footer>
      </main>
    </div>
  );
};