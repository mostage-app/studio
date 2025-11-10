// Google Analytics utility functions
declare global {
  interface Window {
    gtag: (
      command: "config" | "event" | "js" | "set",
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
  }
}

export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Specific tracking functions for your requirements
export const analytics = {
  // Track theme changes
  trackThemeChange: (theme: "dark" | "light") => {
    trackEvent("theme_change", "UI", theme);
  },

  // Track export operations
  trackExport: (format: string) => {
    trackEvent("export", "File Operations", format);
  },

  // Track import operations
  trackImport: (format: string) => {
    trackEvent("import", "File Operations", format);
  },

  // Track about modal view
  trackAboutView: () => {
    trackEvent("about_view", "Navigation", "About Modal");
  },

  // Track AI usage
  trackAIUsage: (feature: string, prompt?: string, contentLength?: number) => {
    const label = prompt
      ? `${feature} - ${prompt.substring(0, 100)}${
          prompt.length > 100 ? "..." : ""
        }`
      : feature;
    trackEvent("ai_usage", "AI Features", label, contentLength);
  },

  // Track presentation settings tab changes
  trackPresentationTab: (tabName: string) => {
    trackEvent("presentation_tab", "Presentation Settings", tabName);
  },

  // Track fullscreen toggle
  trackFullscreen: (state: "on" | "off") => {
    trackEvent("fullscreen_toggle", "UI", state);
  },

  // Track page views (for single page app)
  trackPageView: (pageName: string) => {
    trackEvent("page_view", "Navigation", pageName);
  },

  // Track authentication events
  trackAuthModalOpen: (mode: "login" | "signup") => {
    trackEvent("auth_modal_open", "Authentication", mode);
  },

  trackAuthAttempt: (mode: "login" | "signup") => {
    trackEvent("auth_attempt", "Authentication", mode);
  },

  trackAuthError: (errorType: "login_error" | "signup_error") => {
    trackEvent("auth_error", "Authentication", errorType);
  },

  trackAuthModeSwitch: (newMode: "login" | "signup") => {
    trackEvent("auth_mode_switch", "Authentication", newMode);
  },
};
