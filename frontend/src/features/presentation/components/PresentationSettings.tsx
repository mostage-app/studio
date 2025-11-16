"use client";

import {
  PresentationToolbarProps,
  PresentationConfig,
} from "../types/presentation.types";
import { useState, useRef, useEffect } from "react";
import { Check, ImagePlus } from "lucide-react";
import { analytics } from "@/lib/utils/analytics";
import { UnsplashImageModal } from "@/features/editor/components/UnsplashImageModal";

// Indicator component for showing changed tabs
const ChangedIndicator: React.FC = () => {
  return (
    <span className="absolute top-2 right-0.5 w-1 h-1 rounded-full bg-blue-500 dark:bg-blue-400"></span>
  );
};

export const PresentationSettings: React.FC<PresentationToolbarProps> = ({
  config,
  onConfigChange,
}) => {
  const [activeTab, setActiveTab] = useState<
    "general" | "plugins" | "header-footer" | "background"
  >("general");

  // Store initial config to detect changes (only set on mount)
  const initialConfigRef = useRef<PresentationConfig>(
    JSON.parse(JSON.stringify(config))
  );
  const [changedTabs, setChangedTabs] = useState<Set<string>>(new Set());

  // Detect changes in each tab
  useEffect(() => {
    const tabs: {
      name: "general" | "plugins" | "header-footer" | "background";
      checkFn: (
        current: PresentationConfig,
        initial: PresentationConfig
      ) => boolean;
    }[] = [
      {
        name: "general",
        checkFn: (current, initial) => {
          return (
            current.theme !== initial.theme ||
            current.scale !== initial.scale ||
            current.loop !== initial.loop ||
            current.urlHash !== initial.urlHash ||
            JSON.stringify(current.transition) !==
              JSON.stringify(initial.transition) ||
            JSON.stringify(current.centerContent) !==
              JSON.stringify(initial.centerContent)
          );
        },
      },
      {
        name: "header-footer",
        checkFn: (current, initial) => {
          return (
            JSON.stringify(current.header) !== JSON.stringify(initial.header) ||
            JSON.stringify(current.footer) !== JSON.stringify(initial.footer)
          );
        },
      },
      {
        name: "background",
        checkFn: (current, initial) => {
          return (
            JSON.stringify(current.background) !==
            JSON.stringify(initial.background)
          );
        },
      },
      {
        name: "plugins",
        checkFn: (current, initial) => {
          return (
            JSON.stringify(current.plugins) !== JSON.stringify(initial.plugins)
          );
        },
      },
    ];

    const newChangedTabs = new Set<string>();
    tabs.forEach((tab) => {
      if (tab.checkFn(config, initialConfigRef.current)) {
        newChangedTabs.add(tab.name);
      }
    });

    setChangedTabs(newChangedTabs);
  }, [config]);

  // Handle tab change with analytics tracking
  const handleTabChange = (
    tabName: "general" | "plugins" | "header-footer" | "background"
  ) => {
    setActiveTab(tabName);
    analytics.trackPresentationTab(tabName);
  };
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
  const [showUnsplashModal, setShowUnsplashModal] = useState(false);
  const [unsplashTargetIndex, setUnsplashTargetIndex] = useState<number | null>(
    null
  );

  const handleThemeChange = (theme: typeof config.theme) => {
    onConfigChange({
      ...config,
      theme,
    });
  };

  const handleScaleChange = (scale: number) => {
    onConfigChange({
      ...config,
      scale,
    });
  };

  const handleBooleanChange = (
    key: keyof PresentationConfig,
    value: boolean
  ) => {
    onConfigChange({
      ...config,
      [key]: value,
    });
  };

  const handleTransitionChange = (
    key: keyof typeof config.transition,
    value: string | number
  ) => {
    onConfigChange({
      ...config,
      transition: {
        ...config.transition,
        [key]: value,
      },
    });
  };

  const handleCenterContentChange = (
    key: keyof typeof config.centerContent,
    value: boolean
  ) => {
    onConfigChange({
      ...config,
      centerContent: {
        ...config.centerContent,
        [key]: value,
      },
    });
  };

  const handleHeaderChange = (
    key: keyof typeof config.header,
    value: string | boolean
  ) => {
    onConfigChange({
      ...config,
      header: {
        ...config.header,
        [key]: value,
      },
    });
  };

  const handleFooterChange = (
    key: keyof typeof config.footer,
    value: string | boolean
  ) => {
    onConfigChange({
      ...config,
      footer: {
        ...config.footer,
        [key]: value,
      },
    });
  };

  const handlePluginToggle = (pluginName: keyof typeof config.plugins) => {
    onConfigChange({
      ...config,
      plugins: {
        ...config.plugins,
        [pluginName]: {
          ...config.plugins[pluginName],
          enabled: !config.plugins[pluginName].enabled,
        },
      },
    });
  };

  const handlePluginConfigChange = (
    pluginName: keyof typeof config.plugins,
    key: string,
    value: string | number | boolean
  ) => {
    onConfigChange({
      ...config,
      plugins: {
        ...config.plugins,
        [pluginName]: {
          ...config.plugins[pluginName],
          [key]: value,
        },
      },
    });
  };

  return (
    <div className="bg-muted border-b border-gray-200 dark:border-gray-700 sm:border-b-0">
      {/* Toolbar Header */}
      <div className="flex items-center justify-between p-3">
        <h3 className="text-sm font-semibold text-card-foreground">
          Presentation Settings
        </h3>
      </div>

      {/* Settings Content */}
      <div className="px-3 pb-3">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-600 overflow-x-auto">
          <button
            onClick={() => handleTabChange("general")}
            className={`px-2 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0 relative ${
              activeTab === "general"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            General
            {changedTabs.has("general") && <ChangedIndicator />}
          </button>
          <button
            onClick={() => handleTabChange("header-footer")}
            className={`px-2 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0 relative ${
              activeTab === "header-footer"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Header & Footer
            {changedTabs.has("header-footer") && <ChangedIndicator />}
          </button>
          <button
            onClick={() => handleTabChange("background")}
            className={`px-2 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0 relative ${
              activeTab === "background"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Background
            {changedTabs.has("background") && <ChangedIndicator />}
          </button>
          <button
            onClick={() => handleTabChange("plugins")}
            className={`px-2 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0 relative ${
              activeTab === "plugins"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Plugins
            {changedTabs.has("plugins") && <ChangedIndicator />}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-2">
          {activeTab === "general" && (
            <div
              className="grid grid-cols-1 gap-3"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              }}
            >
              {/* Basic Settings */}
              <div className="border border-gray-200 dark:border-gray-600 rounded-md p-2 bg-card-secondary shadow-sm">
                <div className="flex flex-col gap-3 mb-3">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Basic Settings
                  </span>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        Scale: {config.scale}x
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="1.5"
                        step="0.1"
                        value={config.scale}
                        onChange={(e) =>
                          handleScaleChange(parseFloat(e.target.value))
                        }
                        className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-md appearance-none cursor-pointer slider"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        Theme:
                      </label>
                      <select
                        value={config.theme}
                        onChange={(e) =>
                          handleThemeChange(
                            e.target.value as typeof config.theme
                          )
                        }
                        className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-24"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="dracula">Dracula</option>
                        <option value="ocean">Ocean</option>
                        <option value="rainbow">Rainbow</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Settings */}
              <div className="border border-gray-200 dark:border-gray-600 rounded-md p-2 bg-card-secondary shadow-sm">
                <div className="flex flex-col gap-3 mb-3">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Navigation
                  </span>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.loop}
                        onChange={(e) =>
                          handleBooleanChange("loop", e.target.checked)
                        }
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded border-2 mr-2 flex items-center justify-center transition-colors ${
                          config.loop
                            ? "bg-blue-500 border-blue-500"
                            : "border-gray-300 dark:border-gray-500"
                        }`}
                      >
                        {config.loop && (
                          <Check className="w-2 h-2 text-white" />
                        )}
                      </div>
                      <span className="text-xs text-gray-700 dark:text-gray-300">
                        Loop
                      </span>
                    </label>

                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.urlHash}
                        onChange={(e) =>
                          handleBooleanChange("urlHash", e.target.checked)
                        }
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded border-2 mr-2 flex items-center justify-center transition-colors ${
                          config.urlHash
                            ? "bg-blue-500 border-blue-500"
                            : "border-gray-300 dark:border-gray-500"
                        }`}
                      >
                        {config.urlHash && (
                          <Check className="w-2 h-2 text-white" />
                        )}
                      </div>
                      <span className="text-xs text-gray-700 dark:text-gray-300">
                        URL Hash
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Transition Settings */}
              <div className="border border-gray-200 dark:border-gray-600 rounded-md p-2 bg-card-secondary shadow-sm">
                <div className="flex flex-col gap-3 mb-3">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Transition
                  </span>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        Duration: {config.transition.duration}ms
                      </label>
                      <input
                        type="range"
                        min="100"
                        max="1000"
                        step="50"
                        value={config.transition.duration}
                        onChange={(e) =>
                          handleTransitionChange(
                            "duration",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-md appearance-none cursor-pointer slider"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        Type:
                      </label>
                      <select
                        value={config.transition.type}
                        onChange={(e) =>
                          handleTransitionChange("type", e.target.value)
                        }
                        className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-24"
                      >
                        <option value="horizontal">Horizontal</option>
                        <option value="vertical">Vertical</option>
                        <option value="fade">Fade</option>
                        <option value="slide">Slide</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Content Settings */}
              <div className="border border-gray-200 dark:border-gray-600 rounded-md p-2 bg-card-secondary shadow-sm">
                <div className="flex flex-col gap-3 mb-3">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Center Content
                  </span>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.centerContent.vertical}
                        onChange={(e) =>
                          handleCenterContentChange(
                            "vertical",
                            e.target.checked
                          )
                        }
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded border-2 mr-2 flex items-center justify-center transition-colors ${
                          config.centerContent.vertical
                            ? "bg-blue-500 border-blue-500"
                            : "border-gray-300 dark:border-gray-500"
                        }`}
                      >
                        {config.centerContent.vertical && (
                          <Check className="w-2 h-2 text-white" />
                        )}
                      </div>
                      <span className="text-xs text-gray-700 dark:text-gray-300">
                        Vertical
                      </span>
                    </label>

                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.centerContent.horizontal}
                        onChange={(e) =>
                          handleCenterContentChange(
                            "horizontal",
                            e.target.checked
                          )
                        }
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded border-2 mr-2 flex items-center justify-center transition-colors ${
                          config.centerContent.horizontal
                            ? "bg-blue-500 border-blue-500"
                            : "border-gray-300 dark:border-gray-500"
                        }`}
                      >
                        {config.centerContent.horizontal && (
                          <Check className="w-2 h-2 text-white" />
                        )}
                      </div>
                      <span className="text-xs text-gray-700 dark:text-gray-300">
                        Horizontal
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "plugins" && (
            <div
              className="grid grid-cols-1 gap-3"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              }}
            >
              {/* Progress Bar */}
              <div className="border border-gray-200 dark:border-gray-600 rounded-md p-2 bg-card-secondary shadow-sm">
                <div className="flex flex-col gap-3 mb-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.plugins.ProgressBar.enabled}
                      onChange={() => handlePluginToggle("ProgressBar")}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded border-2 mr-2 flex items-center justify-center transition-colors ${
                        config.plugins.ProgressBar.enabled
                          ? "bg-blue-500 border-blue-500"
                          : "border-gray-300 dark:border-gray-500"
                      }`}
                    >
                      {config.plugins.ProgressBar.enabled && (
                        <Check className="w-2 h-2 text-white" />
                      )}
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Progress Bar
                    </span>
                  </label>
                  <div className="flex flex-col gap-2">
                    {config.plugins.ProgressBar.enabled && (
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          Position:
                        </label>
                        <select
                          value={config.plugins.ProgressBar.position}
                          onChange={(e) =>
                            handlePluginConfigChange(
                              "ProgressBar",
                              "position",
                              e.target.value
                            )
                          }
                          className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-24"
                        >
                          <option value="top">Top</option>
                          <option value="bottom">Bottom</option>
                        </select>
                      </div>
                    )}

                    {config.plugins.ProgressBar.enabled && (
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          Height:
                        </label>
                        <input
                          type="text"
                          value={config.plugins.ProgressBar.height}
                          onChange={(e) =>
                            handlePluginConfigChange(
                              "ProgressBar",
                              "height",
                              e.target.value
                            )
                          }
                          className="w-24 text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="12px"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Slide Number */}
              <div className="border border-gray-200 dark:border-gray-600 rounded-md p-2 bg-card-secondary shadow-sm">
                <div className="flex flex-col gap-3 mb-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.plugins.SlideNumber.enabled}
                      onChange={() => handlePluginToggle("SlideNumber")}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded border-2 mr-2 flex items-center justify-center transition-colors ${
                        config.plugins.SlideNumber.enabled
                          ? "bg-blue-500 border-blue-500"
                          : "border-gray-300 dark:border-gray-500"
                      }`}
                    >
                      {config.plugins.SlideNumber.enabled && (
                        <Check className="w-2 h-2 text-white" />
                      )}
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Slide Number
                    </span>
                  </label>
                  <div className="flex flex-col gap-2">
                    {config.plugins.SlideNumber.enabled && (
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          Position:
                        </label>
                        <select
                          value={config.plugins.SlideNumber.position}
                          onChange={(e) =>
                            handlePluginConfigChange(
                              "SlideNumber",
                              "position",
                              e.target.value
                            )
                          }
                          className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-24"
                        >
                          <option value="bottom-left">Bottom Left</option>
                          <option value="bottom-right">Bottom Right</option>
                          <option value="bottom-center">Bottom Center</option>
                        </select>
                      </div>
                    )}

                    {config.plugins.SlideNumber.enabled && (
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          Format:
                        </label>
                        <input
                          type="text"
                          value={config.plugins.SlideNumber.format}
                          onChange={(e) =>
                            handlePluginConfigChange(
                              "SlideNumber",
                              "format",
                              e.target.value
                            )
                          }
                          className="w-24 text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="current/total"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Controller */}
              <div className="border border-gray-200 dark:border-gray-600 rounded-md p-2 bg-card-secondary shadow-sm">
                <div className="flex flex-col gap-3 mb-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.plugins.Controller.enabled}
                      onChange={() => handlePluginToggle("Controller")}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded border-2 mr-2 flex items-center justify-center transition-colors ${
                        config.plugins.Controller.enabled
                          ? "bg-blue-500 border-blue-500"
                          : "border-gray-300 dark:border-gray-500"
                      }`}
                    >
                      {config.plugins.Controller.enabled && (
                        <Check className="w-2 h-2 text-white" />
                      )}
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Controller
                    </span>
                  </label>
                  <div className="flex flex-col gap-2">
                    {config.plugins.Controller.enabled && (
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          Position:
                        </label>
                        <select
                          value={config.plugins.Controller.position}
                          onChange={(e) =>
                            handlePluginConfigChange(
                              "Controller",
                              "position",
                              e.target.value
                            )
                          }
                          className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-24"
                        >
                          <option value="bottom-left">Bottom Left</option>
                          <option value="bottom-right">Bottom Right</option>
                          <option value="bottom-center">Bottom Center</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Confetti */}
              <div className="border border-gray-200 dark:border-gray-600 rounded-md p-2 bg-card-secondary shadow-sm">
                <div className="flex flex-col gap-3 mb-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.plugins.Confetti.enabled}
                      onChange={() => handlePluginToggle("Confetti")}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded border-2 mr-2 flex items-center justify-center transition-colors ${
                        config.plugins.Confetti.enabled
                          ? "bg-blue-500 border-blue-500"
                          : "border-gray-300 dark:border-gray-500"
                      }`}
                    >
                      {config.plugins.Confetti.enabled && (
                        <Check className="w-2 h-2 text-white" />
                      )}
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Confetti
                    </span>
                  </label>
                  <div className="flex flex-col gap-2">
                    {config.plugins.Confetti.enabled && (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            Particles: {config.plugins.Confetti.particleCount}
                          </label>
                          <input
                            type="range"
                            min="10"
                            max="100"
                            step="10"
                            value={config.plugins.Confetti.particleCount}
                            onChange={(e) =>
                              handlePluginConfigChange(
                                "Confetti",
                                "particleCount",
                                parseInt(e.target.value)
                              )
                            }
                            className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-md appearance-none cursor-pointer slider"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            Duration: {config.plugins.Confetti.duration}ms
                          </label>
                          <input
                            type="range"
                            min="1000"
                            max="5000"
                            step="500"
                            value={config.plugins.Confetti.duration}
                            onChange={(e) =>
                              handlePluginConfigChange(
                                "Confetti",
                                "duration",
                                parseInt(e.target.value)
                              )
                            }
                            className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-md appearance-none cursor-pointer slider"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "header-footer" && (
            <div
              className="grid grid-cols-1 gap-3"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              }}
            >
              {/* Header Settings */}
              <div className="border border-gray-200 dark:border-gray-600 rounded-md p-2 bg-card-secondary shadow-sm">
                <div className="flex flex-col gap-3 mb-3">
                  <label className="flex items-center cursor-pointer">
                    {/* <input
                        type="checkbox"
                        checked={config.header.enabled}
                        onChange={() =>
                          handleHeaderChange("enabled", !config.header.enabled)
                        }
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded border-2 mr-2 flex items-center justify-center transition-colors ${
                          config.header.enabled
                            ? "bg-blue-500 border-blue-500"
                            : "border-gray-300 dark:border-gray-500"
                        }`}
                      >
                        {config.header.enabled && (
                          <Check className="w-2 h-2 text-white" />
                        )}
                      </div> */}
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Header
                    </span>
                  </label>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.header.showOnFirstSlide}
                        onChange={(e) =>
                          handleHeaderChange(
                            "showOnFirstSlide",
                            e.target.checked
                          )
                        }
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded border-2 mr-2 flex items-center justify-center transition-colors ${
                          config.header.showOnFirstSlide
                            ? "bg-blue-500 border-blue-500"
                            : "border-gray-300 dark:border-gray-500"
                        }`}
                      >
                        {config.header.showOnFirstSlide && (
                          <Check className="w-2 h-2 text-white" />
                        )}
                      </div>
                      <span className="text-xs text-gray-700 dark:text-gray-300">
                        Show on First Slide
                      </span>
                    </label>

                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        Position:
                      </label>
                      <select
                        value={config.header.position}
                        onChange={(e) =>
                          handleHeaderChange("position", e.target.value)
                        }
                        className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-24"
                      >
                        <option value="top-left">Top Left</option>
                        <option value="top-center">Top Center</option>
                        <option value="top-right">Top Right</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">
                    Content
                  </label>
                  <textarea
                    value={config.header.content}
                    onChange={(e) =>
                      handleHeaderChange("content", e.target.value)
                    }
                    className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter header content (Markdown, HTML, or Text)"
                    rows={3}
                  />
                </div>
              </div>

              {/* Footer Settings */}
              <div className="border border-gray-200 dark:border-gray-600 rounded-md p-2 bg-card-secondary shadow-sm">
                <div className="flex flex-col gap-3 mb-3">
                  <label className="flex items-center cursor-pointer">
                    {/* <input
                        type="checkbox"
                        checked={config.footer.enabled}
                        onChange={() =>
                          handleFooterChange("enabled", !config.footer.enabled)
                        }
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded border-2 mr-2 flex items-center justify-center transition-colors ${
                          config.footer.enabled
                            ? "bg-blue-500 border-blue-500"
                            : "border-gray-300 dark:border-gray-500"
                        }`}
                      >
                        {config.footer.enabled && (
                          <Check className="w-2 h-2 text-white" />
                        )}
                      </div> */}
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Footer
                    </span>
                  </label>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.footer.showOnFirstSlide}
                        onChange={(e) =>
                          handleFooterChange(
                            "showOnFirstSlide",
                            e.target.checked
                          )
                        }
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded border-2 mr-2 flex items-center justify-center transition-colors ${
                          config.footer.showOnFirstSlide
                            ? "bg-blue-500 border-blue-500"
                            : "border-gray-300 dark:border-gray-500"
                        }`}
                      >
                        {config.footer.showOnFirstSlide && (
                          <Check className="w-2 h-2 text-white" />
                        )}
                      </div>
                      <span className="text-xs text-gray-700 dark:text-gray-300">
                        Show on First Slide
                      </span>
                    </label>

                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        Position:
                      </label>
                      <select
                        value={config.footer.position}
                        onChange={(e) =>
                          handleFooterChange("position", e.target.value)
                        }
                        className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-24"
                      >
                        <option value="bottom-left">Bottom Left</option>
                        <option value="bottom-center">Bottom Center</option>
                        <option value="bottom-right">Bottom Right</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">
                    Content
                  </label>
                  <textarea
                    value={config.footer.content}
                    onChange={(e) =>
                      handleFooterChange("content", e.target.value)
                    }
                    className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter footer content (Markdown, HTML, or Text)"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "background" && (
            <div
              className="grid grid-cols-1 gap-3"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              }}
            >
              {/* Background Images */}
              {config.background && config.background.length > 0 ? (
                config.background.map((bg, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 dark:border-gray-600 rounded-md p-2 bg-card-secondary shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Background {index + 1}
                      </span>
                      <button
                        onClick={() => {
                          const newBackgrounds =
                            config.background?.filter((_, i) => i !== index) ||
                            [];
                          onConfigChange({
                            ...config,
                            background: newBackgrounds,
                          });
                        }}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          Image URL:
                        </label>
                        <input
                          type="text"
                          value={bg.imagePath}
                          onChange={(e) => {
                            const newBackgrounds = [
                              ...(config.background || []),
                            ];
                            newBackgrounds[index] = {
                              ...newBackgrounds[index],
                              imagePath: e.target.value,
                            };
                            onConfigChange({
                              ...config,
                              background: newBackgrounds,
                            });
                          }}
                          className="w-full flex-1 text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://example.com/image.jpg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setUnsplashTargetIndex(index);
                            setShowUnsplashModal(true);
                          }}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors touch-manipulation whitespace-nowrap"
                          title="Search Images from Unsplash"
                        >
                          <ImagePlus className="w-3 h-3" />
                          <span className="hidden sm:inline">Unsplash</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          Size:
                        </label>
                        <select
                          value={bg.size}
                          onChange={(e) => {
                            const newBackgrounds = [
                              ...(config.background || []),
                            ];
                            newBackgrounds[index] = {
                              ...newBackgrounds[index],
                              size: e.target.value,
                            };
                            onConfigChange({
                              ...config,
                              background: newBackgrounds,
                            });
                          }}
                          className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-24"
                        >
                          <option value="cover">Cover</option>
                          <option value="contain">Contain</option>
                          <option value="auto">Auto</option>
                          <option value="100%">100%</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          Position:
                        </label>
                        <select
                          value={bg.position}
                          onChange={(e) => {
                            const newBackgrounds = [
                              ...(config.background || []),
                            ];
                            newBackgrounds[index] = {
                              ...newBackgrounds[index],
                              position: e.target.value as typeof bg.position,
                            };
                            onConfigChange({
                              ...config,
                              background: newBackgrounds,
                            });
                          }}
                          className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-24"
                        >
                          <option value="top-left">Top Left</option>
                          <option value="top-center">Top Center</option>
                          <option value="top-right">Top Right</option>
                          <option value="center">Center</option>
                          <option value="bottom-left">Bottom Left</option>
                          <option value="bottom-center">Bottom Center</option>
                          <option value="bottom-right">Bottom Right</option>
                          <option value="left">Left</option>
                          <option value="right">Right</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          Repeat:
                        </label>
                        <select
                          value={bg.repeat}
                          onChange={(e) => {
                            const newBackgrounds = [
                              ...(config.background || []),
                            ];
                            newBackgrounds[index] = {
                              ...newBackgrounds[index],
                              repeat: e.target.value as typeof bg.repeat,
                            };
                            onConfigChange({
                              ...config,
                              background: newBackgrounds,
                            });
                          }}
                          className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-24"
                        >
                          <option value="no-repeat">No Repeat</option>
                          <option value="repeat">Repeat</option>
                          <option value="repeat-x">Repeat X</option>
                          <option value="repeat-y">Repeat Y</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          Background Color:
                        </label>
                        <input
                          type="color"
                          value={bg.bgColor}
                          onChange={(e) => {
                            const newBackgrounds = [
                              ...(config.background || []),
                            ];
                            newBackgrounds[index] = {
                              ...newBackgrounds[index],
                              bgColor: e.target.value,
                            };
                            onConfigChange({
                              ...config,
                              background: newBackgrounds,
                            });
                          }}
                          className="w-8 h-6 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={bg.global || false}
                            onChange={(e) => {
                              const newBackgrounds = [
                                ...(config.background || []),
                              ];
                              newBackgrounds[index] = {
                                ...newBackgrounds[index],
                                global: e.target.checked,
                                allSlides: e.target.checked
                                  ? undefined
                                  : newBackgrounds[index].allSlides,
                                allSlidesExcept: e.target.checked
                                  ? undefined
                                  : newBackgrounds[index].allSlidesExcept,
                              };
                              onConfigChange({
                                ...config,
                                background: newBackgrounds,
                              });
                            }}
                            className="sr-only"
                          />
                          <div
                            className={`w-4 h-4 rounded border-2 mr-2 flex items-center justify-center transition-colors ${
                              bg.global
                                ? "bg-blue-500 border-blue-500"
                                : "border-gray-300 dark:border-gray-500"
                            }`}
                          >
                            {bg.global && (
                              <Check className="w-2 h-2 text-white" />
                            )}
                          </div>
                          <span className="text-xs text-gray-700 dark:text-gray-300">
                            Apply to all slides (Global)
                          </span>
                        </label>

                        {!bg.global && (
                          <>
                            <div className="flex items-center gap-2">
                              <label className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                Apply to slides:
                              </label>
                              <input
                                type="text"
                                value={
                                  inputValues[`allSlides-${index}`] !==
                                  undefined
                                    ? inputValues[`allSlides-${index}`]
                                    : bg.allSlides
                                    ? bg.allSlides.join(", ")
                                    : ""
                                }
                                onChange={(e) => {
                                  setInputValues((prev) => ({
                                    ...prev,
                                    [`allSlides-${index}`]: e.target.value,
                                  }));
                                }}
                                onBlur={(e) => {
                                  const inputValue = e.target.value.trim();
                                  if (inputValue === "") {
                                    const newBackgrounds = [
                                      ...(config.background || []),
                                    ];
                                    newBackgrounds[index] = {
                                      ...newBackgrounds[index],
                                      allSlides: undefined,
                                    };
                                    onConfigChange({
                                      ...config,
                                      background: newBackgrounds,
                                    });
                                    setInputValues((prev) => ({
                                      ...prev,
                                      [`allSlides-${index}`]: "",
                                    }));
                                    return;
                                  }

                                  const slides = inputValue
                                    .split(/[,\s]+/)
                                    .map((s) => parseInt(s.trim()))
                                    .filter((n) => !isNaN(n) && n > 0);

                                  const newBackgrounds = [
                                    ...(config.background || []),
                                  ];
                                  newBackgrounds[index] = {
                                    ...newBackgrounds[index],
                                    allSlides:
                                      slides.length > 0 ? slides : undefined,
                                  };
                                  onConfigChange({
                                    ...config,
                                    background: newBackgrounds,
                                  });
                                }}
                                className="w-full flex-1 text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="1, 2, 3 (slide numbers)"
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <label className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                Apply to all except:
                              </label>
                              <input
                                type="text"
                                value={
                                  inputValues[`allSlidesExcept-${index}`] !==
                                  undefined
                                    ? inputValues[`allSlidesExcept-${index}`]
                                    : bg.allSlidesExcept
                                    ? bg.allSlidesExcept.join(", ")
                                    : ""
                                }
                                onChange={(e) => {
                                  setInputValues((prev) => ({
                                    ...prev,
                                    [`allSlidesExcept-${index}`]:
                                      e.target.value,
                                  }));
                                }}
                                onBlur={(e) => {
                                  const inputValue = e.target.value.trim();
                                  if (inputValue === "") {
                                    const newBackgrounds = [
                                      ...(config.background || []),
                                    ];
                                    newBackgrounds[index] = {
                                      ...newBackgrounds[index],
                                      allSlidesExcept: undefined,
                                    };
                                    onConfigChange({
                                      ...config,
                                      background: newBackgrounds,
                                    });
                                    setInputValues((prev) => ({
                                      ...prev,
                                      [`allSlidesExcept-${index}`]: "",
                                    }));
                                    return;
                                  }

                                  const slides = inputValue
                                    .split(/[,\s]+/)
                                    .map((s) => parseInt(s.trim()))
                                    .filter((n) => !isNaN(n) && n > 0);

                                  const newBackgrounds = [
                                    ...(config.background || []),
                                  ];
                                  newBackgrounds[index] = {
                                    ...newBackgrounds[index],
                                    allSlidesExcept:
                                      slides.length > 0 ? slides : undefined,
                                  };
                                  onConfigChange({
                                    ...config,
                                    background: newBackgrounds,
                                  });
                                }}
                                className="w-full flex-1 text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="1, 2, 3 (exclude these)"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full border border-gray-200 dark:border-gray-600 rounded-md p-4 bg-card-secondary shadow-sm">
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">
                    No background images configured
                  </div>
                </div>
              )}

              {/* Add Background Button */}
              <div className="col-span-full">
                <button
                  onClick={() => {
                    const newBackground = {
                      imagePath: "",
                      size: "cover" as const,
                      position: "center" as const,
                      repeat: "no-repeat" as const,
                      bgColor: "#000000",
                      global: true,
                      allSlides: undefined,
                    };
                    onConfigChange({
                      ...config,
                      background: [...(config.background || []), newBackground],
                    });
                  }}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-xs font-medium w-full"
                >
                  <span>+</span>
                  Add Background
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Configuration Actions */}
        <div className="mt-3"></div>
      </div>

      {/* Unsplash Image Modal */}
      <UnsplashImageModal
        isOpen={showUnsplashModal}
        onClose={() => {
          setShowUnsplashModal(false);
          setUnsplashTargetIndex(null);
        }}
        mode="url-only"
        onSelectUrl={(url) => {
          if (unsplashTargetIndex !== null) {
            const newBackgrounds = [...(config.background || [])];
            if (newBackgrounds[unsplashTargetIndex]) {
              newBackgrounds[unsplashTargetIndex] = {
                ...newBackgrounds[unsplashTargetIndex],
                imagePath: url,
              };
              onConfigChange({
                ...config,
                background: newBackgrounds,
              });
            }
          }
          setShowUnsplashModal(false);
          setUnsplashTargetIndex(null);
        }}
        onInsertContent={() => {}} // Not used in url-only mode
      />
    </div>
  );
};
