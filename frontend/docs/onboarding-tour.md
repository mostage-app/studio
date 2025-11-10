# Onboarding Tour Documentation

## Overview

The Onboarding Tour is an interactive help system that guides new users through the main features of Mostage Studio. It displays tooltips that highlight specific UI elements and provide contextual information.

### Key Features

- Step-by-step guidance through the application
- Visual focus on important UI elements with dark overlay
- Automatically shows on first visit
- Can be restarted from About modal
- Hidden on mobile devices (< 768px)

## File Structure

```
src/shared/
├── config/tour.config.ts          # Tour step definitions
└── components/ui/OnboardingTour.tsx  # Main tour component
```

## Configuration

Tour steps are defined in `src/shared/config/tour.config.ts`:

```typescript
export interface TourStep {
  target: string; // CSS selector or text content selector
  title: string; // Tooltip title
  content: string; // Tooltip description
  position?: "top" | "bottom" | "left" | "right" | "auto";
}

export const tourSteps: TourStep[] = [
  {
    target: 'h3:contains("Content Editor")',
    title: "Content Editor Panel",
    content: "Write your presentation content in Markdown...",
    position: "right",
  },
  // ... more steps
];
```

### Selector Types

1. **Standard CSS Selectors**:

   ```typescript
   target: '[title="New presentation"]';
   ```

2. **Text Content Selectors**:
   ```typescript
   target: 'h3:contains("Content Editor")';
   ```
   Finds elements by matching their text content.

## Component Usage

### Basic Integration

```typescript
import { OnboardingTour } from "@/shared/components/ui";
import { tourSteps } from "@/shared/config/tour.config";

const [showTour, setShowTour] = useState(false);

<OnboardingTour
  steps={tourSteps}
  isActive={showTour}
  onClose={() => setShowTour(false)}
/>;
```

### First Visit Detection

```typescript
useEffect(() => {
  const hasSeenTour = localStorage.getItem("tour-completed-v1");
  if (!hasSeenTour) {
    setTimeout(() => setShowTour(true), 500);
  }
}, []);

const handleTourClose = useCallback(() => {
  setShowTour(false);
  localStorage.setItem("tour-completed-v1", "true");
}, []);
```

### Restart from About Modal

```typescript
// In AboutModal
interface AboutModalProps {
  onStartTour?: () => void;
}

// In MainLayout
const handleStartTour = useCallback(() => {
  setShowTour(true);
}, []);

<AboutModal
  isOpen={showAboutModal}
  onClose={() => setShowAboutModal(false)}
  onStartTour={handleStartTour}
/>;
```

## Features

### Intro Step

Before the tour starts, an intro modal is shown with:

- Welcome message
- "Skip Tour" button
- "Start Tour" button

### Element Highlighting

- Dark overlay (75% opacity) covers the screen
- Rectangular cutout reveals the highlighted element
- Indigo border (2px) around the element
- Border radius: `rounded-md`

### Tooltip

- Automatically positioned around highlighted element
- Arrow points from tooltip to element
- Progress bar shows current step
- Navigation buttons: Back, Next/Finish, Close (×)

### Progress Bar

- Current step: Gradient indigo-purple
- Completed steps: Indigo color
- Upcoming steps: Gray color

## Styling

### Colors

- Icon: Gradient `from-indigo-500 to-purple-600`
- Border: `gray-200` (light) / `gray-700` (dark)
- Highlight border: Indigo (`rgb(99, 102, 241)`)
- Overlay: `rgba(0, 0, 0, 0.75)`

### Constants

```typescript
const MOBILE_BREAKPOINT = 768; // Hide on screens < 768px
const TOOLTIP_WIDTH = 320;
const TOOLTIP_SPACING = 24;
const ARROW_SIZE = 12;
const OVERLAY_OPACITY = 0.75;
```

## API Reference

### OnboardingTour Props

```typescript
interface OnboardingTourProps {
  steps: TourStep[];
  isActive: boolean;
  onClose: () => void;
}
```

### TourStep Interface

```typescript
interface TourStep {
  target: string;
  title: string;
  content: string;
  position?: "top" | "bottom" | "left" | "right" | "auto";
}
```

## Technical Details

### Element Finding

The component finds elements using:

1. Standard `querySelector` for CSS selectors
2. Custom `:contains()` parser for text content matching

### Panel Detection

For panel elements (Content Editor, Live Preview, Settings), the tour automatically finds the entire panel container by:

1. Finding the `h3` header element
2. Traversing up the DOM to find the panel container
3. Identifying panels by class combinations

### Position Calculation

Tooltip position is auto-calculated based on:

- Available viewport space
- Element position
- Preferred position (if specified)

Priority: Bottom → Top → Right → Left

### Performance

- Uses `requestAnimationFrame` for smooth updates
- Only updates when step changes
- Skips updates on mobile or inactive tour

## Adding New Steps

```typescript
// In tour.config.ts
export const tourSteps: TourStep[] = [
  // ... existing steps
  {
    target: '[data-testid="my-feature"]',
    title: "My Feature",
    content: "Description of my feature.",
    position: "right",
  },
];
```

## Troubleshooting

### Tour Not Showing

- Check localStorage: `localStorage.getItem("tour-completed-v1")`
- Verify screen width >= 768px
- Ensure `isActive` prop is `true`

### Element Not Found

- Verify selector is correct
- Check element exists in DOM
- Try using `:contains()` for dynamic content

---

**Version**: 1.0
