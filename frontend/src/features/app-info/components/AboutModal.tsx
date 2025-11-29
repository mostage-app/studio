"use client";

import React from "react";
import { Info, HelpCircle } from "lucide-react";
import { Modal } from "@/lib/components/ui/Modal";
import { analytics } from "@/lib/utils/analytics";
// import { useCookieConsentContext } from "@/lib/components";
import pkg from "../../../../package.json";
import pkgMostage from "../../../../node_modules/mostage/package.json";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour?: () => void;
}

export function AboutModal({ isOpen, onClose, onStartTour }: AboutModalProps) {
  // const { resetConsent } = useCookieConsentContext();

  // Track about modal view when it opens
  React.useEffect(() => {
    if (isOpen) {
      analytics.trackAboutView();
    }
  }, [isOpen]);

  const headerContent = (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-md">
        <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
      </div>
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-foreground">
          About Mostage
        </h2>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      headerContent={headerContent}
      maxWidth="2xl"
    >
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">
          Mostage JS{" "}
          <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-mono rounded-md ml-1">
            Version {pkgMostage.version || "latest"}
          </span>
        </h3>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-2">
          A presentation framework based on Markdown and HTML. Available as NPM
          package, CLI and Web App.
        </p>
        <ul className="list-disc list-inside text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
          <li>
            <a
              href="https://mostage.app/develop.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              mostage.app/develop
            </a>
          </li>
          <li>
            <a
              href="https://github.com/mostage-app/mostage"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              github.com/mostage-app/mostage
            </a>
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">
          Mostage Studio{" "}
          <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-mono rounded-md ml-1">
            Version {pkg.version || "latest"}
          </span>
        </h3>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-2">
          Web editor for making presentations with Markdown and HTML. Some
          features include AI Creation, Live Polling System, and Audience Q&A.
        </p>

        <ul className="list-disc list-inside text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
          <li>
            <a
              href="https://mostage.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              mostage.app
            </a>
          </li>
          <li>
            <a
              href="https://studio.mostage.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              studio.mostage.app
            </a>
          </li>
          <li>
            <a
              href="https://github.com/mostage-app/studio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              github.com/mostage-app/studio
            </a>
          </li>
        </ul>
      </div>
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">
          Developer & Contributor
        </h3>
        <ul className="list-disc list-inside text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
          <li>
            <a
              href="https://mirmousavi.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Mostafa Mirmousavi
            </a>
          </li>
          <li>
            <a
              href="https://github.com/mostage-app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Join the team
            </a>
          </li>
        </ul>
      </div>

      {/* <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">
          Donate
        </h3>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-2">
          You can support the project by sponsoring on GitHub.
        </p>
        <ul className="list-disc list-inside text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
          <li>
            <a
              href="https://github.com/sponsors/mirmousaviii"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              GitHub Sponsors
            </a>
          </li>
        </ul>
      </div> */}

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
        {/* <button
          onClick={resetConsent}
          className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors text-xs sm:text-sm"
        >
          <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
          Privacy Settings
        </button> */}
        {/* <a
          href="/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors text-xs sm:text-sm"
        >
          <Info className="w-3 h-3 sm:w-4 sm:h-4" />
          Privacy Policy
        </a> */}
        {/* <a
          href="https://mostage.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors text-xs sm:text-sm"
        >
          <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
          Website
        </a> */}
        {onStartTour && (
          <button
            onClick={() => {
              onClose();
              onStartTour();
            }}
            className="hidden sm:flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors text-xs sm:text-sm"
          >
            <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4" />
            Start Tour
          </button>
        )}
        <a
          href="https://github.com/sponsors/mostage-app"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/50 transition-colors text-xs sm:text-sm"
        >
          <span role="img" aria-label="Heart">
            💖
          </span>
          Donate
        </a>
      </div>
    </Modal>
  );
}
