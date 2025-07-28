# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Virtual event platform for SURA's "Esencia Fest 2025" scheduled for August 18, 2025. The project uses a static export strategy with Next.js 15 and AWS serverless backend architecture.

## Key Architecture Decisions

- **Static Export**: All Next.js apps built as static sites (NO SSR) for S3/CloudFront hosting
- **Serverless Backend**: AWS SAM with Lambda functions, API Gateway, and DynamoDB
- **Multi-app Structure**: Separate client (`esenciafest.com`) and admin (`admin.esenciafest.com`) applications
- **Canvas-based UI**: Interactive virtual event space using react-konva for the "Ciudadela" experience
- **Hybrid Authentication**: JWT for regular users, AWS Cognito for admin panel

## Technology Stack

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **UI**: shadcn/ui + Tailwind CSS v4
- **State Management**: TanStack Query v5 + React Context
- **Specialized**: react-konva (canvas), CSS 3D Transforms (cylindrical gallery), @vimeo/player
- **Backend**: AWS SAM + Lambda + API Gateway + DynamoDB
- **Infrastructure**: CloudFormation + S3 + CloudFront

## Development Commands

```bash
# Development - FUNCTIONAL ✅
npm install
npm run dev          # Start all apps (client:3000, admin:3001)

# Build and export - FUNCTIONAL ✅
npm run build        # Build all applications
npm run export       # Export static builds for deployment
npm run lint         # Lint all applications
npm run type-check   # TypeScript checking

# Figma MCP - FUNCTIONAL ✅

# Individual apps
cd apps/client && npm run dev    # Client only (port 3000)
cd apps/admin && npm run dev     # Admin only (port 3001)

# Backend development - NEW ✅
npm run backend:local           # Start SAM Local APIs (port 3002)
npm run backend:build           # Build SAM application
npm run backend:validate        # Validate SAM template
npm run backend:deploy:dev      # Deploy backend to dev environment

# Admin Panel Authentication - COGNITO ✅

# Development Environment
# User Pool: us-east-1_ag7XaeJiq
# Client ID: 2ee9a14lggqjis6d387gu2iam9
# URL: https://admin.dev.esenciafest.com
# Credentials:
#   Usuario: produccion@quatio.co
#   Contraseña: AdminPassword123!

# Staging Environment
# User Pool: us-east-1_BhsHFYtkK
# Client ID: 3nhp0ao2n7q41inveeotaivp89
# URL: https://admin.staging.esenciafest.com
# Credentials:
#   Usuario: produccion@quatio.co
#   Contraseña: AdminPassword123!

# E2E Testing - FUNCTIONAL ✅
npx playwright test tests/e2e/user-flows.spec.ts    # Run user authentication flow tests
npx playwright test tests/e2e/admin.spec.ts         # Run admin Cognito authentication tests
npx playwright test tests/e2e/user-flows.spec.ts --headed    # Run with browser UI
npx playwright test tests/e2e/user-flows.spec.ts -g "complete user journey"    # Specific test
npx playwright show-report      # View detailed test results

# Infrastructure deployment - FUNCTIONAL ✅
npm run frontend:deploy:dev                    # Deploy frontend to dev
cd iac/frontend && ./scripts/deploy/deploy-stack.sh <AWS_PROFILE> --environment <env>
cd iac/backend && sam build && sam deploy     # Manual backend deployment

# CI/CD Pipeline - FULLY OPERATIONAL ✅
# Frontend: Automatic GitHub Actions deployment
# - main branch → dev environment (automatic)
# - staging branch → staging environment (automatic) 
# - production branch → production environment (automatic)

# Backend: Hybrid deployment strategy
# - Dev: Manual scripts for fast iteration (npm run backend:deploy:dev)
# - Staging/Prod: GitHub Actions with branch restrictions

# Promotion Flow - VALIDATED ✅
# main → staging → production (via Pull Requests)
# 🌐 Frontend Deploy to {env} | 🔧 Backend Deploy to {env}
```

## Shared Package Usage

The `apps/shared/` package provides reusable components and utilities:

