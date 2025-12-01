/**
 * Onboarding Tour Configuration
 *
 * Defines the steps for the onboarding tour. Each step highlights an element
 * and displays a tooltip with helpful information.
 */

export interface TourStep {
  /** CSS selector to target the element to highlight */
  target: string;
  /** Title displayed in the tooltip */
  title: string;
  /** Content/description displayed in the tooltip */
  content: string;
  /** Optional: Tooltip position (auto-detected if not provided) */
  position?: "top" | "bottom" | "left" | "right" | "auto";
}

export const tourSteps: TourStep[] = [
  {
    target: 'h3:contains("Content Editor")',
    title: "Content Editor Panel",
    content:
      "Write your presentation content in Markdown.  Also, AI, QR code, Polling and Quiz are available in the toolbar.",
    position: "right",
  },
  {
    target: 'h3:contains("Live Preview")',
    title: "Live Preview Panel",
    content:
      "See your presentation in real-time. Changes in the editor appear instantly.",
    position: "left",
  },
  {
    target: 'h3:contains("Presentation Settings")',
    title: "Presentation Settings Panel",
    content:
      "Customize your presentation settings. You can change the theme, animations, headers, footers, background and more.",
    position: "auto",
  },
  // {
  //   target: "[title='Auto-saves every 30 seconds']",
  //   title: "Auto save",
  //   content:
  //     "Auto-saves your presentation every 30 seconds if you have unsaved changes.",
  //   position: "bottom",
  // },
  {
    target: '[title="New presentation"]',
    title: "New Presentation",
    content:
      "Start a new presentation or load a sample template to get started quickly.",
    position: "bottom",
  },
  {
    target: "[title='Dashboard']",
    title: "Dashboard",
    content: "Access your dashboard to view your presentations and more.",
    position: "bottom",
  },
  {
    target: '[title="More options"]',
    title: "More Options",
    content:
      "Access additional features including About information, Privacy Settings, Onboarding Tour, and Donate options.",
    position: "bottom",
  },
  {
    target: '[data-tour-target="presentation-url"]',
    title: "URL and Privacy",
    content: "Manage presentation Name, URL and privacy settings.",
    position: "bottom",
  },
  // {
  //   target: '[title="Upload presentation"]',
  //   title: "Upload Presentation",
  //   content:
  //     "Upload existing presentations from your computer (.mostage, .md, or JSON files).",
  //   position: "bottom",
  // },
  // {
  //   target: '[title="Download presentation"]',
  //   title: "Download it",
  //   content:
  //     "Export your presentation as PDF, HTML, PPTX, JPG, or Mostage format.",
  //   position: "bottom",
  // },
];
