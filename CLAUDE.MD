# Claude Code Project Specification

## Project Overview
Modern Single Page Application (SPA) built with best-in-class tools and practices.

## Technology Stack

### Frontend Framework
- **Next.js 15** - React framework with App Router
  - Use App Router (not Pages Router)
  - Client-side rendering focus for true SPA behavior
  - TypeScript enabled by default

### Backend Framework
- **Primary: tRPC** - Type-safe API layer
  - End-to-end type safety without code generation
  - Integrates seamlessly with Next.js
  - Eliminates API documentation overhead (types are the contract)
  - Perfect for internal APIs and full-stack TypeScript

- **Alternative: Fastify** - Modern REST API framework
  - Use when building separate backend service
  - High performance (2-3x faster than Express)
  - Built-in TypeScript support and schema validation
  - Modern async/await patterns
  - Choose this for public REST APIs or microservices

- **Fallback: Next.js API Routes**
  - Use for simple CRUD operations
  - Built into Next.js (/app/api directory)
  - Good for authentication, simple database queries
  - No separate backend deployment needed

### Language
- **TypeScript** - Strict mode enabled for type safety

### Styling
- **Tailwind CSS** - Utility-first CSS framework
  - Configure with sensible defaults
  - Use `clsx` or `cn` utility for conditional classes

### Component Library
- **shadcn/ui** - Accessible, customizable components
  - Built on Radix UI primitives
  - Styled with Tailwind CSS
  - Copy components into project (not npm package)

### State Management
- **Zustand** - Lightweight state management
  - Use for global application state
  - React Context for theme/auth when appropriate

### Data Fetching
- **TanStack Query (React Query)** - Server state management
  - Handle API calls, caching, and synchronization
  - Optimistic updates support

### Form Handling
- **React Hook Form** - Performant form library
  - **Zod** for schema validation
  - Integrate with shadcn/ui form components

### Routing
- Next.js App Router built-in routing
- Use `useRouter` from `next/navigation`

## Project Structure

```
/app
  /api              # tRPC router or Next.js API routes
    /trpc           # tRPC configuration
      /routers      # tRPC route handlers
      root.ts       # Root router
      trpc.ts       # tRPC initialization
  /(routes)         # Application pages
  layout.tsx        # Root layout
  page.tsx          # Home page
/components
  /ui               # shadcn/ui components
  /features         # Feature-specific components
  /layouts          # Layout components
/lib
  /utils            # Utility functions
  /hooks            # Custom React hooks
  /api              # API client setup (tRPC or fetch wrapper)
  /validations      # Zod schemas
  /db               # Database client/queries
/server             # Backend-specific code (if using separate service)
  /routers          # API route handlers
  /middleware       # Server middleware
  /services         # Business logic
/stores             # Zustand stores
/types              # TypeScript type definitions
/public             # Static assets
```

## Development Practices

### Code Style
- Use functional components with hooks
- Prefer named exports for components
- Keep components small and focused (single responsibility)
- Co-locate related files (component + styles + tests)

### TypeScript
- Enable strict mode
- Avoid `any` type
- Define interfaces for all props
- Use type inference where possible

### Component Patterns
- Server Components by default (Next.js 15)
- Use "use client" only when needed (interactivity, hooks, browser APIs)
- Extract reusable logic into custom hooks
- Use composition over prop drilling

### Styling
- Mobile-first responsive design
- Use Tailwind's design tokens
- Create custom CSS only when absolutely necessary
- Use `@apply` sparingly in Tailwind

### Performance
- Lazy load routes and heavy components
- Optimize images with Next.js Image component
- Implement proper loading states
- Use React.memo strategically (not everywhere)

## Key Dependencies

### Core
```json
{
  "next": "^15.0.0",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "typescript": "^5.3.0"
}
```

### Backend (tRPC)
```json
{
  "@trpc/server": "^11.0.0",
  "@trpc/client": "^11.0.0",
  "@trpc/react-query": "^11.0.0",
  "@trpc/next": "^11.0.0",
  "zod": "^3.22.0"
}
```

### Backend (Fastify Alternative)
```json
{
  "fastify": "^4.25.0",
  "@fastify/cors": "^9.0.0",
  "@fastify/swagger": "^8.13.0",
  "fastify-type-provider-zod": "^1.1.0"
}
```

### Styling & UI
```json
{
  "tailwindcss": "^3.4.0",
  "clsx": "^2.1.0",
  "tailwind-merge": "^2.2.0",
  "@radix-ui/react-*": "latest"
}
```

### State & Data
```json
{
  "zustand": "^4.5.0",
  "@tanstack/react-query": "^5.0.0",
  "react-hook-form": "^7.50.0",
  "zod": "^3.22.0"
}
```

## Configuration Files

### tailwind.config.ts
- Extend theme with custom colors and spacing
- Configure content paths for all component locations
- Add custom plugins if needed

