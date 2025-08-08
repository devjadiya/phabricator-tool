"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";

// --- Data and Type Definitions ---

interface Language {
  code: string;
  name: string;
  country_code: string;
}

const languages: Language[] = [
  { code: "en", name: "English", country_code: "gb" },
  { code: "hi", name: "Hindi", country_code: "in" },
  { code: "fr", name: "French", country_code: "fr" },
  { code: "ar", name: "Arabic", country_code: "sa" },
  { code: "es", name: "Spanish", country_code: "es" },
  { code: "sw", name: "Swahili", country_code: "ke" },
  { code: "id", name: "Indonesian", country_code: "id" },
];

const includedLanguages = languages.map(l => l.code).join(',');

// --- Helper Function ---

/**
 * Reads the 'googtrans' cookie and determines the initial language.
 * This runs before the component renders to prevent UI flicker.
 * @returns {Language} The language object corresponding to the cookie, or English by default.
 */
const getLanguageFromCookie = (): Language => {
  // On the server, document is not available. Default to English.
  if (typeof document === 'undefined') {
    return languages[0];
  }

  const cookieString = document.cookie;
  const googleTranslateCookie = cookieString
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("googtrans="));

  if (googleTranslateCookie) {
    const langCode = googleTranslateCookie.split("/")[2];
    const lang = languages.find((l) => l.code === langCode);
    return lang || languages[0];
  }

  return languages[0];
};


// --- The Navigation Component ---

const Navigation: React.FC = () => {
  // Initialize state directly from the cookie to ensure it's correct on page load.
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(getLanguageFromCookie);
  const [isDropdownOpen, setDropdownOpen] = useState<boolean>(false);

  // This effect runs once on mount to inject the Google Translate script.
  useEffect(() => {
    const scriptId = "google-translate-script";

    // If the script is already here, don't add it again.
    if (document.getElementById(scriptId)) {
        return;
    }

    // Define the global callback function that Google's script will call
    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: "en", // The original language of your site
          autoDisplay: false,
          includedLanguages: includedLanguages,
        },
        "google_translate_element" // The ID of the div to render the widget in
      );
    };
    
    // Create and append the script to the body
    const script = document.createElement("script");
    script.id = scriptId;
    script.type = "text/javascript";
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.body.appendChild(script);

  }, []);

  /**
   * Changes the language by updating the 'googtrans' cookie and reloading the page.
   * @param {Language} lang - The new language to switch to.
   */
  const changeLanguage = (lang: Language) => {
    setDropdownOpen(false);
    
    // Only update cookie and reload if the language is actually different.
    if (selectedLanguage.code !== lang.code) {
      document.cookie = `googtrans=/en/${lang.code}; path=/; SameSite=Lax`;
      window.location.reload();
    }
  };

  return (
    <>
      {/* This div is required by Google Translate, but we can hide it */}
      <div id="google_translate_element" style={{ display: "none" }}></div>

      {/* CSS to hide the default Google Translate banner that appears at the top */}
      <style>
        {`
          .goog-te-banner-frame.skiptranslate {
            display: none !important;
          }
          body {
            top: 0px !important;
          }
          .skiptranslate {
            display: none !important;
          }
        `}
      </style>

      {/* Add the flag-icons CSS for the flags to show up */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/css/flag-icons.min.css"
      />

      <div className="bg-gray-900 text-white font-sans">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <a href="/" className="text-2xl font-bold tracking-wider">
                DevCode
              </a>
            </div>
            <div className="relative flex justify-between gap-5 items-center">
              <button
                onClick={() => setDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-700 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white"
              >
                <span
                  className={`fi fi-${selectedLanguage.country_code}`}
                ></span>
                <span className="hidden sm:inline">
                  {selectedLanguage.name}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isDropdownOpen ? "transform rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </button>
              {isDropdownOpen && (
                <div className="absolute top-14 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50">
                  {languages.map((lang) => (
                    <a
                      key={lang.code}
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        changeLanguage(lang);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                    >
                      <span
                        className={`fi fi-${lang.country_code} mr-3`}
                      ></span>
                      {lang.name}
                    </a>
                  ))}
                </div>
              )}
              <Link href={"/contact"} className="text-white">
                Maintainer
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Navigation;