```tsx
// Import shared components
import { BrandButton, Card, Input } from '@sura-esenciafest/shared'
import { cn, formatDate } from '@sura-esenciafest/shared/utils'
import { User, Room } from '@sura-esenciafest/shared/types'

// Use themed components
<BrandButton variant="client" size="lg">Client Action</BrandButton>
<BrandButton variant="admin" size="lg">Admin Action</BrandButton>
```

**Theme System:**
- `variant="client"` → Blue theme for user-facing app
- `variant="admin"` → Red theme for administrative app

## Infrastructure Deployment

Frontend infrastructure uses sophisticated CloudFormation deployment:

```bash
# Deploy frontend stack - FULLY OPERATIONAL ✅
cd iac/frontend
./scripts/deploy/deploy-stack.sh <AWS_PROFILE> --environment <env>

# Example environments: dev, staging, prod
./scripts/deploy/deploy-stack.sh quatio-andres --environment dev
```

**✅ Successfully Deployed (Dev Environment):**
- Client app: `esenciafest-2025-dev-client` → `dx44kyf0i0jsk.cloudfront.net`
- Admin app: `esenciafest-2025-dev-admin` → `d1wrofli95ydt0.cloudfront.net`
- Custom domains: `dev.esenciafest.com` + `admin.dev.esenciafest.com`

Environment-specific parameters are in `iac/frontend/environments/`:
- `dev.json` - Development environment (PriceClass_100)
- `staging.json` - Staging environment (PriceClass_200)
- `prod.json` - Production environment (PriceClass_All)

## Project Structure

```
apps/
├── client/          # Main user app (esenciafest.com)
├── admin/           # Admin panel (admin.esenciafest.com)
└── shared/          # Shared components and utilities

doc/                 # Comprehensive architecture documentation
├── 01-requerimientos.md
├── 02-drivers-arquitectonicos.md
├── 03-arquitectura-alto-nivel.md
├── 04-api-design.md
├── 05-arquitectura-datos.md
├── 06-arquitectura-aplicacion-cliente.md
└── 07-plan-implementacion.md

iac/
├── frontend/        # Static site deployment (CloudFormation)
├── backend/         # SAM serverless backend
└── shared/          # DNS and shared resources
```

## Admin Panel Authentication Configuration

The admin panel uses **AWS Cognito** for secure authentication, separate from the JWT system used for regular users.

### Environment Configuration

Admin authentication is configured through environment variables in `apps/admin/.env.*`:

```bash
# Development environment (.env.development, .env.local)
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_ag7XaeJiq
NEXT_PUBLIC_COGNITO_CLIENT_ID=2ee9a14lggqjis6d387gu2iam9
NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID=us-east-1:21d4269f-37ed-44d4-b1db-cb93e782ab4b

# Staging environment (.env.staging)
NEXT_PUBLIC_COGNITO_USER_POOL_ID=pending-staging-deployment
NEXT_PUBLIC_COGNITO_CLIENT_ID=pending-staging-deployment
NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID=pending-staging-deployment

# Production environment (.env.production)
NEXT_PUBLIC_COGNITO_USER_POOL_ID=pending-production-deployment
NEXT_PUBLIC_COGNITO_CLIENT_ID=pending-production-deployment
NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID=pending-production-deployment
```

### Hybrid Authentication Architecture

```
┌─────────────────────────────────────┐  ┌─────────────────────────────────────┐
│           REGULAR USERS             │  │            ADMIN USERS              │
│                                     │  │                                     │
│  🌐 esenciafest.com (port 3000)     │  │  🌐 admin.esenciafest.com (port 3001) │
│  🔑 JWT Authentication              │  │  🔑 AWS Cognito Authentication      │
│  💾 DynamoDB USER#email storage     │  │  👤 Cognito User Pool storage       │
│  📍 Endpoints: /auth, /user/*       │  │  📍 Endpoints: /admin/*             │
└─────────────────────────────────────┘  └─────────────────────────────────────┘
```

### Current Admin Users (DEV Environment)

- **Email**: `produccion@quatio.co`
- **Password**: `AdminPassword123!`
- **Role**: Super Admin (can access all admin endpoints)

## Key Features

1. **Hybrid Authentication System**: 
   - JWT-based login/registration with auto-redirect UX flow for regular users
   - AWS Cognito authentication for admin panel with enterprise-grade security