### tsconfig.json
- Enable strict mode
- Configure path aliases (@/ for src root)
- Target modern browsers (ES2022+)

### next.config.js
- Configure for static export if true SPA needed
- Set up environment variables
- Configure image domains

## Development Workflow

### Getting Started
```bash
npm install
npm run dev
```

### Building
```bash
npm run build
npm run start
```

### Code Quality
```bash
npm run lint
npm run type-check
```

## Best Practices for Claude Code

1. **Clear Component Requirements**: Specify component behavior, props, and styling needs explicitly
2. **Incremental Development**: Build features step-by-step, testing as you go
3. **Type Safety First**: Define TypeScript interfaces before implementing components
4. **Reusable Patterns**: Create custom hooks and utility functions for repeated logic
5. **Accessibility**: Request ARIA labels and keyboard navigation in interactive components
6. **Error Handling**: Always include loading and error states for async operations

## Common Patterns

### tRPC Setup (Recommended)
```typescript
// app/api/trpc/trpc.ts
import { initTRPC } from '@trpc/server';
import { z } from 'zod';

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;
```

```typescript
// app/api/trpc/routers/user.ts
import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

export const userRouter = router({
  getById: publicProcedure
    .input(z.string())
    .query(({ input }) => {
      // Database query
      return db.user.findUnique({ where: { id: input } });
    }),

  create: publicProcedure
    .input(z.object({
      name: z.string(),
      email: z.string().email(),
    }))
    .mutation(async ({ input }) => {
      return db.user.create({ data: input });
    }),
});
```

```typescript
// app/api/trpc/root.ts
import { router } from './trpc';
import { userRouter } from './routers/user';

export const appRouter = router({
  user: userRouter,
});

export type AppRouter = typeof appRouter;
```

```typescript
// lib/api/trpc-client.ts (Frontend)
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/app/api/trpc/root';

export const trpc = createTRPCReact<AppRouter>();
```

```typescript
// Usage in components
const { data: user, isLoading } = trpc.user.getById.useQuery('user-123');
const createUser = trpc.user.create.useMutation();
```

### Fastify Setup (Alternative for Separate Backend)
```typescript
// server/index.ts
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { z } from 'zod';

const fastify = Fastify({ logger: true });

await fastify.register(cors);

// Route with validation
fastify.get<{ Params: { id: string } }>('/users/:id', {
  schema: {
    params: z.object({ id: z.string() }),
    response: {
      200: z.object({
        id: z.string(),
        name: z.string(),
        email: z.string().email(),
      })
    }
  }
}, async (request, reply) => {
  const user = await db.user.findUnique({
    where: { id: request.params.id }
  });
  return user;
});

await fastify.listen({ port: 3001 });
```

### API Client Setup (for REST APIs)
```typescript
// lib/api/client.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}
```

### Custom Hook Pattern
```typescript
// lib/hooks/use-example.ts
export function useExample() {
  // Hook logic
  return { data, isLoading, error };
}
```

### Zustand Store Pattern
```typescript
// stores/example-store.ts
import { create } from 'zustand';

interface ExampleStore {
  // State and actions
}

export const useExampleStore = create<ExampleStore>((set) => ({
  // Implementation
}));
```

## Backend Development Guidelines

### When to Use Each Approach

**Use tRPC when:**
- Building internal APIs consumed by your Next.js frontend
- Want maximum type safety and developer experience
- Single TypeScript monorepo (frontend + backend together)
- Rapid development is priority

**Use Fastify when:**
- Building public REST API for multiple clients
- Need separate backend service/microservices
- Want maximum performance
- Backend deployed independently from frontend

**Use Next.js API Routes when:**
- Simple CRUD operations
- Authentication endpoints
- Webhooks
- Server actions are sufficient

### API Design Principles

1. **Validation**: Always validate input with Zod schemas
2. **Error Handling**: Return consistent error formats
3. **Authentication**: Implement middleware for protected routes
4. **Rate Limiting**: Add rate limiting for public endpoints
5. **Logging**: Use structured logging for debugging
6. **Type Safety**: Leverage TypeScript for all API contracts

## Notes for Claude

- Prioritize user experience and accessibility
- Write semantic HTML
- Implement proper loading and error states
- Use TypeScript types to prevent runtime errors
- Follow Next.js 15 App Router conventions
- Test interactivity before marking features complete
- Suggest improvements to code structure when appropriate

### Backend-Specific Notes
- **Default to tRPC** for new features unless explicitly told otherwise
- Always use Zod for input validation on all API endpoints
- Implement proper error handling with try-catch and meaningful error messages
- Consider rate limiting and authentication for production APIs
- Use database transactions for operations that modify multiple records
- Optimize database queries (use select to limit fields, include for relations)
- Add logging for debugging (console.log in dev, structured logging in production)
