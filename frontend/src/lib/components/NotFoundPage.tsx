import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

interface NotFoundPageProps {
  title?: string;
  message?: string;
  primaryAction?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
}

export function NotFoundPage({
  title = "Page Not Found",
  message = "The page you're looking for doesn't exist or has been moved.",
  primaryAction = {
    label: "Go to Home",
    href: "/",
  },
  secondaryAction,
}: NotFoundPageProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Animation */}
        <div className="mb-8">
          <div className="text-8xl font-bold text-primary mb-4 animate-pulse">
            404
          </div>
        </div>

        {/* Content */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">{title}</h1>
          <p className="text-muted-foreground text-lg">{message}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {secondaryAction && (
            <Link
              href={secondaryAction.href}
              className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              {secondaryAction.label}
            </Link>
          )}
          <Link
            href={primaryAction.href}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
          >
            <Home className="w-4 h-4" />
            {primaryAction.label}
          </Link>
        </div>
      </div>
    </div>
  );
}
