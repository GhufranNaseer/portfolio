# Overview

This is a full-stack web application built as a portfolio website showcasing development services and projects. The application features a modern React frontend with TypeScript, Express.js backend, and PostgreSQL database integration using Drizzle ORM. The portfolio includes interactive project showcases, service offerings, animated UI elements, and a professional presentation of technical capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with CSS variables for theming, including dark mode support

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API design with `/api` prefix routing
- **Development**: Hot reload with tsx for development, esbuild for production builds
- **Session Management**: PostgreSQL-based session storage with connect-pg-simple

## Data Storage
- **Database**: PostgreSQL with Neon serverless driver (@neondatabase/serverless)
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Validation**: Zod schemas integrated with Drizzle for runtime type checking
- **Current Schema**: Users table with id, username, and password fields

## Development Workflow
- **Build System**: Vite for frontend bundling, esbuild for backend bundling
- **Type Checking**: Strict TypeScript configuration across client, server, and shared modules
- **Code Organization**: Monorepo structure with shared schema and types
- **Path Mapping**: Absolute imports using @ aliases for clean import statements

## UI/UX Features
- **Component System**: Comprehensive design system with 40+ reusable components
- **Accessibility**: Built on Radix UI primitives ensuring WCAG compliance
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Animations**: CSS transitions and animations for interactive elements
- **Toast Notifications**: Built-in notification system for user feedback

# External Dependencies

## Core Framework Dependencies
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight routing library
- **express**: Web application framework for Node.js

## Database & ORM
- **@neondatabase/serverless**: PostgreSQL serverless driver
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **drizzle-kit**: Database migration and introspection tools
- **connect-pg-simple**: PostgreSQL session store for Express

## UI Component Libraries
- **@radix-ui/***: 25+ primitive components for accessible UI building blocks
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library with 1000+ SVG icons

## Development Tools
- **vite**: Fast build tool and development server
- **@vitejs/plugin-react**: React support for Vite
- **@replit/vite-plugin-runtime-error-modal**: Error overlay for development
- **@replit/vite-plugin-cartographer**: Development tool integration

## Validation & Utilities
- **zod**: Runtime type validation
- **clsx**: Conditional CSS class utility
- **date-fns**: Date manipulation library
- **nanoid**: URL-safe unique ID generator