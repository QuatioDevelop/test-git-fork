# @sura-esenciafest/shared

Shared components, utilities, and types package for SURA Esencia Fest 2025 applications.

## Overview

This package contains reusable components, utilities, and TypeScript types shared between the client and admin applications. It follows a modular architecture to ensure consistency across the entire platform.

## Package Structure

```
apps/shared/
├── src/
│   ├── components/ui/          # Reusable UI components
│   │   ├── brand-button.tsx    # Themed buttons (client/admin variants)
│   │   ├── brand-header.tsx    # Themed headers (client/admin variants)
│   │   ├── button.tsx          # Base button component
│   │   ├── card.tsx           # Card component with variants
│   │   ├── input.tsx          # Input component
│   │   └── index.ts           # Barrel exports
│   ├── lib/
│   │   └── utils.ts           # Utility functions (cn, API helpers, validations)
│   ├── types/
│   │   └── index.ts           # Shared TypeScript types
│   └── index.ts               # Main package exports
├── package.json
└── tsconfig.json
```

## Installation & Usage

### In Client App (`apps/client/`)

```bash
# Install as local dependency
npm install @sura-esenciafest/shared@file:../shared
```

```tsx
// Import components
import { BrandButton, Card, Input } from '@sura-esenciafest/shared'
import { cn, formatDate } from '@sura-esenciafest/shared/utils'
import { User, Room } from '@sura-esenciafest/shared/types'

// Usage example
export function ClientComponent() {
  return (
    <Card>
      <BrandButton variant="client" size="lg">
        Client Action
      </BrandButton>
    </Card>
  )
}
```

### In Admin App (`apps/admin/`)

```tsx
import { BrandButton, Card } from '@sura-esenciafest/shared'

export function AdminComponent() {
  return (
    <Card>
      <BrandButton variant="admin" size="lg">
        Admin Action
      </BrandButton>
    </Card>
  )
}
```

## Available Components

### BrandButton

Themed button component with client/admin variants.

```tsx
<BrandButton variant="client" size="lg" onClick={handleClick}>
  Client Button
</BrandButton>

<BrandButton variant="admin" size="md">
  Admin Button
</BrandButton>
```

**Props:**
- `variant`: `'client' | 'admin'` - Theme variant
- `size`: `'sm' | 'md' | 'lg'` - Button size
- All standard button props

### BrandHeader

Themed header component for consistent branding.

```tsx
<BrandHeader 
  title="SURA Esencia Fest 2025"
  subtitle="Virtual Platform"
  variant="client"
/>
```

### Standard Components

- `Button` - Base button with variants
- `Card` - Card container with header/content/footer
- `Input` - Form input component

## Shared Utilities

### CSS Class Utilities

```tsx
import { cn } from '@sura-esenciafest/shared/utils'

// Merge Tailwind classes intelligently
const className = cn(
  'base-class',
  condition && 'conditional-class',
  props.className
)
```

### API Utilities

```tsx
import { createApiUrl, API_BASE_URL } from '@sura-esenciafest/shared/utils'

// Create API endpoints
const endpoint = createApiUrl('/users/profile')
// Returns: https://api.esenciafest.com/users/profile
```

### Validation Utilities

```tsx
import { isValidEmail, formatDate, formatTime } from '@sura-esenciafest/shared/utils'

const isValid = isValidEmail('user@example.com')
const dateStr = formatDate(new Date()) // "12 de julio de 2025"
const timeStr = formatTime(new Date()) // "15:30"
```

## Shared Types

### Core Types

```tsx
import { User, Room, ChatMessage, EventConfig } from '@sura-esenciafest/shared/types'

interface ComponentProps {
  user: User
  currentRoom: Room
  messages: ChatMessage[]
}
```

### API Types

```tsx
import { ApiResponse, PaginatedResponse } from '@sura-esenciafest/shared/types'

// API response wrapper
const response: ApiResponse<User[]> = await fetchUsers()

// Paginated data
const paginatedUsers: PaginatedResponse<User> = await fetchUsersPage(1)
```

### WebSocket Types

```tsx
import { WebSocketMessage } from '@sura-esenciafest/shared/types'

const message: WebSocketMessage = {
  type: 'chat',
  payload: { text: 'Hello!' },
  timestamp: new Date().toISOString(),
  roomId: 'room-1'
}
```

## Development Workflow

### Adding New Components

1. Create component in `src/components/ui/`
2. Export from `src/components/ui/index.ts`
3. Update main `src/index.ts` if needed
4. Add to this README

### Adding New Types

1. Add types to `src/types/index.ts`
2. Use descriptive JSDoc comments
3. Export from main `src/index.ts`

### Adding New Utilities

1. Add to `src/lib/utils.ts`
2. Include proper TypeScript types
3. Add usage examples to README

## Theme System

The shared package implements a theme system for client/admin variants:

### Client Theme
- Primary: Blue (`bg-blue-600`)
- Accent: Green, Purple
- Style: Modern, user-friendly

### Admin Theme  
- Primary: Red (`bg-red-600`)
- Accent: Orange, Purple
- Style: Professional, dashboard-oriented

### Usage Pattern

```tsx
// Component implementation
const variantStyles = {
  client: "bg-blue-600 hover:bg-blue-700",
  admin: "bg-red-600 hover:bg-red-700"
}

// Usage in apps
<BrandButton variant="client">User Action</BrandButton>  // Blue theme
<BrandButton variant="admin">Admin Action</BrandButton>   // Red theme
```

## Deployment Notes

- **Static Export Compatible**: All components work with Next.js static export
- **SSR Safe**: No client-only dependencies that break SSR
- **Tree Shakeable**: Modular exports for optimal bundle size
- **TypeScript First**: Full type safety across applications

## Troubleshooting

### Import Issues

If imports fail, ensure:
1. Package is installed: `npm install @sura-esenciafest/shared@file:../shared`
2. TypeScript paths are configured in `tsconfig.json`
3. Components are exported from `src/index.ts`

### Theme Not Applied

Ensure Tailwind CSS is processing the shared component classes:
1. Shared components use standard Tailwind classes
2. Parent app's Tailwind config includes shared paths
3. CSS is properly imported in the app

### Type Errors

1. Check shared types are exported from `src/types/index.ts`
2. Verify TypeScript version compatibility
3. Ensure proper import paths

---

**Maintainers**: SURA Esencia Fest Development Team  
**Last Updated**: July 2025