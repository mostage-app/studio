"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Loader2, X } from "lucide-react";

import { Modal } from "@/lib/components/ui/Modal";
import { analytics } from "@/lib/utils/analytics";

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertContent?: (content: string) => void;
  onOpenAuthModal?: () => void;
}

export function AIModal({
  isOpen,
  onClose,
  onInsertContent,
  onOpenAuthModal,
}: AIModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [showAuthError, setShowAuthError] = useState(false);

  // Track AI modal open
  React.useEffect(() => {
    if (isOpen) {
      analytics.trackAIUsage("modal_open");
    }
  }, [isOpen]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    // Track AI usage with prompt
    analytics.trackAIUsage("generate_content", prompt);

    // Show authentication error instead of generating content
    setShowAuthError(true);
    return;

    // Original generation logic (commented out for now)
    // setIsGenerating(true);
    // setError("");

    // try {
    //   // Simulate AI generation with realistic delay
    //   await new Promise((resolve) => setTimeout(resolve, 3000));

    //   // Generate more realistic content based on prompt
    //   const keywords = prompt
    //     .toLowerCase()
    //     .split(" ")
    //     .filter((word) => word.length > 3);
    //   const mainTopic = keywords[0] || "presentation";

    //   setGeneratedContent(`# ${
    //     mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)
    //   } Presentation

    // ## Overview
    // ${prompt}

    // ---

    // ## Introduction

    // ### This is test

    // ---

    // ## Key Points

    // ### This is another test

    // ---

    // ## Next Steps
    // 1. Review and refine the content
    // 2. Add your specific examples
    // 3. Include relevant data and statistics
    // 4. Practice your delivery
    // `);
    // } catch (err) {
    //   setError("Failed to generate content. Please try again.");
    //   console.error("AI generation failed:", err);
    // } finally {
    //   setIsGenerating(false);
    // }
  };

  const handleInsert = () => {
    if (generatedContent && onInsertContent) {
      // Track AI content insertion with content length
      analytics.trackAIUsage(
        "insert_content",
        undefined,
        generatedContent.length
      );
      onInsertContent(generatedContent);
      handleClose();
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      // Track copy action with content length
      analytics.trackAIUsage(
        "copy_content",
        undefined,
        generatedContent.length
      );
    } catch {
      console.error("Failed to copy content");
    }
  };

  const handleSignInClick = () => {
    setShowAuthError(false);
    setPrompt("");
    onClose();
    onOpenAuthModal?.();
  };

  const handleClose = () => {
    // Reset all states when modal closes
    setGeneratedContent("");
    setPrompt("");
    setError("");
    setCopied(false);
    setIsGenerating(false);
    setShowAuthError(false);
    onClose();
  };

  // Reset error when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowAuthError(false);
    }
  }, [isOpen]);

  const headerContent = (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-md">
        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
      </div>
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-foreground">
          AI Content Generator
        </h2>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      headerContent={headerContent}
      maxWidth="4xl"
    >
      {/* Prompt Input */}
      <div className="mb-4">
        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Describe what you want to create:
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., Create a presentation about renewable energy with 5 slides covering benefits, challenges, and future outlook..."
          className="w-full h-24 sm:h-32 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
          disabled={isGenerating}
        />
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-500">
            {prompt.length}/500 characters
          </span>
          <button
            onClick={() => setPrompt("")}
            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!prompt.trim() || isGenerating}
        className={`w-full text-white font-medium py-2 sm:py-3 px-4 sm:px-6 text-sm sm:text-base rounded-md transition-all duration-200 flex items-center justify-center gap-2 shadow-md bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 hover:shadow-xl`}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating content...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Generate Content
          </>
        )}
      </button>

      {/* Authentication Error */}
      {showAuthError && (
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="p-1 bg-red-100 dark:bg-red-900/30 rounded">
              <X className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-medium text-red-800 dark:text-red-200 mb-1">
                Authentication Required
              </h4>
              <p className="text-xs sm:text-sm text-red-700 dark:text-red-300">
                AI Content Generation requires authentication. Please{" "}
                <button
                  onClick={handleSignInClick}
                  className="underline hover:no-underline font-medium"
                >
                  sign in
                </button>{" "}
                to continue.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-red-800 dark:text-red-200">
            {error}
          </p>
        </div>
      )}

      {/* Generated Content */}
      {generatedContent && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
              Generated Content:
            </label>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-md border border-gray-200 dark:border-gray-600 max-h-80 sm:max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-xs sm:text-sm text-gray-800 dark:text-gray-200 font-mono leading-relaxed">
              {generatedContent}
            </pre>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
            {/* <button
              onClick={handleClear}
              className="bg-secondary hover:bg-primary/90 text-secondary-foreground py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
            >
              New Prompt
            </button> */}
            <button
              onClick={handleCopy}
              className="bg-secondary hover:bg-primary/90 text-secondary-foreground py-2 px-3 sm:px-4 text-sm sm:text-base rounded-md transition-colors flex items-center justify-center gap-2"
            >
              {copied ? <>Copied!</> : <>Copy</>}
            </button>
            <button
              onClick={handleInsert}
              className="bg-primary hover:bg-primary/90 text-primary-foreground py-2 px-3 sm:px-4 text-sm sm:text-base rounded-md transition-colors flex items-center justify-center gap-2"
            >
              Insert to the editor
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
