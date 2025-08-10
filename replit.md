# replit.md

## Overview

DisasterWatch is a real-time global natural disaster monitoring application that provides live tracking and alerts for earthquakes, storms, wildfires, floods, and other natural disasters worldwide. The system aggregates data from multiple external APIs (USGS, GDACS, National Weather Service) to display current and historical disaster events on an interactive map with severity-based filtering and location-aware alerting.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **State Management**: TanStack Query (React Query) for server state and caching
- **Routing**: Wouter for lightweight client-side routing
- **Maps**: Leaflet.js for interactive disaster visualization
- **Theme System**: Custom dark/light mode implementation with CSS variables

### Backend Architecture
- **Runtime**: Express.js server with TypeScript
- **API Pattern**: RESTful endpoints under `/api` namespace
- **Data Layer**: In-memory storage with interface abstraction for future database integration
- **Real-time**: Prepared for WebSocket/Socket.IO integration for live updates
- **Development**: Vite middleware integration for seamless dev experience

### Database Design
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Schema**: 
  - `disaster_events` table with location (JSONB), severity levels, event types, and temporal data
  - `users` table for future authentication features
- **Validation**: Zod schemas for type-safe data validation
- **Migrations**: Drizzle Kit for schema management

### Data Processing
- **API Integration**: Multi-source disaster data aggregation from USGS (earthquakes), GDACS (global disasters), and weather services
- **Transformation**: Standardized event model with severity classification and geographic normalization
- **Caching**: Query-based caching with configurable refresh intervals (30-60 seconds for live data)
- **Filtering**: Support for event type, severity, location, and temporal filtering

### Component Architecture
- **Layout**: Responsive grid system with dedicated sections for stats, map, feeds, and filters
- **Real-time Updates**: Auto-refreshing components with loading states and error handling
- **Interactive Map**: Clustered markers with severity-based styling and popup tooltips
- **Alert System**: Live ticker for critical events with visual prominence

## External Dependencies

### Core Frameworks
- **React 18**: Frontend framework with concurrent features
- **Express.js**: Backend web framework
- **TypeScript**: Type safety across full stack

### Database & ORM
- **PostgreSQL**: Primary database (configured via Drizzle)
- **Drizzle ORM**: Type-safe database toolkit
- **Neon Database**: Serverless PostgreSQL provider

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: Pre-built component library
- **Radix UI**: Headless component primitives
- **Leaflet.js**: Interactive mapping library

### Data Sources
- **USGS Earthquake API**: Real-time earthquake data
- **GDACS**: Global Disaster Alert and Coordination System
- **National Weather Service**: Weather alerts and warnings
- **OpenFEMA**: Historical disaster records

### Development Tools
- **Vite**: Build tool and dev server
- **TanStack Query**: Server state management
- **Zod**: Runtime type validation
- **Wouter**: Lightweight router

### Infrastructure
- **Font Awesome**: Icon library
- **Google Fonts**: Inter font family
- **Date-fns**: Date manipulation utilities