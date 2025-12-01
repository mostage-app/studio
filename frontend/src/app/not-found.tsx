import { NotFoundPage } from "@/lib/components/NotFoundPage";

export default function NotFound() {
  return (
    <NotFoundPage
      title="Page Not Found"
      message="The page you're looking for doesn't exist or has been moved."
      primaryAction={{
        label: "Go to Home",
        href: "/",
      }}
    />
  );
}
