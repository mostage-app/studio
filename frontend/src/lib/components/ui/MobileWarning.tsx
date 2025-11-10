"use client";

import React, { useState } from "react";
import { Monitor, Smartphone, ArrowRight } from "lucide-react";

export const MobileWarning: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 md:hidden">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-md">
              <Smartphone className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-md sm:text-md font-semibold text-gray-900 dark:text-gray-100">
                Mobile Experience Notice
              </h2>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Warning Message */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-3 sm:p-4">
            <div className="flex items-start gap-3">
              <div className="p-1 bg-amber-100 dark:bg-amber-900/30 rounded">
                <Monitor className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-medium text-amber-800 dark:text-amber-200 mb-1">
                  Better Experience on Desktop
                </h3>
                <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300">
                  This editor is optimized for desktop use.
                </p>
              </div>
            </div>
          </div>

          {/* Benefits List */}
          <div className="space-y-3">
            <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">
              Why use desktop?
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <span>Full functionality like speaker mode and more</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <span>Better split-pane resizing and navigation</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <span>Enhanced presentation preview and editing</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <span>Full export and import functionality</span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              onClick={() => setIsVisible(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 text-sm sm:text-base rounded-md transition-colors flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              Continue on Mobile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
