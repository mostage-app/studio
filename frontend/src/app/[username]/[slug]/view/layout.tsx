/**
 * Minimal layout for view-only presentation pages
 * No header, footer, or other UI elements - just the presentation
 * This layout provides a full-screen container for the presentation
 */
export default function ViewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
