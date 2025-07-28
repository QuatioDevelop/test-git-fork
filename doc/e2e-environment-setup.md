# E2E Tests Environment Configuration

## Overview

E2E tests are configured to use the same environment variables as the applications they test. This ensures consistency between the test environment and the actual application environment.

## How it works

1. **Environment Detection**: The `NODE_ENV` variable determines which environment configuration to load:
   - `development` (default): Uses `.env.development` files
   - `staging`: Uses `.env.staging` files  
   - `production`: Uses `.env.production` files

2. **Configuration Loading**: `playwright.config.ts` automatically loads the appropriate `.env` files from:
   - `apps/client/.env.{environment}`
   - `apps/admin/.env.{environment}`

3. **API Endpoint**: Tests use `NEXT_PUBLIC_API_BASE_URL` from the app configuration, ensuring they test against the correct API for each environment.

## Running Tests Locally

```bash
# Test against development (default)
npm run test:e2e

# Test against staging configuration
NODE_ENV=staging npm run test:e2e

# Test against production configuration
NODE_ENV=production npm run test:e2e
```

## CI/CD Pipeline Configuration

For GitHub Actions, add the environment configuration to your workflow:

```yaml
- name: Run Playwright E2E tests
  env:
    NODE_ENV: ${{ github.ref == 'refs/heads/production' && 'production' || github.ref == 'refs/heads/staging' && 'staging' || 'development' }}
  run: npm run test:e2e
```

## Important Notes

1. **User Cleanup**: Test users are automatically created and deleted using the `/user/delete` endpoint. The endpoint URL is determined by `NEXT_PUBLIC_API_BASE_URL`.

2. **Local Testing**: When running locally, tests always use `localhost:3000` and `localhost:3001` for the frontend URLs, but connect to the API specified in the environment configuration.

3. **CI/CD Testing**: In CI/CD, if you need to test against deployed URLs instead of local builds, set:
   ```yaml
   CLIENT_URL: https://dev.esenciafest.com
   ADMIN_URL: https://admin.dev.esenciafest.com
   ```