"use client";
import React from "react";

export default function Navbar() {
  return (
    <nav className="w-full h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm">
      <div className="font-bold text-lg text-purple-700">Synvibes HRMS</div>
      <div className="flex items-center gap-4">
        {/* Placeholder for user/profile actions */}
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold">U</div>
      </div>
    </nav>
  );
} 