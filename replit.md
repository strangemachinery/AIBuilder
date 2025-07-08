# AI Learning Hub - Replit.md

## Overview

AI Learning Hub is a comprehensive full-stack learning management system designed specifically for tracking AI automation engineering education progress. The application provides users with tools to manage learning resources, track progress, set goals, and visualize their learning journey through a modern, responsive web interface.

The system follows a modern TypeScript stack with React frontend, Express backend, PostgreSQL database with Drizzle ORM, and integrates with Replit's authentication system for seamless user management.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit OpenID Connect integration with session management
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple

### Data Storage Solutions
- **Primary Database**: PostgreSQL (configured for Neon serverless)
- **Database Client**: @neondatabase/serverless with WebSocket support
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Session Store**: PostgreSQL table-based session storage

## Key Components

### Authentication System
- **Provider**: Replit OpenID Connect (OIDC)
- **Session Management**: Express sessions with PostgreSQL storage
- **User Flow**: Automatic redirection to Replit authentication
- **Security**: HTTP-only cookies, secure session configuration

### Database Schema
Core entities include:
- **Users**: Profile information and authentication data
- **Resources**: Learning materials with categorization and progress tracking
- **Learning Paths**: Curated sequences of learning resources
- **Timeline Events**: Scheduled learning milestones and deadlines
- **Learning Goals**: SMART goals with progress tracking
- **Activity Log**: Comprehensive activity tracking and analytics

### UI Component System
- **Design System**: Glass morphism with gradient themes
- **Component Library**: Complete shadcn/ui implementation
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Accessibility**: ARIA compliant components with keyboard navigation

### State Management
- **Server State**: TanStack Query with automatic caching and synchronization
- **Error Handling**: Centralized error handling with toast notifications
- **Loading States**: Skeleton components and optimistic updates
- **Authentication State**: Automatic token refresh and logout handling

## Data Flow

### Authentication Flow
1. User accesses application
2. Authentication check via `/api/auth/user`
3. If unauthenticated, redirect to `/api/login`
4. Replit OIDC handles authentication
5. Session established with user data stored

### Resource Management Flow
1. User creates/edits learning resources via forms
2. Client-side validation with Zod schemas
3. API requests with automatic error handling
4. Database operations via Drizzle ORM
5. Real-time UI updates through React Query

### Progress Tracking Flow
1. User updates resource progress
2. Activity logged automatically
3. Statistics recalculated
4. Dashboard and insights updated
5. Progress visualizations refreshed

## External Dependencies

### Core Dependencies
- **Database**: PostgreSQL via Neon serverless platform
- **Authentication**: Replit OpenID Connect service
- **UI Components**: Radix UI primitives and Lucide React icons
- **Validation**: Zod for runtime type checking
- **Date Handling**: date-fns for date manipulation

### Development Dependencies
- **Build Tools**: Vite, esbuild, TypeScript compiler
- **Code Quality**: ESLint, Prettier (implied)
- **Development Server**: Replit development environment with hot reload

### External Services
- **Database Hosting**: Neon PostgreSQL serverless
- **Authentication Provider**: Replit OIDC
- **Deployment**: Replit hosting platform

## Deployment Strategy

### Development Environment
- **Platform**: Replit development environment
- **Hot Reload**: Vite development server with HMR
- **Database**: Neon development database
- **Environment Variables**: Replit secrets management

### Production Deployment
- **Build Process**: Vite frontend build + esbuild backend compilation
- **Server**: Node.js Express server
- **Static Files**: Served from `/dist/public`
- **Database**: Production Neon PostgreSQL instance
- **Session Security**: Production-grade session configuration

### Environment Configuration
Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `REPLIT_DOMAINS`: Allowed domains for OIDC
- `ISSUER_URL`: OIDC issuer URL (defaults to Replit)
- `REPL_ID`: Replit application identifier

## Changelog

```
Changelog:
- July 08, 2025. Initial setup
- January 8, 2025. Added gamification features (achievements, streaks, leaderboards)
- January 8, 2025. Implemented mobile app version with offline progress tracking
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
Recent feature requests:
- Mobile app version with offline progress tracking (January 8, 2025)
- Gamification elements with achievements, streaks, and leaderboards (January 8, 2025)
```