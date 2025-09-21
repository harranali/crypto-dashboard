"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Github, Link, Menu, X } from "lucide-react";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const githubUrl = "https://github.com/your-github-username"; // Replace with your GitHub URL
  const websiteUrl = "https://www.yourwebsite.com"; // Replace with your website URL

  return (
    <nav className="bg-white shadow-sm p-4 sticky top-0 z-40">
      <div className="flex justify-between items-center">
        {/* Left logo */}
        <div className="flex items-center space-x-3">
          <svg
            className="w-8 h-8 text-black"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 14h-2v-4h-2V8h4v8zm-2-6h2V8h-2v2z" />
          </svg>
          <span className="font-bold text-xl">CryptoDash</span>
        </div>

        {/* Desktop menu - Right side */}
        <div className="hidden md:flex space-x-6 text-gray-600">
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 hover:text-black transition-colors"
          >
            <Github className="w-4 h-4" />
            <span>GitHub</span>
          </a>
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 hover:text-black transition-colors"
          >
            <Link className="w-4 h-4" />
            <span>Website</span>
          </a>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu content */}
      {isMobileMenuOpen && (
        <div className="flex flex-col items-center gap-4 mt-4 md:hidden w-full">
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-lg text-gray-600 hover:text-black transition-colors"
          >
            <Github className="w-5 h-5" />
            <span>GitHub</span>
          </a>
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-lg text-gray-600 hover:text-black transition-colors"
          >
            <Link className="w-5 h-5" />
            <span>Website</span>
          </a>
        </div>
      )}
    </nav>
  );
}