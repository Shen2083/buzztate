# Buzztate - Stylized Translation Tool

## Overview

Buzztate is a creative translation web application that translates text with personality and style. Users can input text, select one or more target languages (Spanish, French, German, Japanese, Portuguese), and choose a translation style (Modern Slang, Professional, Romantic, Angry New Yorker, Gen Z). The app returns stylized translations along with a "reality check" showing what the translation actually means back in English.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state and data fetching
- **Styling**: Tailwind CSS with dark mode enabled by default
- **Component Library**: shadcn/ui components built on Radix UI primitives
- **Build Tool**: Vite with path aliases (@/ for client/src, @shared/ for shared)

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript compiled with tsx
- **API Pattern**: RESTful endpoints under /api prefix
- **AI Integration**: OpenAI API for generating stylized translations (with mock fallback when API key unavailable)

### Project Structure
```
client/          # React frontend
  src/
    components/ui/  # shadcn/ui components
    pages/          # Route components
    hooks/          # Custom React hooks
    lib/            # Utilities and query client
server/          # Express backend
  routes.ts      # API endpoint definitions
  storage.ts     # In-memory data storage
shared/          # Shared types and schemas
  schema.ts      # Zod schemas and TypeScript types
```

### Data Flow
1. User submits text, languages, and style via the home page form
2. Frontend sends POST request to /api/translate
3. Backend validates request with Zod schema
4. OpenAI generates stylized translations (or mock data if no API key)
5. Results returned with translation and reality_check for each language

### Design System
- Dark mode primary with yellow (#FACC15) accent color
- Utility-focused design emphasizing clarity and workflow efficiency
- Consistent spacing using Tailwind's p-4, p-6, gap-4 patterns
- Custom design tokens defined in tailwind.config.ts and index.css

## External Dependencies

### AI Services
- **OpenAI API**: GPT model for generating creative translations with style personality. Falls back to mock translations when OPENAI_API_KEY is not set.

### Database
- **PostgreSQL**: Configured via Drizzle ORM with drizzle-kit for migrations. DATABASE_URL environment variable required. Currently using in-memory storage (MemStorage) for user data.
- **Drizzle ORM**: Type-safe database toolkit with Zod integration for schema validation

### Key NPM Packages
- **@tanstack/react-query**: Async state management and caching
- **zod**: Runtime schema validation for API requests
- **openai**: Official OpenAI SDK for AI translations
- **radix-ui/***: Accessible UI component primitives
- **wouter**: Minimal React router (~1.5KB)