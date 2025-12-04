import type { Metadata } from "next";
import { Scale, AlertTriangle, Shield, FileText, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service - Mostage Studio",
  description: "Terms of service and usage agreement for Mostage Studio",
};

export default function TermsOfServicePage() {
  return (
    <div className="h-full overflow-auto bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Terms of Service
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
              Welcome to Mostage Studio. These Terms of Service
              (&quot;Terms&quot;) govern your access to and use of our service.
              By creating an account or using Mostage Studio, you agree to be
              bound by these Terms.
            </p>
            <div className="bg-muted border border-input p-4 rounded-lg">
              <h3 className="font-semibold text-foreground mb-2">
                Service Provider
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

          {/* Acceptance of Terms */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary" />
              Acceptance of Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              By accessing or using Mostage Studio, you acknowledge that you
              have read, understood, and agree to be bound by these Terms. If
              you do not agree to these Terms, you may not use our service.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                <strong>Important:</strong> These Terms may be updated from time
                to time. Continued use of the service after changes constitutes
                acceptance of the updated Terms.
              </p>
            </div>
          </section>

          {/* Account Requirements */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Account Requirements
            </h2>
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                  Eligibility
                </h3>
                <ul className="text-green-700 dark:text-green-300 text-sm space-y-1.5">
                  <li>
                    • You must be at least 13 years old to use this service
                  </li>
                  <li>
                    • You must provide accurate and complete information when
                    creating an account
                  </li>
                  <li>
                    • You are responsible for maintaining the security of your
                    account credentials
                  </li>
                  <li>
                    • You must not share your account with others or allow
                    others to access your account
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  Account Responsibilities
                </h3>
                <ul className="text-yellow-700 dark:text-yellow-300 text-sm space-y-1.5">
                  <li>
                    • You are responsible for all activities that occur under
                    your account
                  </li>
                  <li>
                    • You must notify us immediately of any unauthorized access
                    to your account
                  </li>
                  <li>
                    • You may not use the service for any illegal or
                    unauthorized purpose
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Acceptable Use */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Acceptable Use
            </h2>
            <div className="space-y-4">
              <div className="bg-muted border border-input p-4 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">
                  Permitted Uses
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1.5">
                  <li>• Creating and managing presentations</li>
                  <li>
                    • Sharing presentations with others (public or private)
                  </li>
                  <li>• Exporting presentations in various formats</li>
                  <li>• Using AI features to enhance your presentations</li>
                </ul>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <h3 className="font-semibold text-red-800 dark:text-red-200">
                    Prohibited Activities
                  </h3>
                </div>
                <ul className="text-red-700 dark:text-red-300 text-sm space-y-1.5">
                  <li>
                    • Uploading or sharing content that is illegal, harmful, or
                    violates others&apos; rights
                  </li>
                  <li>
                    • Attempting to gain unauthorized access to the service or
                    other users&apos; accounts
                  </li>
                  <li>
                    • Using the service to transmit malware, viruses, or
                    malicious code
                  </li>
                  <li>
                    • Reverse engineering, decompiling, or attempting to extract
                    the source code
                  </li>
                  <li>
                    • Using automated systems (bots, scrapers) to access the
                    service without permission
                  </li>
                  <li>• Impersonating others or providing false information</li>
                  <li>
                    • Spamming, harassing, or abusing other users or the service
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Content Ownership */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Content Ownership & License
            </h2>
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  Your Content
                </h3>
                <p className="text-blue-700 dark:text-blue-300 text-sm mb-2">
                  You retain all ownership rights to the content you create and
                  upload to Mostage Studio. You are solely responsible for your
                  content and its legality.
                </p>
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  By using the service, you grant us a limited, non-exclusive
                  license to store, process, and display your content solely for
                  the purpose of providing the service to you.
                </p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
                  Service Content
                </h3>
                <p className="text-purple-700 dark:text-purple-300 text-sm">
                  The service itself, including its design, features, and
                  functionality, is protected by copyright and other
                  intellectual property laws. Mostage Studio is an open-source
                  project, and the source code is available under its respective
                  license.
                </p>
              </div>
            </div>
          </section>

          {/* Service Availability */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Service Availability
            </h2>
            <div className="bg-muted border border-input p-4 rounded-lg">
              <p className="text-muted-foreground text-sm mb-2">
                We strive to provide a reliable service, but we do not guarantee
                uninterrupted or error-free operation. The service may be
                temporarily unavailable due to:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1.5 ml-4">
                <li>• Scheduled maintenance</li>
                <li>• Technical issues or outages</li>
                <li>• Force majeure events</li>
                <li>• Updates or improvements to the service</li>
              </ul>
            </div>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Account Termination
            </h2>
            <div className="space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  By You
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                  You may delete your account at any time through your account
                  settings. Upon deletion, your account data and presentations
                  will be permanently removed.
                </p>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
                <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                  By Us
                </h3>
                <p className="text-red-700 dark:text-red-300 text-sm mb-2">
                  We reserve the right to suspend or terminate your account if
                  you:
                </p>
                <ul className="text-red-700 dark:text-red-300 text-sm space-y-1.5 ml-4">
                  <li>• Violate these Terms of Service</li>
                  <li>• Engage in illegal or harmful activities</li>
                  <li>• Abuse or misuse the service</li>
                  <li>• Fail to comply with applicable laws</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Limitation of Liability
            </h2>
            <div className="bg-muted border border-input p-4 rounded-lg">
              <p className="text-muted-foreground text-sm mb-2">
                Mostage Studio is provided &quot;as is&quot; without warranties
                of any kind. We are not liable for:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1.5 ml-4">
                <li>• Loss of data or content</li>
                <li>• Service interruptions or downtime</li>
                <li>• Indirect, incidental, or consequential damages</li>
                <li>• Actions or content of other users</li>
              </ul>
            </div>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Changes to Terms
            </h2>
            <p className="text-muted-foreground text-sm">
              We may modify these Terms at any time. We will notify users of
              significant changes by updating the &quot;Last updated&quot; date
              at the top of this page. Your continued use of the service after
              changes become effective constitutes acceptance of the updated
              Terms.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Contact Us
            </h2>
            <p className="text-muted-foreground text-sm mb-4">
              If you have questions about these Terms, please contact us through
              our GitHub repository.
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
