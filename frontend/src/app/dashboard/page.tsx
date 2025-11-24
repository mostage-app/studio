"use client";

import { AppHeader } from "@/lib/components/layout/AppHeader";
import { useAuthContext } from "@/features/auth/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FileText, Globe, Lock, Calendar } from "lucide-react";
import Link from "next/link";

// Mock data - will be replaced with API call later
const mockPresentations = [
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
    name: "Project Overview",
    url: "project-overview",
    isPublic: false,
    createdAt: "2024-01-12T14:00:00Z",
    updatedAt: "2024-01-14T15:20:00Z",
  },
  {
    id: "3",
    name: "Team Meeting Notes",
    url: "team-meeting-notes",
    isPublic: false,
    createdAt: "2024-01-08T09:00:00Z",
    updatedAt: "2024-01-13T09:15:00Z",
  },
];

export default function DashboardPage() {
  const { isAuthenticated, user, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <AppHeader />
        <div className="flex items-center justify-center h-[calc(100vh-73px)]">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <AppHeader />
      <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {user?.name ? `Presentations by ${user.name}` : "Presentations"}
          </h1>
          {/* <p className="text-muted-foreground">
            Manage and organize your presentations
          </p> */}
        </div>

        {/* Presentations Grid */}
        {mockPresentations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {mockPresentations.map((presentation) => (
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
                  {presentation.isPublic ? (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-xs font-medium">
                      <Globe className="w-3 h-3" />
                      <span>Public</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded text-xs font-medium">
                      <Lock className="w-3 h-3" />
                      <span>Private</span>
                    </div>
                  )}
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
                    href={`/${user?.username}/${presentation.url}`}
                    className="w-full text-center px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-background border border-input rounded-lg p-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No presentations yet
            </h3>
            <p className="text-muted-foreground">
              Create your first presentation to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
