"use client";

import { AppHeader } from "@/lib/components/layout/AppHeader";
import { useAuthContext } from "@/features/auth/components/AuthProvider";
import { useParams } from "next/navigation";
import { FileText, Globe, Calendar, Home } from "lucide-react";
import Link from "next/link";

// Mock data - will be replaced with API call later
const getUserPresentations = (username: string) => {
  // This will be replaced with actual API call
  const mockData: Record<
    string,
    Array<{
      id: string;
      name: string;
      url: string;
      isPublic: boolean;
      createdAt: string;
      updatedAt: string;
    }>
  > = {
    john: [
      {
        id: "1",
        name: "My First Presentation",
        url: "my-first-presentation",
        isPublic: true,
        createdAt: "2024-01-10T08:00:00Z",
        updatedAt: "2024-01-15T10:30:00Z",
      },
      {
        id: "2",
        name: "Public Project Overview",
        url: "public-project-overview",
        isPublic: true,
        createdAt: "2024-01-12T14:00:00Z",
        updatedAt: "2024-01-14T15:20:00Z",
      },
    ],
  };
  return mockData[username] || null;
};

export default function UserPage() {
  const params = useParams();
  const username = params?.username as string;
  const { user, isAuthenticated } = useAuthContext();

  // If username doesn't exist, show 404
  // Later this will be replaced with API call to check if user exists
  const presentations = getUserPresentations(username);

  if (!presentations) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <AppHeader />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full text-center">
            <div className="mb-8">
              <div className="text-8xl font-bold text-primary mb-4 animate-pulse">
                404
              </div>
            </div>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-2">
                User Not Found
              </h1>
              <p className="text-muted-foreground text-lg">
                The user &quot;{username}&quot; does not exist or has no public
                presentations.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
              >
                <Home className="w-4 h-4" />
                Go to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filter only public presentations
  const publicPresentations = presentations.filter((p) => p.isPublic);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isOwnProfile = isAuthenticated && user?.username === username;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <AppHeader />
      <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {isOwnProfile
              ? `Presentations by ${user?.name || username}`
              : `Presentations by ${username}`}
          </h1>
        </div>

        {/* Presentations Grid */}
        {publicPresentations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {publicPresentations.map((presentation) => (
              <div
                key={presentation.id}
                className="bg-background border border-input rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <h3 className="font-semibold text-foreground truncate">
                      {presentation.name}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-xs font-medium">
                    <Globe className="w-3 h-3" />
                    <span>Public</span>
                  </div>
                </div>

                <div className="space-y-1.5 mb-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Created: {formatDate(presentation.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Updated: {formatDate(presentation.updatedAt)}</span>
                  </div>
                </div>

                <div className="flex items-center">
                  <Link
                    href={`/${username}/${presentation.url}`}
                    className="w-full text-center px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm"
                  >
                    {isOwnProfile ? "Edit" : "View"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-background border border-input rounded-lg p-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {isOwnProfile
                ? "No presentations yet"
                : "No public presentations"}
            </h3>
            <p className="text-muted-foreground">
              {isOwnProfile
                ? "Create your first presentation to get started"
                : `${username} hasn't shared any public presentations yet`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
