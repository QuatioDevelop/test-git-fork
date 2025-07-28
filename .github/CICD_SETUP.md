# CI/CD Pipeline Setup Guide

## Overview

This project implements a **hybrid CI/CD approach** optimized for the SURA Esencia Fest 2025 platform:

- **Frontend**: Full GitHub Actions automation for all environments
- **Backend**: Hybrid approach - manual scripts for dev, GitHub Actions for staging/prod

## Architecture

### Frontend Deployment (Fully Automated)
- **Target**: Static Next.js apps (client + admin) deployed to S3/CloudFront
- **Environments**: dev, staging, prod
- **Triggers**: 
  - `main` branch → dev environment
  - `staging` branch → staging environment  
  - `production` branch → prod environment
  - Manual dispatch with environment selection

### Backend Deployment (Hybrid)
- **Target**: AWS SAM serverless stack (Lambda + API Gateway + DynamoDB)
- **Dev Environment**: Manual scripts for fast iteration (`npm run backend:deploy:dev`)
- **Staging/Prod**: GitHub Actions with approval gates

## Required Setup

### 1. AWS OIDC Configuration

Create an OIDC identity provider in AWS IAM:

```bash
# 1. Create OIDC provider
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1

# 2. Create IAM role for GitHub Actions
aws iam create-role \
  --role-name GitHubActions-SURA-EsenciaFest \
  --assume-role-policy-document file://trust-policy.json

# 3. Attach necessary policies
aws iam attach-role-policy \
  --role-name GitHubActions-SURA-EsenciaFest \
  --policy-arn arn:aws:iam::aws:policy/PowerUserAccess
```

**trust-policy.json:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::ACCOUNT-ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:QuatioDevelop/sura-esenciafest-2025:*"
        }
      }
    }
  ]
}
```

### 2. GitHub Repository Configuration

#### Environment Variables
Configure in GitHub repo settings → Environments:

**For each environment (dev, staging, prod):**
```
AWS_ROLE_ARN=arn:aws:iam::ACCOUNT-ID:role/GitHubActions-SURA-EsenciaFest
```

**For backend environments (backend-staging, backend-prod):**
```
AWS_ROLE_ARN=arn:aws:iam::ACCOUNT-ID:role/GitHubActions-SURA-EsenciaFest
```

#### Environment Protection Rules
- **dev**: No protection (auto-deploy)
- **staging**: Require reviewers, restrict to staging branch
- **prod**: Require reviewers, restrict to production branch
- **backend-staging**: Require reviewers
- **backend-prod**: Require admin approval

### 3. Branch Strategy

```
main (development) → Auto-deploy frontend to dev
↓
staging → Auto-deploy frontend + backend to staging (with approval)
↓  
production → Auto-deploy frontend + backend to prod (with approval)
```

### 4. Certificate ARNs

Update these in the workflow files based on your AWS account:

```yaml
# For production
API_CERT_ARN: "arn:aws:acm:us-east-1:YOUR-ACCOUNT:certificate/PROD-CERT-ID"

# For dev/staging  
API_CERT_ARN: "arn:aws:acm:us-east-1:YOUR-ACCOUNT:certificate/DEV-CERT-ID"
```

## Development Workflows

### Frontend Development
```bash
# Local development
npm run dev                    # All apps on localhost

# Manual deployment to dev
git push origin main           # Triggers GitHub Actions → dev environment

# Deploy to staging
git checkout staging
git merge main
git push origin staging        # Triggers GitHub Actions → staging (with approval)
```

### Backend Development

#### Option 1: Local Development (Fastest)
```bash
# Start mock APIs locally
npm run backend:local          # SAM Local on localhost:3002

# Test with local frontend
npm run dev                    # Frontend on localhost:3000/3001
```

#### Option 2: Deploy to Dev Cloud (Integration Testing)
```bash
# Quick deploy to AWS dev environment
npm run backend:deploy:dev     # Direct SAM deployment (~2 min)

# Test with deployed frontend
# Frontend auto-deployed via GitHub Actions
```

#### Option 3: Staging/Production (GitHub Actions)
```bash
# Push to staging triggers approval workflow
git push origin staging

# Push to production triggers admin approval workflow  
git push origin production
```

## Available Scripts

### Frontend Scripts
```bash
npm run dev                    # Start all frontend apps
npm run build                  # Build all apps
npm run export                 # Export static builds
npm run lint                   # Lint all apps
npm run type-check             # TypeScript validation
npm run frontend:deploy:dev    # Manual frontend deployment to dev
```

### Backend Scripts
```bash
npm run backend:local          # Start SAM Local APIs (port 3002)
npm run backend:build          # Build SAM application
npm run backend:validate       # Validate SAM template
npm run backend:deploy:dev     # Deploy backend to dev environment
```

## Workflow Files

### `.github/workflows/frontend-deploy.yml`
- **Triggers**: Push to main/staging/production, manual dispatch
- **Jobs**: Build → Deploy
- **Environments**: dev, staging, prod
- **Features**: Artifact caching, build skipping, multi-app deployment

### `.github/workflows/backend-deploy.yml`
- **Triggers**: Push to staging/production, manual dispatch
- **Jobs**: Validate/Build → Deploy
- **Environments**: backend-staging, backend-prod
- **Features**: Change detection, approval gates, health checks

## Troubleshooting

### Common Issues

1. **OIDC Authentication Failures**
   ```
   Error: Could not assume role with OIDC
   ```
   - Verify AWS_ROLE_ARN is correct in environment variables
   - Check trust policy allows the repository
   - Ensure OIDC provider exists

2. **Build Artifacts Not Found**
   ```
   Error: Artifact not found
   ```
   - Check if build job completed successfully
   - Verify artifact names match between upload/download
   - Consider using `skip_build: true` for testing

3. **Frontend Deployment Script Failures**
   ```
   Error: config.env not found
   ```
   - Ensure deployment script creates config.env
   - Check AWS profile configuration in the script

4. **Backend SAM Deployment Issues**
   ```
   Error: Stack does not exist
   ```
   - For first deployment, ensure stack creation parameters are correct
   - Check AWS credentials and region
   - Verify certificate ARNs exist

### Manual Interventions

#### Reset Failed Stack
```bash
# For frontend stacks
cd iac/frontend
scripts/deploy/delete-stack.sh AWS_PROFILE --environment ENVIRONMENT

# For backend stacks  
aws cloudformation delete-stack --stack-name esenciafest-2025-backend-ENVIRONMENT
```

#### Force Backend Deployment
Use workflow dispatch with `force_deploy: true` to bypass change detection.

#### Emergency Rollback
```bash
# Frontend: Deploy previous version
git checkout PREVIOUS_COMMIT
git push origin main --force

# Backend: Use AWS Console to rollback stack
```

## Environment URLs

### Development
- **Client**: https://dev.esenciafest.com
- **Admin**: https://admin.dev.esenciafest.com  
- **API**: https://api.dev.esenciafest.com

### Staging
- **Client**: https://staging.esenciafest.com
- **Admin**: https://admin.staging.esenciafest.com
- **API**: https://api.staging.esenciafest.com

### Production
- **Client**: https://esenciafest.com
- **Admin**: https://admin.esenciafest.com
- **API**: https://api.esenciafest.com

## Next Steps

1. Complete OIDC setup in AWS account
2. Configure GitHub environments and protection rules
3. Test workflows with manual dispatch
4. Set up monitoring and alerting
5. Document emergency procedures
6. Train team on hybrid workflow