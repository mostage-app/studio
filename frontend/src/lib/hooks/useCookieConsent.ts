"use client";

import { useState, useEffect } from "react";

type ConsentStatus = "pending" | "accepted" | "declined";

export function useCookieConsent() {
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>("pending");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const savedConsent = localStorage.getItem(
      "analytics-consent"
    ) as ConsentStatus;

    if (savedConsent === "accepted" || savedConsent === "declined") {
      setConsentStatus(savedConsent);
    }

    setIsLoaded(true);
  }, []);

  const acceptAnalytics = () => {
    setConsentStatus("accepted");
    localStorage.setItem("analytics-consent", "accepted");
  };

  const declineAnalytics = () => {
    setConsentStatus("declined");
    localStorage.setItem("analytics-consent", "declined");
  };

  const resetConsent = () => {
    setConsentStatus("pending");
    localStorage.removeItem("analytics-consent");
  };

  return {
    consentStatus,
    isLoaded,
    hasConsent: consentStatus === "accepted",
    needsConsent: consentStatus === "pending",
    acceptAnalytics,
    declineAnalytics,
    resetConsent,
  };
}
