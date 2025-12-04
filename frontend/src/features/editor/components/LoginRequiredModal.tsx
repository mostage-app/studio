"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  QrCode,
  BarChart3,
  HelpCircle,
  MessageSquare,
  LogIn,
  Package,
  Cloud,
  Sparkles,
} from "lucide-react";
import { Modal } from "@/lib/components/ui/Modal";
import { useAuthContext } from "@/features/auth/components/AuthProvider";

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuthModal: () => void;
}

const features = [
  {
    name: "AI Content Generator",
    description: "Generate presentation content with AI assistance",
    icon: Sparkles,
    color: "purple",
  },
  {
    name: "Cloud Storage",
    description: "Cloud storage to collaborate with your team in real-time",
    icon: Cloud,
    color: "blue",
  },
  {
    name: "QR Code",
    description: "Generate QR codes for presentations",
    icon: QrCode,
    color: "green",
  },
  {
    name: "Live Polling",
    description: "Create interactive polls for audience",
    icon: BarChart3,
    color: "purple",
  },
  {
    name: "Live Quiz",
    description: "Add quizzes to test audience knowledge",
    icon: HelpCircle,
    color: "orange",
  },
  {
    name: "Q&A Session",
    description: "Enable audience questions and answers",
    icon: MessageSquare,
    color: "indigo",
  },
];

export function LoginRequiredModal({
  isOpen,
  onClose,
  onOpenAuthModal,
}: LoginRequiredModalProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthContext();

  const handleLoginClick = () => {
    onClose();
    onOpenAuthModal();
  };

  const handleUpgradeClick = () => {
    if (user?.username) {
      router.push(`/${user.username}`);
    }
    onClose();
  };

  const headerContent = (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="p-1.5 sm:p-2 bg-orange-100 dark:bg-orange-900/30 rounded-md">
        {isAuthenticated ? (
          <Package className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" />
        ) : (
          <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" />
        )}
      </div>
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-foreground">
          {isAuthenticated ? "Plan Upgrade Required" : "Login Required"}
        </h2>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      headerContent={headerContent}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Main Message */}
        <div className="space-y-2">
          {isAuthenticated ? (
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              These interactive features are not available with Basic Plan.
              Please upgrade your plan to access these features.
            </p>
          ) : (
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              You need to log in to use these interactive features.
            </p>
          )}
        </div>

        {/* Features List */}
        <div className="space-y-2 sm:space-y-3">
          <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">
            Features that require plan upgrade:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;

              // Define color classes for each feature
              const getColorClasses = (color: string) => {
                switch (color) {
                  case "blue":
                    return {
                      bg: "bg-blue-100 dark:bg-blue-900/30",
                      text: "text-blue-600 dark:text-blue-400",
                    };
                  case "green":
                    return {
                      bg: "bg-green-100 dark:bg-green-900/30",
                      text: "text-green-600 dark:text-green-400",
                    };
                  case "purple":
                    return {
                      bg: "bg-purple-100 dark:bg-purple-900/30",
                      text: "text-purple-600 dark:text-purple-400",
                    };
                  case "orange":
                    return {
                      bg: "bg-orange-100 dark:bg-orange-900/30",
                      text: "text-orange-600 dark:text-orange-400",
                    };
                  case "indigo":
                    return {
                      bg: "bg-indigo-100 dark:bg-indigo-900/30",
                      text: "text-indigo-600 dark:text-indigo-400",
                    };
                  default:
                    return {
                      bg: "bg-blue-100 dark:bg-blue-900/30",
                      text: "text-blue-600 dark:text-blue-400",
                    };
                }
              };

              const colorClasses = getColorClasses(feature.color);

              return (
                <div
                  key={index}
                  className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-sm border border-gray-200 dark:border-gray-600"
                >
                  <div
                    className={`p-1.5 sm:p-2 ${colorClasses.bg} rounded-md flex-shrink-0`}
                  >
                    <IconComponent
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${colorClasses.text}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">
                      {feature.name}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
          <button
            onClick={onClose}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors font-medium"
          >
            Cancel
          </button>
          {isAuthenticated ? (
            <button
              onClick={handleUpgradeClick}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Package className="w-4 h-4" />
              Upgrade Plan
            </button>
          ) : (
            <button
              onClick={handleLoginClick}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <LogIn className="w-4 h-4" />
              Login Now
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