2. **Protected Routes System**: RouteGuard component with automatic redirect preservation and optimized performance (~50ms auth verification)
3. **Admin Panel**: Real-time room control dashboard with Cognito authentication
   - Room override controls (Open/Closed/Auto)
   - Schedule management with datetime controls
   - Multi-environment configuration support
4. **Virtual Ciudadela**: Interactive canvas-based navigation system
5. **5 Specialized Rooms**: Video content, 360° gallery, live chat, forum, external integrations
6. **Social Forum**: Infinite scroll discussion system with real-time updates
7. **External Integrations**: Vimeo video player, Genially interactive content

## Data Architecture

- **Single Table Design**: DynamoDB with composite keys for efficient querying
- **Time Series Logs**: Separate logging table for user activity tracking
- **Real-time Updates**: WebSocket connections for live chat and forum

## Current Status

**✅ PHASE 1 COMPLETED**: Infrastructure + Base Applications
- **Frontend Infrastructure**: Multi-app CloudFormation deployment (client + admin) 
- **Environment Setup**: dev/staging/prod configurations with SSL certificates
- **Deployment Scripts**: Automated deployment pipeline operational
- **Next.js Applications**: Client and Admin apps configured with full stack
- **Shared Package**: Component library with theme system operational
- **Development Workflow**: Turborepo monorepo setup with scripts
- **CI/CD Pipeline**: GitHub Actions automation for frontend, hybrid backend approach

**✅ PHASE 2 COMPLETED**: Authentication System
- **JWT Authentication**: Login/registration system with auto-redirect UX flow
- **Protected Routes**: RouteGuard system with automatic redirect preservation
- **Backend API**: POST /auth endpoint with field validation (name, lastname, country, negocio)
- **User Self-Delete**: DELETE /user/delete endpoint for E2E test cleanup
- **E2E Testing**: Complete user flow validation with automatic cleanup
- **UX Implementation**: Silent auto-redirect from login to registration for new users

**🔄 PHASE 3 IN PROGRESS**: Feature Development
- **Real-time Features**: Chat and forum implementation
- **Content Management**: Admin panel functionality
- **Virtual Ciudadela**: Canvas-based navigation system

**📋 PHASE 4 PENDING:**
- Content management system
- Advanced admin features
- Performance optimization
- WebSocket real-time features

## GitHub Operations Reference

**ALWAYS consult validated GitHub CLI commands when user requests GitHub actions:**

```bash
# Common GitHub Operations - Use EXACTLY these validated commands:

# Issues Management
gh issue list --state open --label "in-progress" --limit 10
gh issue view [number] --json title,body,state,labels,milestone,comments
gh issue edit [number] --assignee [user] --add-label "in-progress"
gh issue create --title "[title]" --body "[body]" --label "[labels]"

# Pull Requests  
gh pr create --title "[title]" --body "[body]"
gh pr view [number] --json title,body,files,additions,deletions,author,state
gh pr comment [number] --body "[comment]"

# Project Management (GraphQL-based)
gh project item-edit \
  --project-id "$PROJECT_ID" \
  --id "$ITEM_ID" \
  --field-id "$STATUS_FIELD_ID" \
  --single-select-option-id "$IN_REVIEW_OPTION_ID"

# Repository Detection (use dynamic values, never hardcode)
REPO_OWNER=$(gh repo view --json owner --jq '.owner.login')
REPO_NAME=$(gh repo view --json name --jq '.name')
```

**Reference Documentation**: See `doc/10-github-workflow.md` for complete validated workflows.

**Important**: 
- When user asks for GitHub actions (create issue, move to review, etc.), FIRST check these validated commands before proceeding.
- NEVER mention Claude, Claude Code, or AI generation in GitHub comments, PR descriptions, or commit messages unless explicitly requested by user.

## Important Notes

- All Next.js apps must be configured for static export (no SSR)
- Canvas interactions require careful performance optimization
- Real-time features use WebSocket connections through API Gateway
- Infrastructure deployment requires AWS CLI configured with appropriate profiles
- Environment-specific configurations are critical for multi-stage deployments