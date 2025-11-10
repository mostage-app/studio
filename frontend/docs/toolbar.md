# Markdown Toolbar Documentation

## Overview

The Markdown Toolbar is a comprehensive component that provides a user-friendly interface for editing Markdown content. It includes formatting options, special presentation features, and interactive popups for inserting links, images, and tables.

### Why didn't we use existing Markdown editors?

**Answer**: We didn't find any good, up-to-date, flexible, and bug-free solution. The strongest options were Milkdown and MDXEditor, both of which had significant bugs. Major issues included lack of flexibility, features like undo not working correctly, and inability to properly control themes in dark and light modes.

## Table of Contents

- [Architecture](#architecture)
- [Toolbar Sections](#toolbar-sections)
- [Formatting Features](#formatting-features)
- [Block-Level Formatting](#block-level-formatting)
- [Interactive Popups](#interactive-popups)
- [Special Features](#special-features)
- [API Reference](#api-reference)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Component Structure](#component-structure)
- [Responsive Design](#responsive-design)

## Architecture

The toolbar is built using React functional components and hooks. It's organized into multiple sections, each serving a specific purpose:

### Main Components

- **`MarkdownToolbar.tsx`**: Main toolbar component
- **`ToolbarButton.tsx`**: Reusable button component
- **`ToolbarDivider.tsx`**: Visual separator component
- **`PopupForm.tsx`**: Generic popup form component

### File Structure

```text
src/features/editor/components/
├── MarkdownToolbar.tsx       # Main toolbar component
└── toolbar/
    ├── ToolbarButton.tsx     # Reusable button component
    ├── ToolbarDivider.tsx    # Visual divider
    ├── PopupForm.tsx         # Popup form component
    └── index.ts              # Export file
```

## Toolbar Sections

The toolbar consists of two main sections:

### 1. Presentation Features Toolbar (Top Section)

This section contains special presentation features and content generation tools:

- **AI Generate**: Opens AI content generation modal
- **Confetti**: Inserts confetti HTML comment (`<!-- confetti -->`)
- **New Slide**: Inserts slide separator (`---`)
- **QR Code**: Opens QR code feature (requires authentication)
- **Live Polling**: Opens live polling feature (requires authentication)
- **Live Quiz**: Opens live quiz feature (requires authentication)
- **Q&A**: Opens Q&A feature (requires authentication)

### 2. Markdown Formatting Toolbar (Bottom Section)

This section contains all Markdown formatting options:

**Order (left to right):**

1. **Undo/Redo**: History management buttons
2. **Title Dropdown**: Paragraph, Heading levels (1-6), and Quote
3. **Text Formatting**: Bold, Italic, Underline, Strikethrough
4. **Code**: Inline code and Code block
5. **Links & Media**: Link, Image
6. **Table**: Table generator
7. **Lists**: Unordered and Ordered lists

**Note**: File operations (New, Open, Save) are handled via props (`onOpenNewFileConfirmation`, `onOpenFile`, `onOpenSaveModal`) but their UI buttons are not rendered in this toolbar component. They are handled by the parent `ContentEditor` component through modals.

## Formatting Features

### Inline Formatting

#### Bold

- **Syntax**: `**text**`
- **Behavior**:
  - Toggles formatting on/off
  - Works with selected text or word at cursor
  - Maintains selection after formatting

#### Italic

- **Syntax**: `_text_`
- **Behavior**: Same as Bold

#### Underline

- **Syntax**: `<u>text</u>`
- **Behavior**: HTML-style underline formatting

#### Strikethrough

- **Syntax**: `~~text~~`
- **Behavior**: Same toggle behavior as Bold/Italic

#### Inline Code

- **Syntax**: `` `code` ``
- **Behavior**:
  - Wraps selected text in backticks
  - Toggles off if already formatted
  - Works on single-line selections

### Block-Level Formatting

#### Paragraph

- Converts selected text to plain paragraph
- Adds two empty lines before for spacing
- Removes existing formatting (headings, quotes)

#### Quote

- **Syntax**: `> text`
- **Behavior**:
  - Converts selected text to quote
  - Toggles off if already a quote
  - Converts from heading if applicable

#### Headings (Title Levels 1-6)

- **Syntax**: `# Heading 1` through `###### Heading 6`
- **Behavior**:
  - Converts selected text to heading
  - Changes heading level if already a heading
  - Toggles off if same level clicked again
  - Converts from quote if applicable

### Lists

#### Unordered List

- **Syntax**: `- item` or `* item`
- **Behavior**:
  - Converts selected lines to list items
  - Toggles off if already a list
  - Converts from ordered list if applicable
  - Maintains selection after formatting

#### Ordered List

- **Syntax**: `1. item` or `2. item`
- **Behavior**:
  - Same as unordered list
  - Converts from unordered list if applicable

### Code Blocks

- **Syntax**: ` ```\ncode\n``` `
- **Behavior**:
  - Wraps multi-line selections in code block
  - Wraps single-line selections in inline code
  - Toggles off if inside code block
  - Inserts markers with cursor between if no selection

## Interactive Popups

### Link Popup

Opens when clicking the Link button:

**Fields:**

- Link Text: The visible text for the link
- URL: The target URL

**Behavior:**

- Pre-fills "Link Text" if text is selected
- Closes on outside click
- Clears values when canceled
- Inserts: `[Link Text](URL)`

**Validation:**

- Both fields required
- Submit button disabled if fields are empty

### Image Popup

Opens when clicking the Image button:

**Fields:**

- Alt Text: Alternative text for the image
- Image URL: The image source URL

**Behavior:**

- Pre-fills "Alt Text" if text is selected
- Closes on outside click
- Clears values when canceled
- Inserts: `![Alt Text](Image URL)`

**Validation:**

- URL field required
- Submit button disabled if URL is empty

### Table Popup

Opens when clicking the Table button:

**Fields:**

- Number of Columns: 1-10 (number input)
- Number of Rows: 1-20 (number input)

**Behavior:**

- Generates aligned Markdown table
- All cells have consistent width (12 characters)
- Includes header row with aligned separators
- Closes on outside click

**Table Format:**

```markdown
| Header 1 | Header 2 | Header 3 |
| -------- | -------- | -------- |
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
```

## Special Features

### Title Dropdown

A dropdown menu containing:

1. **Paragraph**: Plain paragraph formatting
2. **---** (Separator)
3. **Title Level 1** through **Title Level 6**: Heading levels
4. **---** (Separator)
5. **Quote**: Blockquote formatting

**Order**: Paragraph → Separator → Title Levels 1-6 → Separator → Quote

### Undo/Redo

The toolbar includes comprehensive undo/redo functionality powered by the `useUndoRedo` hook.

#### Features

- **Undo**: Reverts the last change made to the content
- **Redo**: Reapplies the last undone change
- **History Management**: Maintains up to 500 history states
- **Smart Tracking**: Distinguishes between programmatic changes (toolbar actions) and user typing
- **Immediate Updates**: Each character typed creates a new history entry (no debouncing)
- **Visual Feedback**: Buttons show disabled state when no history is available

#### Shortcuts

- **Undo**: `Ctrl+Z` (Windows/Linux) or `Cmd+Z` (Mac)
- **Redo**:
  - `Ctrl+Y` (Windows standard)
  - `Ctrl+Shift+Z` (Linux/Mac standard)
  - `Cmd+Shift+Z` (Mac)

**Note**: Shortcuts use `e.code` for language-independent detection, ensuring they work correctly with Persian, English, and other keyboard layouts.

#### Technical Details

**History Storage:**

- Maximum history size: 500 entries (configurable)
- Each entry stores a complete copy of the content
- Memory usage: `maxHistorySize × contentSize`
- For small/medium content (<100KB): 500 entries is safe (~50MB max)
- For large content (>500KB): Consider reducing to 100-200 entries

**State Management:**

- Uses `useReducer` for atomic state updates
- Prevents stale closure issues
- Eliminates race conditions between history and index updates

**Behavior:**

- All changes (toolbar actions and typing) are added to history immediately
- Each character typed creates a separate history entry
- Undo/redo operations maintain cursor position when possible
- History is reset when new content is loaded from file

#### Implementation

The undo/redo functionality is implemented in:

- **Hook**: `src/features/editor/hooks/useUndoRedo.ts`
- **Integration**: `src/features/editor/components/ContentEditor.tsx`

The hook provides:

- `executeCommand()`: For programmatic changes (toolbar)
- `handleChange()`: For user typing
- `undo()`: Revert to previous state
- `redo()`: Reapply undone change
- `reset()`: Clear history (used when loading new file)

## API Reference

### MarkdownToolbarProps

```typescript
interface MarkdownToolbarProps {
  // Text insertion
  onInsert: (before: string, after?: string, placeholder?: string) => void;

  // Formatting toggles
  onToggleFormatting?: (marker: string, closingMarker?: string) => void;
  onToggleList?: (listType: "unordered" | "ordered") => void;

  // Block-level formatting
  onApplyHeading?: (level: number) => void;
  onApplyQuote?: () => void;
  onApplyParagraph?: () => void;
  onApplyCodeBlock?: () => void;

  // File operations
  onOpenNewFileConfirmation: () => void;
  onOpenFile: () => void;
  onOpenSaveModal: () => void;

  // Modals
  onOpenAIModal: () => void;
  onOpenAuthModal: () => void;

  // Utilities
  getSelectedText?: () => string;

  // Undo/Redo
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;

  // Styling
  className?: string;
}
```

### Constants

```typescript
// Table generation limits
const MAX_TABLE_COLUMNS = 10;
const MAX_TABLE_ROWS = 20;
const DEFAULT_TABLE_COLUMNS = 3;
const DEFAULT_TABLE_ROWS = 2;
const TABLE_CELL_WIDTH = 12;
```

## Keyboard Shortcuts

### Undo/Redo Shortcuts

The toolbar supports standard keyboard shortcuts for undo/redo operations:

| Action | Windows/Linux              | Mac           |
| ------ | -------------------------- | ------------- |
| Undo   | `Ctrl+Z`                   | `Cmd+Z`       |
| Redo   | `Ctrl+Y` or `Ctrl+Shift+Z` | `Cmd+Shift+Z` |

**Implementation Notes:**

- Uses `e.code` (physical key) instead of `e.key` (character) for language-independent detection
- Works correctly with Persian, English, Arabic, and other keyboard layouts
- Physical key detection ensures consistency regardless of keyboard language setting
- Shortcuts are handled in `ContentEditor.tsx` via `onKeyDown` event handler

## Component Structure

### State Management

The toolbar uses React hooks for state management:

```typescript
// Dropdown states
const [showTitleDropdown, setShowTitleDropdown] = useState(false);

// Popup states
const [showLinkPopup, setShowLinkPopup] = useState(false);
const [showImagePopup, setShowImagePopup] = useState(false);
const [showTablePopup, setShowTablePopup] = useState(false);

// Form states
const [linkText, setLinkText] = useState("");
const [linkUrl, setLinkUrl] = useState("");
// ... similar for image and table
```

### Refs

Used for click-outside detection and storing selected text:

```typescript
const titleDropdownRef = useRef<HTMLDivElement>(null);
const linkPopupRef = useRef<HTMLDivElement>(null);
const imagePopupRef = useRef<HTMLDivElement>(null);
const tablePopupRef = useRef<HTMLDivElement>(null);

// Store selected text for popups
const linkSelectedTextRef = useRef<string>("");
const imageSelectedTextRef = useRef<string>("");
```

### Click Outside Detection

Implemented using `useEffect` hook with an array of refs and their corresponding close functions:

```typescript
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Node;
    const refsWithClosers: Array<{
      ref: React.RefObject<HTMLDivElement | null>;
      closer: () => void;
    }> = [
      { ref: titleDropdownRef, closer: closeTitleDropdown },
      { ref: linkPopupRef, closer: closeLinkPopup },
      { ref: imagePopupRef, closer: closeImagePopup },
      { ref: tablePopupRef, closer: closeTablePopup },
    ];

    refsWithClosers.forEach(({ ref, closer }) => {
      if (ref.current && !ref.current.contains(target)) {
        closer();
      }
    });
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);
```

## Responsive Design

### Desktop (sm and above)

- Popups positioned absolutely next to buttons
- Dropdowns positioned below buttons
- No backdrop overlay
- Standard z-index (`z-[100]` for dropdowns, `z-[9997]` for popups)

### Mobile

- Popups centered on screen using `fixed` positioning
- Backdrop overlay (dark background) for focus
- Clicking backdrop closes popup
- Full-width popups with margins (`w-[calc(100vw-2rem)]`)
- Larger touch targets for buttons and inputs
- z-index: `z-[9997]` for popups, `z-[9996]` for backdrop

### Popup Classes

```typescript
const POPUP_CLASSES =
  "fixed sm:absolute sm:top-full sm:left-0 sm:mt-1 " +
  "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 " +
  "sm:translate-x-0 sm:translate-y-0 " +
  "bg-white dark:bg-gray-800 border border-input rounded-md " +
  "shadow-xl z-[9997] p-4 " +
  "min-w-[280px] max-w-[calc(100vw-2rem)] " +
  "w-[calc(100vw-2rem)] sm:w-auto sm:shadow-lg";

const POPUP_BACKDROP_CLASSES = "fixed inset-0 bg-black/50 z-[9996] sm:hidden";
```

## Utility Functions

### Table Generation

The toolbar includes a `generateMarkdownTable` function that creates aligned Markdown tables:

```typescript
function generateMarkdownTable(columns: number, rows: number): string {
  // Generates aligned Markdown table with:
  // - Header row with numbered headers (Header 1, Header 2, ...)
  // - Separator row with dashes
  // - Data rows with numbered cells (Cell 1, Cell 2, ...)
  // - All cells padded to consistent width (12 characters)
  // Uses padCell utility for consistent column widths
}
```

**Example Output:**

```markdown
| Header 1 | Header 2 | Header 3 |
| -------- | -------- | -------- |
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
```

### Formatting Toggle Factory

The toolbar uses a factory function to create formatting handlers with toggle behavior:

```typescript
const createToggleFormatter =
  (marker: string, closingMarker?: string, fallbackPlaceholder?: string) =>
  () => {
    // If onToggleFormatting is provided, use it
    // Otherwise, fallback to onInsert with markers
    // Creates a formatting function with toggle behavior
    // Handles selected text and empty selection cases
  };
```

This factory is used to create all inline formatting functions:

- `formatBold`: `createToggleFormatter("**", undefined, "bold text")`
- `formatItalic`: `createToggleFormatter("_", undefined, "italic text")`
- `formatUnderline`: `createToggleFormatter("<u>", "</u>", "underlined text")`
- `formatStrikethrough`: `createToggleFormatter("~~", undefined, "strikethrough text")`
- `formatCode`: `createToggleFormatter("\`", undefined, "code")`

## Integration

The toolbar is integrated into `ContentEditor.tsx`:

```typescript
<MarkdownToolbar
  onInsert={insertText}
  onToggleFormatting={toggleFormatting}
  onToggleList={toggleList}
  onApplyHeading={applyHeading}
  onApplyQuote={applyQuote}
  onApplyParagraph={applyParagraph}
  onApplyCodeBlock={applyCodeBlock}
  // ... other props
/>
```

## Best Practices

1. **Selection Preservation**: All formatting functions maintain text selection after applying changes
2. **Toggle Behavior**: Formatting buttons toggle on/off based on current state
3. **Smart Defaults**: Pre-fills popup forms with selected text when available
4. **Accessibility**: All buttons have descriptive titles and tooltips
5. **Responsive**: Works seamlessly on mobile and desktop
6. **Language Independence**: Keyboard shortcuts work regardless of keyboard layout

## Future Enhancements

Potential improvements for future versions:

- Custom table styling options
- Image upload and preview
- Link validation
- Formatting presets/templates
- Undo/redo for individual formatting actions
- Drag-and-drop image insertion
- Emoji picker integration
