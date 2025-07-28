# SURA Esencia Fest 2025 - Client Application

## Environment Variables

The client application uses environment variables to configure API endpoints for different environments:

### Environment Strategy:
- **`.env.local`** - Local development (not in git)
- **`.env.staging`** - Staging environment (in git)
- **`.env.production`** - Production environment (in git)
- **`.env.example`** - Example template (in git)

### Development (.env.local) - Create locally
```
NEXT_PUBLIC_API_BASE_URL=https://api.dev.esenciafest.com
NEXT_PUBLIC_ENVIRONMENT=development
```

### Staging (.env.staging) - In git
```
NEXT_PUBLIC_API_BASE_URL=https://api.staging.esenciafest.com
NEXT_PUBLIC_ENVIRONMENT=staging
```

### Production (.env.production) - In git
```
NEXT_PUBLIC_API_BASE_URL=https://api.esenciafest.com
NEXT_PUBLIC_ENVIRONMENT=production
```

## Development Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

The application will automatically connect to the development API endpoint.

## Deployment Configuration

- **Development**: Uses `.env.local` (created from `.env.example`)
- **Staging**: Uses `.env.staging` (committed to git)
- **Production**: Uses `.env.production` (committed to git)

This ensures each environment gets the correct API configuration during build/deploy.

## Authentication System

The authentication system includes:
- Login/Register forms with validation
- JWT token management
- Error handling with user-friendly messages
- Responsive design
- Integration with backend API

### API Endpoints Used:
- `POST /auth` - Login/Register unified endpoint

### Environment-specific API URLs:
- **Development**: `https://api.dev.esenciafest.com`
- **Staging**: `https://api.staging.esenciafest.com`
- **Production**: `https://api.esenciafest.com`

## Getting Started

This is a [Next.js](https://nextjs.org) project with static export configuration.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Key Features

- **Authentication**: Complete login/register system with JWT
- **Static Export**: Configured for S3/CloudFront deployment
- **Responsive Design**: Modern, minimal UI with Tailwind CSS
- **Type Safety**: Full TypeScript coverage
- **Form Validation**: Zod schemas with React Hook Form
