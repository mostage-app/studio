import type { Metadata } from "next";
import { Shield, Database, Lock, User, FileText, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy - Mostage Studio",
  description:
    "Privacy policy and data protection information for Mostage Studio",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="h-full overflow-auto bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Privacy Policy
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Last updated: November 2025
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-card border border-input rounded-lg shadow-sm p-6 sm:p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Introduction
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Mostage Studio ("we", "our", "us") respects your privacy and is
              committed to protecting your personal data. This privacy policy
              explains how we collect, use, and safeguard your information when
              you use our service.
            </p>
            <div className="bg-muted border border-input p-4 rounded-lg">
              <h3 className="font-semibold text-foreground mb-2">
                Data Controller
              </h3>
              <p className="text-sm text-muted-foreground">
                Mostage Studio (Open Source Project)
                <br />
                Contact:{" "}
                <a
                  href="https://github.com/mostage-app/studio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  GitHub Repository
                </a>
              </p>
            </div>
          </section>

          {/* Data Collection */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              What We Collect
            </h2>

            <div className="space-y-4">
              {/* Account Data */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200">
                    Account Information
                  </h3>
                </div>
                <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1.5 ml-6">
                  <li>
                    • Email address (for account creation and authentication)
                  </li>
                  <li>• Username (publicly visible)</li>
                  <li>• Display name (optional, editable)</li>
                  <li>• Account creation and last login timestamps</li>
                </ul>
              </div>

              {/* Presentation Data */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <h3 className="font-semibold text-green-800 dark:text-green-200">
                    Presentation Data
                  </h3>
                </div>
                <ul className="text-green-700 dark:text-green-300 text-sm space-y-1.5 ml-6">
                  <li>• Presentation content (markdown and configuration)</li>
                  <li>• Presentation name and URL slug</li>
                  <li>• Visibility settings (Public/Private)</li>
                  <li>• Creation and modification timestamps</li>
                </ul>
                <p className="text-green-600 dark:text-green-400 text-xs mt-2 ml-6">
                  Note: Private presentations are only accessible to you. Public
                  presentations are visible to anyone with the URL.
                </p>
              </div>

              {/* Analytics Data */}
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <h3 className="font-semibold text-purple-800 dark:text-purple-200">
                    Analytics Data (With Consent)
                  </h3>
                </div>
                <ul className="text-purple-700 dark:text-purple-300 text-sm space-y-1.5 ml-6">
                  <li>• Page views and usage patterns</li>
                  <li>• Feature usage (export, import, AI generation)</li>
                  <li>• Theme preferences</li>
                  <li>• Anonymized IP addresses</li>
                </ul>
                <p className="text-purple-600 dark:text-purple-400 text-xs mt-2 ml-6">
                  You can opt out of analytics at any time through Privacy
                  Settings.
                </p>
              </div>
            </div>
          </section>

          {/* Data Storage */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Data Storage & Security
            </h2>
            <div className="space-y-4">
              <div className="bg-muted border border-input p-4 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">
                  Where Your Data is Stored
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1.5">
                  <li>
                    • <strong>Account & Presentation Data:</strong> Stored
                    securely in AWS DynamoDB (encrypted at rest)
                  </li>
                  <li>
                    • <strong>Authentication:</strong> Handled by AWS Cognito
                    (industry-standard security)
                  </li>
                  <li>
                    • <strong>Analytics:</strong> Google Analytics 4 (anonymized
                    data only)
                  </li>
                </ul>
              </div>
              <div className="bg-muted border border-input p-4 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">
                  Security Measures
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1.5">
                  <li>
                    • All data transmitted over HTTPS (SSL/TLS encryption)
                  </li>
                  <li>
                    • Database encryption at rest (AWS managed encryption)
                  </li>
                  <li>• JWT token-based authentication</li>
                  <li>• No storage of passwords (handled by AWS Cognito)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Legal Basis & Retention */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Legal Basis & Data Retention
            </h2>
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  Legal Basis
                </h3>
                <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1.5">
                  <li>
                    • <strong>Consent:</strong> Analytics data (you can opt out
                    anytime)
                  </li>
                  <li>
                    • <strong>Contract Performance:</strong> Account and
                    presentation data necessary for service delivery
                  </li>
                  <li>
                    • <strong>Legitimate Interest:</strong> Essential site
                    functionality and security
                  </li>
                </ul>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
                  Data Retention
                </h3>
                <ul className="text-purple-700 dark:text-purple-300 text-sm space-y-1.5">
                  <li>
                    • <strong>Account Data:</strong> Retained until account
                    deletion
                  </li>
                  <li>
                    • <strong>Presentation Data:</strong> Retained until
                    presentation deletion or account deletion
                  </li>
                  <li>
                    • <strong>Analytics:</strong> 26 months (Google Analytics
                    default)
                  </li>
                  <li>
                    • <strong>Local Storage:</strong> Until you clear browser
                    data
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* What We Don't Collect */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-500" />
              What We DON&apos;T Collect
            </h2>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
              <ul className="text-red-700 dark:text-red-300 text-sm space-y-1.5">
                <li>• Payment or financial information</li>
                <li>• Location data (except anonymized IP for analytics)</li>
                <li>• Device identifiers or tracking cookies</li>
                <li>• Third-party social media data</li>
                <li>• Cross-site tracking data</li>
              </ul>
            </div>
          </section>

          {/* Data Transfer */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Data Transfer
            </h2>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                <strong>International Transfer:</strong> Analytics data may be
                transferred to Google servers in the United States. Google
                provides adequate protection through Standard Contractual
                Clauses. Your account and presentation data is stored in AWS
                data centers (EU region by default).
              </p>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Your Rights (GDPR & CCPA)
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-muted-foreground text-sm">
                  <strong className="text-foreground">Right to Access:</strong>{" "}
                  Request information about your data
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-muted-foreground text-sm">
                  <strong className="text-foreground">
                    Right to Rectification:
                  </strong>{" "}
                  Edit your profile and presentation data
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-muted-foreground text-sm">
                  <strong className="text-foreground">Right to Erasure:</strong>{" "}
                  Delete your account and all associated data
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-muted-foreground text-sm">
                  <strong className="text-foreground">
                    Right to Withdraw Consent:
                  </strong>{" "}
                  Opt out of analytics anytime through Privacy Settings
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-muted-foreground text-sm">
                  <strong className="text-foreground">
                    Right to Data Portability:
                  </strong>{" "}
                  Export your presentations in various formats
                </p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Contact Us
            </h2>
            <p className="text-muted-foreground text-sm mb-4">
              Questions about this policy or want to exercise your rights?
              Contact us through our GitHub repository.
            </p>
            <a
              href="https://github.com/mostage-app/studio"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 underline transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span>GitHub Repository</span>
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
