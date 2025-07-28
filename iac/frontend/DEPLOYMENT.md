# Frontend Infrastructure Deployment Guide

## Overview

Complete guide for deploying SURA Esencia Fest 2025 frontend infrastructure across multiple environments using AWS CloudFormation.

## Architecture

- **Multi-app Structure**: Client (`esenciafest.com`) + Admin (`admin.esenciafest.com`) applications
- **Static Export**: Next.js applications built as static sites for S3/CloudFront hosting
- **Multi-environment**: dev, staging, production with environment-specific configurations
- **CDN**: CloudFront distributions with custom domains and SSL certificates

## Prerequisites

1. **AWS CLI** configured with appropriate profile
2. **S3 Template Bucket** available (`quatio-cf-templates-us-east-1`)
3. **SSL Certificates** pre-created in ACM (us-east-1)
4. **Domain DNS** configured for custom domains

## Environment Configuration

Environment-specific parameters are defined in `environments/` directory:

```bash
environments/
├── dev.json      # Development (PriceClass_100)
├── staging.json  # Staging (PriceClass_200)  
└── prod.json     # Production (PriceClass_All)
```

## Deployment Commands

### Single Environment Deployment

```bash
cd iac/frontend
./scripts/deploy/deploy-stack.sh <AWS_PROFILE> --environment <env>
```

### Examples

```bash
# Development environment
./scripts/deploy/deploy-stack.sh quatio-andres --environment dev

# Staging environment  
./scripts/deploy/deploy-stack.sh quatio-andres --environment staging

# Production environment
./scripts/deploy/deploy-stack.sh quatio-andres --environment prod
```

## Deployed Infrastructure

### ✅ DEV Environment
- **Stack Name**: `esenciafest-2025-dev`
- **Client App**: `esenciafest-2025-dev-client` → `dx44kyf0i0jsk.cloudfront.net`
- **Admin App**: `esenciafest-2025-dev-admin` → `d1wrofli95ydt0.cloudfront.net`  
- **Domains**: `dev.esenciafest.com` + `admin.dev.esenciafest.com`
- **Price Class**: PriceClass_100 (US, Canada, Europe)

### ✅ STAGING Environment  
- **Stack Name**: `esenciafest-2025-staging`
- **Client App**: `esenciafest-2025-staging-client` → `d3c9dbxiwp9f1j.cloudfront.net`
- **Admin App**: `esenciafest-2025-staging-admin` → `d2qix49g5v2nob.cloudfront.net`
- **Domains**: `staging.esenciafest.com` + `admin.staging.esenciafest.com`
- **Price Class**: PriceClass_200 (US, Canada, Europe, Asia, Middle East, Africa)

### ✅ PRODUCTION Environment
- **Stack Name**: `esenciafest-2025-prod` 
- **Client App**: `esenciafest-2025-prod-client` → `d20bkf1b1z5fox.cloudfront.net`
- **Admin App**: `esenciafest-2025-prod-admin` → `dhmf9202w1yca.cloudfront.net`
- **Domains**: `esenciafest.com` + `admin.esenciafest.com`
- **Price Class**: PriceClass_All (Global distribution)

## Deployment Process

1. **Template Sync**: Scripts automatically sync CloudFormation templates to S3
2. **Parameter Loading**: Environment-specific parameters loaded from JSON files
3. **Stack Creation/Update**: CloudFormation stack deployed with multi-app architecture
4. **Resource Creation**: S3 buckets + CloudFront distributions created simultaneously
5. **SSL Configuration**: Custom domains configured with pre-existing certificates

## Key Features

- **Multi-app Support**: Both client and admin apps deployed in single stack
- **Environment Separation**: Isolated resources per environment with unique naming
- **Cost Optimization**: Environment-specific CloudFront price classes
- **SSL Security**: HTTPS-only with custom domain certificates
- **Linux Compatibility**: Deployment scripts optimized for Linux environments

## Troubleshooting

### Common Issues

1. **Certificate ARN**: Ensure certificates exist in `us-east-1` region
2. **Template Bucket**: Verify S3 template bucket exists and is accessible
3. **Domain DNS**: Confirm CNAME records point to CloudFront distributions
4. **AWS Profile**: Ensure AWS CLI profile has necessary permissions

### Verification Commands

```bash
# Check stack status
aws cloudformation describe-stacks --stack-name esenciafest-2025-<env> --profile <profile>

# List stack outputs
aws cloudformation describe-stacks --stack-name esenciafest-2025-<env> --query 'Stacks[0].Outputs'

# Test CloudFront distributions
curl -I https://<domain>
```

## Next Steps

After successful frontend deployment:

1. Deploy backend infrastructure (SAM)
2. Build and upload Next.js applications to S3 buckets
3. Configure monitoring (optional)
4. Setup CI/CD pipelines for automated deployments

## Resources Created

Per environment, the following AWS resources are created:

- **2x S3 Buckets**: Static website hosting (client + admin)
- **2x CloudFront Distributions**: CDN with custom domains
- **2x CloudFront Functions**: Security headers and redirects
- **IAM Policies**: S3 bucket access for CloudFront
- **CloudFormation Exports**: For backend integration

## Support

For deployment issues or questions, refer to:
- `PROGRESS.md` - Implementation progress and validation history
- `templates/` - CloudFormation template documentation
- AWS CloudFormation console for stack events and troubleshooting