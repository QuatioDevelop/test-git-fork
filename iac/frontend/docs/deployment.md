# Deployment Guide

This guide explains how to deploy and delete the static site infrastructure using the provided scripts.

## Prerequisites

- AWS CLI installed and configured
- AWS profile with necessary permissions
- Bash environment (Git Bash on Windows)
- `config.env` file configured with project settings

## Environment Setup

1. Configure `config.env` in project root:
   ```properties
   PROJECT_NAME=chat-admin
   AWS_REGION=us-east-1
   TEMPLATE_BUCKET_NAME=quatio-cf-templates-us-east-1
   ```

2. Configure environment files in `environments/`:
   ```json
   {
       "Parameters": {
           "DomainName": "example.com",
           "PriceClass": "PriceClass_200",
           "CertificateArn": "arn:aws:acm:..."
       }
   }
   ```

## Deployment

Use the `deploy-stack.sh` script to deploy the infrastructure:

```bash
./scripts/deploy/deploy-stack.sh <AWS_PROFILE> -e <ENVIRONMENT>
```

### Parameters:
- `AWS_PROFILE`: Required. The AWS CLI profile to use
- `-e, --environment`: Optional. Environment to deploy (dev, staging, prod). Defaults to 'dev'

### Example:
```bash
./scripts/deploy/deploy-stack.sh my-profile -e dev
```

### What the script does:
1. Loads configuration from `config.env`
2. Syncs templates to the S3 bucket
3. Checks for existing stack
4. Creates/Updates the CloudFormation stack
5. Shows stack outputs upon completion

## CI/CD IAM Setup

After deploying staging and production stacks, create CI/CD user:

```bash
./scripts/deploy/deploy-iam.sh <AWS_PROFILE>
```

**Requirements:**
- Both staging and prod stacks must exist first
- Creates IAM user with S3 and CloudFront permissions
- Outputs user name for access key creation

**Manual steps after deployment:**
1. Create access keys: `aws iam create-access-key --user-name <USERNAME>`
2. Add credentials to GitHub Actions secrets

## Stack Deletion

Use the `delete-stack.sh` script to delete the infrastructure:

```bash
./scripts/deploy/delete-stack.sh <AWS_PROFILE> -e <ENVIRONMENT> [--force]
```

### Parameters:
- `AWS_PROFILE`: Required. The AWS CLI profile to use
- `-e, --environment`: Optional. Environment to delete (dev, staging, prod). Defaults to 'dev'
- `-f, --force`: Optional. Skip additional confirmation for production environment

### Example:
```bash
./scripts/deploy/delete-stack.sh my-profile -e dev
```

### What the script does:
1. Loads configuration from `config.env`
2. Asks for confirmation
3. Empties S3 buckets (including versioned objects)
4. Deletes the CloudFormation stack
5. Shows deletion status

### Safety Features:
- Additional confirmation required for production environment
- Shows resources to be deleted before proceeding
- Properly handles S3 bucket cleanup including versions

## Additional Utilities

### Clear Versioned Bucket Utility

If you need to manually clear a versioned S3 bucket, use the utility script:

```powershell
./scripts/utils/clear-versioned-bucket.ps1 -BucketName <BUCKET_NAME> -AwsProfile <AWS_PROFILE>
```

This utility:
- Removes all versions of all objects
- Removes all delete markers
- Attempts to delete the bucket itself

## Error Handling

Common errors and solutions:

1. **Stack Delete Failed**:
   - Use the clear-versioned-bucket utility to manually clean up S3 buckets
   - Retry the delete-stack script

2. **Template Format Error**:
   - Check the syntax in environment JSON files
   - Ensure templates are properly synced to S3

3. **Access Denied**:
   - Verify AWS profile permissions
   - Check bucket policies