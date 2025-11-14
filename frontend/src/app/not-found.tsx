import Link from "next/link";
import { Home, FileText, Book } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Animation */}
        <div className="mb-8">
          <div className="text-8xl font-bold text-primary mb-4 animate-pulse">
            404
          </div>
        </div>

        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Page Not Found
          </h1>
          <p className="text-muted-foreground text-lg">
            The page you&apos;re looking for seems to have vanished into the
            digital void.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
          >
            <Home className="w-4 h-4" />
            Go to Mostage App
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="mt-8 pt-6 border-t border-input">
          <p className="text-sm text-muted-foreground mb-4">
            Need help getting started?
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link
              href="/"
              className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Create New Presentation
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link
              href="https://mostage.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
            >
              <Book className="w-4 h-4" />
              Mostage Documentation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
