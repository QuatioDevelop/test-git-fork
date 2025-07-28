#!/bin/bash

# E2E Test Runner Script
# This script runs E2E tests with the appropriate environment configuration

# Determine environment (default to development)
ENVIRONMENT=${1:-development}

echo "🧪 Running E2E tests for environment: $ENVIRONMENT"

# Set NODE_ENV for playwright config
export NODE_ENV=$ENVIRONMENT

# For local testing, we always use localhost URLs but vary the API
if [ "$CI" != "true" ]; then
  export CLIENT_URL="http://localhost:3000"
  export ADMIN_URL="http://localhost:3001"
else
  # In CI/CD, use the deployed URLs
  case $ENVIRONMENT in
    staging)
      export CLIENT_URL="https://dev.esenciafest.com"
      export ADMIN_URL="https://admin.dev.esenciafest.com"
      ;;
    production)
      export CLIENT_URL="https://esenciafest.com"
      export ADMIN_URL="https://admin.esenciafest.com"
      ;;
    *)
      # Development or local
      export CLIENT_URL="http://localhost:3000"
      export ADMIN_URL="http://localhost:3001"
      ;;
  esac
fi

# Run the tests
echo "📍 Client URL: $CLIENT_URL"
echo "📍 Admin URL: $ADMIN_URL"
echo "📍 API URL will be loaded from apps/$ENVIRONMENT environment files"

npm run test:e2e