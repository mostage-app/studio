# State Management

Mostage App uses **feature-based architecture** with React hooks and Context API for state management.

**Context Usage**: UIThemeContext is implemented and actively used for global UI theme management.

## Architecture Overview

### State Structure

#### Global State

- **UIThemeContext**: Global UI theme management (light/dark/system) - Context API actively used
- **Persistence**: localStorage
- **Analytics**: Theme change tracking

#### Feature States

**1. Editor State** (`src/features/editor/`)

```typescript
interface EditorState {
  markdown: string; // Current markdown content
  showEditor: boolean; // Editor visibility
  showPreview: boolean; // Preview visibility
  editingSlide: number; // Currently editing slide
}
```

- Hook: `useEditor()`
- Actions: `updateMarkdown()`, `updateEditingSlide()`

**2. Presentation State** (`src/features/presentation/`)

```typescript
interface PresentationConfig {
  theme: "light" | "dark" | "dracula" | "ocean" | "rainbow";
  scale: number;
  transition: { type; duration; easing };
  plugins: { ProgressBar; SlideNumber; Controller; Confetti };
  // ... other settings
}
```

- Hook: `usePresentation()`
- Actions: `updateConfig()`, `resetConfig()`

**3. Auth State** (`src/features/auth/`)

```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
```

- Hook: `useAuth()`
- Actions: `login()`, `register()`, `logout()`

**4. Export/Import States**

- Export: `useExport()` - HTML, PDF, PPTX, JPG formats
- Import: `useImport()` - Markdown, JSON, HTML files

## State Management Patterns

### 1. **Custom Hooks Pattern**

```typescript
export const useEditor = () => {
  const [state, setState] = useState<EditorState>({...});

  const updateMarkdown = useCallback((markdown: string) => {
    setState(prev => ({ ...prev, markdown }));
  }, []);

  return { ...state, updateMarkdown };
};
```

### 2. **Context API**

```typescript
// UIThemeContext for global UI theme management
const { uiTheme, resolvedUITheme, setUITheme, toggleUITheme } = useUITheme();
```

### 3. **Immutable Updates**

```typescript
// ✅ Correct
setState((prev) => ({ ...prev, markdown: newMarkdown }));

// ❌ Wrong
state.markdown = newMarkdown;
```

### 4. **Local Storage**

```typescript
const [value, setValue] = useLocalStorage("key", defaultValue);
```

## Best Practices

- **Organization**: Group state by feature domain
- **Updates**: Use functional updates for state dependencies
- **Performance**: Use `useCallback` and `useMemo` appropriately

## Future Improvements

- **State Management Library**: Zustand, Redux Toolkit
- **Performance**: State selectors and memoization
