# SURA Esencia Fest 2025

Plataforma virtual para evento SURA - Semana del 18 de agosto 2025

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start all applications
npm run dev
```

## 📁 Project Structure

```
sura-esenciafest-2025/
├── apps/
│   ├── client/           # Main user application
│   ├── admin/            # Administrative dashboard  
│   └── shared/           # Shared components, design system & utilities
├── doc/                  # Complete architecture documentation
├── iac/
│   ├── frontend/         # AWS CloudFormation deployment
│   └── backend/          # SAM serverless backend
└── CLAUDE.md             # Development guide & commands
```

## 🛠️ Available Commands

```bash
# Development
npm run dev                    # Start all apps in development
npm run build                  # Build all applications  
npm run export                 # Export static builds
npm run lint                   # Lint all applications
npm run type-check             # TypeScript checking

# Testing
npm run test:unit              # Unit tests (all apps)
npm run test:coverage          # Unit tests with coverage
npm run test:e2e               # E2E tests (Playwright)
npm run test:all               # All tests
./scripts/view-e2e-results.sh  # View E2E results from CI

# Specific E2E Test Suites
npx playwright test tests/e2e/user-flows.spec.ts     # User authentication flow
npx playwright test tests/e2e/admin.spec.ts          # Admin Cognito authentication

# Backend Development  
npm run backend:validate       # Validate SAM template
npm run backend:build          # Build SAM application  
npm run backend:local          # Start SAM Local APIs (port 3002)
npm run backend:deploy:dev     # Deploy backend to dev environment

# Design System (Issue #37 - ✅ COMPLETED)
# - SuraSans corporate fonts integrated
# - Centralized design tokens (colors, typography, spacing)  
# - Client theme (blue) / Admin theme (red) - TEMPORALES, pendientes de diseños finales
# - Documentation: apps/shared/src/styles/README.md

# CDN Assets Management (Issue #63 - ✅ COMPLETED)
# CDN URLs (Dev Environment):
# - CloudFront: https://d1y5o0ybdl3jxe.cloudfront.net
# - Custom Domain: https://assets.dev.esenciafest.com  
# - Genially Content: https://assets.dev.esenciafest.com/genially/sura-content/
# - Presigned URLs API: POST /uploads/presigned-url

# Infrastructure (Manual - Rarely Used)
npm run frontend:infrastructure:dev  # Deploy frontend infrastructure to dev
cd iac/frontend && ./scripts/deploy/deploy-stack.sh <profile> --environment <env>

# CI/CD Pipeline (Fully Operational via GitHub Actions)
# 🌐 Frontend: main → dev | staging → staging | production → prod
# 🔧 Backend: staging → staging | production → prod (dev manual)
# Promotion Flow: main → staging → production (via Pull Requests)
```

## 🚀 Deployment Strategy

### 📦 **Application Deployment (Automatic)**
Frontend apps are deployed automatically via **GitHub Actions**:
- Builds static apps → Uploads to S3 → Invalidates CloudFront
- **Never run manual application deployment**

### 🏗️ **Infrastructure Deployment (Manual - Rare)**  
Infrastructure changes (S3 buckets, CloudFront, etc.) via CloudFormation:
- Only needed for infrastructure changes (SSL certificates, new environments, etc.)
- Use `npm run frontend:infrastructure:dev` for infrastructure updates

### 🔄 **Backend Deployment (Hybrid)**
- **Dev**: Manual scripts (`npm run backend:deploy:dev`) for fast iteration
- **Staging/Prod**: Automatic via GitHub Actions with approval gates

## 🧪 Testing Strategy

This project includes a comprehensive testing framework:

### **Test Types**
- **Unit Tests**: Component and utility function testing (Vitest + React Testing Library)
- **Smoke Tests**: Build validation and critical path verification  
- **E2E Tests**: End-to-end user journey testing (Playwright)

### **Test Execution**
```bash
# Local development
npm run test:unit              # Fast feedback (~1 min)
npm run test:e2e               # Full user journey validation (~3 min)

# Coverage reports  
npm run test:coverage          # Generates HTML reports in apps/*/coverage/
```

### **CI/CD Testing**
- **Feature branches**: Unit + Smoke tests only (~1 min)
- **PRs + main branches**: Full test suite including E2E (~4 min)
- **Manual trigger**: Choose specific test types via GitHub Actions UI

### **Viewing E2E Results**
```bash
# View recent test runs
./scripts/view-e2e-results.sh

# View specific run results
./scripts/view-e2e-results.sh 16258760991

# Or download from GitHub Actions artifacts
gh run download <run-id> -n "playwright-report-*"
```

## 📚 Documentation

- **[Complete Architecture](doc/README.md)** - Full system design and technical specs
- **[Testing Strategy](doc/09-testing-strategy.md)** - Comprehensive testing guide with examples
- **[Shared Components](apps/shared/README.md)** - Component library usage guide
- **[Development Guide](CLAUDE.md)** - Commands and development workflow
- **[CI/CD Guide](doc/08-cicd-pipeline.md)** - GitHub Actions pipeline documentation
- **[Infrastructure](iac/frontend/README.md)** - AWS deployment guide

## 📊 Current Status

**✅ Infrastructure & Core Systems Operational**
- **Frontend Infrastructure**: Multi-app CloudFormation deployment (client + admin)
- **Backend Infrastructure**: SAM serverless backend with DynamoDB and API Gateway
- **CDN Assets Infrastructure**: S3 + CloudFront CDN with SSL certificates and custom domains
- **Authentication**: Hybrid system (JWT for users + AWS Cognito for admin)
- **CI/CD Pipeline**: Complete GitHub Actions automation with promotion flow
- **Testing Framework**: Vitest + Playwright with comprehensive test coverage
- **Content Management**: Genially content hosted and accessible via CDN

**📋 Detailed Implementation Plan**
For complete project phases, milestones, and implementation timeline, see:
**[→ Implementation Plan (doc/07-plan-implementacion.md)](doc/07-plan-implementacion.md)**

Current development focus: Core features and admin panel functionality.

---

**Event Date**: August 18, 2025 | **Client**: SURA