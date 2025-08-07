import { Mail, Github, Linkedin, Globe } from "lucide-react";
import Link from "next/link";
import React from "react";

// An array of social/contact links with associated icons
const contactLinks = [
  {
    name: "GitHub",
    href: "https://github.com/devjadiya",
    icon: <Github className="h-5 w-5" />,
  },
  {
    name: "LinkedIn",
    href: "linkedin.com/in/devjadiya",
    icon: <Linkedin className="h-5 w-5" />,
  },
  {
    name: "Wikimedia",
    href: "https://meta.wikimedia.org/wiki/User:Dev_Jadiya",
    icon: <Globe className="h-5 w-5" />,
  },
  {
    name: "Email",
    href: "mailto:dev.wikipedia@gmail.com",
    icon: <Mail className="h-5 w-5" />,
  },
];

// The main page component
function ContactPage() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-900 p-4 text-white font-sans">
      <div className="w-full max-w-md rounded-2xl bg-gray-800/60 p-8 shadow-2xl backdrop-blur-lg border border-gray-700">
        <div className="flex flex-col items-center text-center">
          {/* Profile Picture */}
          <img
            src="https://github.com/devjadiya.png"
            alt="Dev Jadiya"
            className="h-28 w-28 rounded-full border-4 border-gray-600 object-cover shadow-lg"
          />

          {/* Name and Title */}
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-white">
            Dev Jadiya
          </h1>
          <p className="mt-2 text-md text-gray-400">
            Software Developer & Wiki Contributor
          </p>
        </div>

        {/* Links Section */}
        <div className="mt-8 flex flex-col gap-4">
          {contactLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex w-full items-center justify-center gap-3 rounded-lg bg-gray-700/50 px-4 py-3 text-lg font-medium text-gray-200 transition-all duration-300 ease-in-out hover:bg-gray-700 hover:text-white hover:shadow-md"
            >
              {link.icon}
              <span>{link.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

// Export the component as the default
export default ContactPage;
