"use client";

import Image from "next/image";
import logo from "@/assets/images/logo.svg";

export function Loading() {
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Logo */}
        <div className="mb-6">
          <Image
            src={logo}
            alt="Mostage Logo"
            width={64}
            height={64}
            className="w-16 h-16 mx-auto"
            priority
          />
        </div>

        {/* Loading Animation */}
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
          <div
            className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>

        {/* Text */}
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Mostage App
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Loading the workspace...
        </p>
      </div>
    </div>
  );
}
