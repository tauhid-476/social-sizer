"use client";
import React from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Header */}
      <header className="shadow-md p-4 border-b border-slate-600">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-primary text-2xl font-bold">
            Social Sizer
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-white mb-4">
            Welcome to Social Sizer
          </h1>
          <p className="text-lg text-gray-500 mb-6 px-5">
            Your one-stop solution for resizing videos and images for social media. Explore our features and make your content stand out!
          </p>
          <div className="flex justify-center">
            <Link href="/home" className="btn btn-primary px-6 py-3 text-lg font-semibold">
              Start Now
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="shadow-md p-4 border-t border-slate-500">
        <div className="max-w-7xl mx-auto text-center text-gray-600">
          <p>&copy; 2024 Social Sizer. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
