# Project Structure

This document describes the architecture and structure of Mostage Studio - a Next.js 15 presentation editor with TypeScript, React 19, and Tailwind CSS.

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript** + **React 19**
- **Tailwind CSS 4**
- **Mostage** (presentation engine)
- **Google Analytics 4**

## Directory Structure

```text
frontend/src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Main page
│   └── privacy/           # Privacy policy page
├── features/              # Feature-based modules
│   ├── app-info/          # About modal
│   ├── auth/              # Authentication (Cognito)
│   ├── editor/            # Content editor + AI
│   ├── export/            # File export
│   ├── import/            # File import
│   └── presentation/      # Settings + preview
├── lib/                   # Shared utilities
│   ├── components/        # UI components (Modal, Button, etc.)
│   ├── contexts/         # React contexts (UITheme)
│   ├── hooks/            # Custom hooks
│   ├── types/            # TypeScript types
│   └── utils/            # Analytics + helpers
└── assets/               # Static files (images, etc.)
```

## Features

- **Editor**: Markdown editor with AI generation, undo/redo
- **Presentation**: Live preview with Mostage, customizable themes
- **Authentication**: AWS Cognito integration (sign up, sign in, password reset)
- **Export/Import**: Multiple formats (HTML, PDF, PPTX, JPG, Mostage)
- **Analytics**: Comprehensive GA4 tracking with cookie consent

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
