"use client";

import React from "react";
import { Button } from "./Button";
import { Cookie } from "lucide-react";

interface CookieConsentBannerProps {
  onAccept: () => void;
  onDecline: () => void;
}

export function CookieConsentBanner({
  onAccept,
  onDecline,
}: CookieConsentBannerProps) {
  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md bg-slate-50 dark:bg-slate-900 rounded-md shadow-xl border border-slate-200 dark:border-slate-700 z-[10000] backdrop-blur-sm">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-md flex items-center justify-center">
            <Cookie className="w-4 h-4 text-slate-700 dark:text-slate-300" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Privacy & Cookies
          </h3>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
          We collect anonymous usage data to improve our service. Your privacy
          is protected and you can opt out anytime.{" "}
          <a
            href="/privacy"
            className="text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 underline font-medium"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn more
          </a>
        </p>

        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onDecline}
            className="flex-1"
          >
            Decline
          </Button>
          <Button size="sm" onClick={onAccept} className="flex-1">
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
