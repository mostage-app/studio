import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield, Database, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy - Mostage App",
  description: "Privacy policy and data protection information for Mostage App",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8 mb-20">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Mostage App
          </Link>

          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Privacy Policy
            </h1>
          </div>

          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Last updated: October 2025
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-6">
          {/* Introduction */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Introduction
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm mb-3">
              Mostage App respects your privacy. This policy explains how we
              collect and use data to improve our service.
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1 text-sm">
                Data Controller
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Mostage App (Open Source Project)
                <br />
                Contact: GitHub Repository
              </p>
            </div>
          </section>

          {/* Data Collection */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              What We Collect
            </h2>

            <div className="space-y-3">
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-1 text-sm">
                  With Your Consent
                </h3>
                <ul className="text-green-700 dark:text-green-300 text-sm space-y-1">
                  <li>• Page views and usage patterns</li>
                  <li>• Feature usage (export, import, AI)</li>
                  <li>• Theme preferences</li>
                  <li>• Anonymized IP addresses</li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-1 text-sm">
                  Always (Essential)
                </h3>
                <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
                  <li>• Your presentation content (stored locally)</li>
                  <li>• Editor settings and preferences</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Legal Basis & Retention */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Legal Basis & Data Retention
            </h2>
            <div className="space-y-3">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-1 text-sm">
                  Legal Basis
                </h3>
                <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
                  <li>
                    • <strong>Consent:</strong> Analytics data (you can opt out)
                  </li>
                  <li>
                    • <strong>Legitimate Interest:</strong> Essential site
                    functionality
                  </li>
                </ul>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-1 text-sm">
                  Data Retention
                </h3>
                <ul className="text-purple-700 dark:text-purple-300 text-sm space-y-1">
                  <li>
                    • <strong>Analytics:</strong> 26 months (Google Analytics
                    default)
                  </li>
                  <li>
                    • <strong>Local Data:</strong> Until you clear browser data
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* What We Don't Collect */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-600" />
              What We DON&apos;T Collect
            </h2>
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              <ul className="text-red-700 dark:text-red-300 text-sm space-y-1">
                <li>• Personal information (names, emails)</li>
                <li>• Your document content (unless you save/share)</li>
                <li>• Exact IP addresses</li>
                <li>• Cross-site tracking data</li>
              </ul>
            </div>
          </section>

          {/* Data Transfer */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Data Transfer
            </h2>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                <strong>International Transfer:</strong> Analytics data may be
                transferred to Google servers in the United States. Google
                provides adequate protection through Standard Contractual
                Clauses.
              </p>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Your Rights (GDPR)
            </h2>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  <strong>Right to Access:</strong> Request information about
                  your data
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  <strong>Right to Rectification:</strong> Correct inaccurate
                  data
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  <strong>Right to Erasure:</strong> Request deletion of your
                  data
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  <strong>Right to Withdraw Consent:</strong> Opt out of
                  analytics anytime
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  <strong>Right to Object:</strong> Object to data processing
                </p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Contact Us
            </h2>
            <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
              Questions about this policy? Contact us through our GitHub
              repository.
            </p>
            <a
              href="https://github.com/mostage-app/studio"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline text-sm"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub Repository
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
