# Frontend Structure

A Next.js 15 presentation editor with TypeScript, React 19, and Tailwind CSS.

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript** + **React 19**
- **Tailwind CSS 4**
- **Mostage** (presentation engine)
- **Google Analytics 4**

## Directory Structure

```text
src/
├── app/                    # Next.js App Router
├── features/              # Feature-based modules
│   ├── app-info/          # About modal
│   ├── auth/              # Authentication
│   ├── editor/            # Content editor + AI
│   ├── export/            # File export
│   ├── import/            # File import
│   └── presentation/      # Settings + preview
├── shared/                # Shared utilities
│   ├── components/        # UI components
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom hooks
│   ├── types/            # TypeScript types
│   └── utils/            # Analytics + helpers
└── assets/               # Static files
```

## Features

- **Editor**: Markdown editor with AI generation
- **Presentation**: Live preview with Mostage
- **Auth**: Login/signup modal
- **Export/Import**: Multiple formats (HTML, PDF, PPTX)
- **Analytics**: Comprehensive GA4 tracking

## Development

```bash
npm run dev      # Development server
npm run build    # Production build
npm run export   # Static export
npm run lint     # Code linting
```

## Deployment

- **GitHub Pages**: Static export
- **Vercel**: Native Next.js
- **Environment**: `.env.local` (local) / Environment variables (production)
