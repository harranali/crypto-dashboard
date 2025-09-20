"use client";

import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-40">
      {/* Left logo */}
      <div className="flex items-center space-x-3">
        <svg
          className="w-8 h-8 text-blue-500"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 14h-2v-4h-2V8h4v8zm-2-6h2V8h-2v2z" />
        </svg>
        <span className="font-bold text-xl">CryptoDash</span>
      </div>

      {/* Desktop menu */}
      <div className="hidden md:flex space-x-6 text-gray-600">
        <Button variant="ghost">Dashboard</Button>
        <Button variant="ghost">Portfolio</Button>
        <Button variant="ghost">Exchanges</Button>
      </div>

      {/* Mobile menu button */}
      <div className="md:hidden">
        <Button variant="outline">Menu</Button>
      </div>
    </nav>
  );
}
