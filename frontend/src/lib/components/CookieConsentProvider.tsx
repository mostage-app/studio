"use client";

import React, { createContext, useContext } from "react";
import { GoogleAnalytics } from "@/lib/utils";
import { CookieConsentBanner } from "@/lib/components/ui";
import { useCookieConsent } from "@/lib/hooks";

interface CookieConsentContextType {
  hasConsent: boolean;
  needsConsent: boolean;
  acceptAnalytics: () => void;
  declineAnalytics: () => void;
  resetConsent: () => void;
}

const CookieConsentContext = createContext<
  CookieConsentContextType | undefined
>(undefined);

export function useCookieConsentContext() {
  const context = useContext(CookieConsentContext);
  if (context === undefined) {
    throw new Error(
      "useCookieConsentContext must be used within a CookieConsentProvider"
    );
  }
  return context;
}

interface CookieConsentProviderProps {
  children: React.ReactNode;
}

export function CookieConsentProvider({
  children,
}: CookieConsentProviderProps) {
  const {
    isLoaded,
    hasConsent,
    needsConsent,
    acceptAnalytics,
    declineAnalytics,
    resetConsent,
  } = useCookieConsent();

  const contextValue: CookieConsentContextType = {
    hasConsent,
    needsConsent,
    acceptAnalytics,
    declineAnalytics,
    resetConsent,
  };

  return (
    <CookieConsentContext.Provider value={contextValue}>
      {children}

      {/* Google Analytics - only load after consent */}
      <GoogleAnalytics consentGiven={hasConsent} />

      {/* Cookie Consent Banner - only show if consent is needed and loaded */}
      {isLoaded && needsConsent && (
        <CookieConsentBanner
          onAccept={acceptAnalytics}
          onDecline={declineAnalytics}
        />
      )}
    </CookieConsentContext.Provider>
  );
}
