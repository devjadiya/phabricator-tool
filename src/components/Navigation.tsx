"use client";
import { Contact } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";

// Define the props for our component
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
];

// This is a helper function to get the Google Translate cookie
const getGoogleTranslateCookie = (): string | null => {
  const cookies = document.cookie.split(";").map((c) => c.trim());
  const cookie = cookies.find((c) => c.startsWith("googtrans="));
  return cookie || null;
};

const Navigation: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(
    languages[0]
  );
  const [isDropdownOpen, setDropdownOpen] = useState<boolean>(false);

  // This effect runs once to add the Google Translate script to the page
  useEffect(() => {
    const addGoogleTranslateScript = () => {
      const scriptId = "google-translate-script";
      if (document.getElementById(scriptId)) return; // Script already exists

      const script = document.createElement("script");
      script.id = scriptId;
      script.type = "text/javascript";
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      document.body.appendChild(script);
    };

    // Define the callback function that Google Translate will call
    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: "en",
          autoDisplay: false,
          includedLanguages: "en,hi,fr,ar,es,sw",
        },
        "google_translate_element"
      );
      // Restore language selection if a cookie exists
      const cookie = getGoogleTranslateCookie();
      if (cookie) {
        const langCode = cookie.split("/")[2];
        const lang = languages.find((l) => l.code === langCode);
        if (lang) {
          setSelectedLanguage(lang);
        }
      }
    };

    addGoogleTranslateScript();
  }, []);

  // Function to change the language
  const changeLanguage = (lang: Language) => {
    setSelectedLanguage(lang);
    setDropdownOpen(false);

    const currentCookie = getGoogleTranslateCookie();
    const newCookieValue = `/en/${lang.code}`;

    // We set the cookie for Google Translate to use
    if (!currentCookie || !currentCookie.includes(newCookieValue)) {
      document.cookie = `googtrans=${newCookieValue}; path=/`;
      // We reload the page to apply the translation
      window.location.reload();
    }
  };

  return (
    <>
      {/* CSS to hide the Google Translate bar */}
      <style>
        {`
          .goog-te-banner-frame.skiptranslate {
            display: none !important;
          }
          body {
            top: 0px !important;
          }
        `}
      </style>
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
                <div className="absolute    top-14 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50">
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
              <Link href={"/contact"} className=" text-white">
                Maintainer
              </Link>
            </div>
          </div>
        </nav>

        {/* You need to add flag-icons css for the flags to show up */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/lipis/flag-icons@6.6.6/css/flag-icons.min.css"
        />
      </div>
    </>
  );
};

export default Navigation;
