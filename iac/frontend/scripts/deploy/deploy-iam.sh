#!/bin/bash

# Function declarations - MUST BE AT THE START
check_stack_status() {
    local stack_name=$1
    aws cloudformation describe-stacks \
        --stack-name "$stack_name" \
        --query 'Stacks[0].StackStatus' \
        --region "${AWS_REGION}" \
        --profile "${AWS_PROFILE}" \
        2>/dev/null || echo "DOES_NOT_EXIST"
}

delete_stack_if_exists() {
    local stack_name=$1
    local stack_status=$(check_stack_status "$stack_name")
    
    echo -e "\nChecking stack status for: ${stack_name}"
    echo "Current status: ${stack_status}"
    
    if [ "$stack_status" != "DOES_NOT_EXIST" ]; then
        if [ "$stack_status" = "\"ROLLBACK_COMPLETE\"" ] || [ "$stack_status" = "\"CREATE_FAILED\"" ]; then
            echo -e "\nStack is in a failed state and needs to be deleted before proceeding."
            read -p "Press Enter to delete the failed stack or Ctrl+C to cancel..."
            
            echo "Deleting stack ${stack_name}..."
            aws cloudformation delete-stack \
                --stack-name "$stack_name" \
                --region "${AWS_REGION}" \
                --profile "${AWS_PROFILE}"
            
            echo "Waiting for stack deletion to complete..."
            aws cloudformation wait stack-delete-complete \
                --stack-name "$stack_name" \
                --region "${AWS_REGION}" \
                --profile "${AWS_PROFILE}"
            
            if [ $? -eq 0 ]; then
                echo "Stack successfully deleted"
                return 0
            else
                echo "Error deleting stack"
                read -p "Press Enter to exit..."
                exit 1
            fi
        fi
        
        if [ "$stack_status" = "\"ROLLBACK_COMPLETE\"" ]; then
            echo "Error: Stack is still in ROLLBACK_COMPLETE state."
            echo "Manual intervention may be required."
            read -p "Press Enter to exit..."
            exit 1
        fi
        
        echo "Stack exists and is in ${stack_status} state."
    else
        echo "No existing stack found. Proceeding with creation..."
    fi
}

# Function to show status headers
show_status() {
    echo -e "\n=== $1 ==="
}

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/../.." && pwd )"

# Load environment variables from config.env file
if [ -f "$PROJECT_ROOT/config.env" ]; then
    echo "Loading config.env file..."
    export $(grep -v '^#' "$PROJECT_ROOT/config.env" | xargs)
else
    echo "No config.env file found at: $PROJECT_ROOT/config.env"
    read -p "Press Enter to exit..."
    exit 1
fi

# Check for required argument
if [ -z "$1" ]; then
    echo "Usage: $0 <AWS_PROFILE>"
    echo "The AWS_PROFILE was not specified. Call the command with the AWS_PROFILE as the first argument."
    read -p "Press Enter to exit..."
    exit 1
fi

AWS_PROFILE=$1

# Required environment variables
: ${AWS_REGION:?"AWS_REGION must be set in config.env"}
: ${PROJECT_NAME:?"PROJECT_NAME must be set in config.env"}

# Derive stack names automatically
STAGING_STACK="${PROJECT_NAME}-staging"
PRODUCTION_STACK="${PROJECT_NAME}-prod"
STACK_NAME="${PROJECT_NAME}-cicd"

# Show deployment configuration
show_status "CI/CD IAM Deployment Configuration"
echo "Project: $PROJECT_NAME"
echo "Region: $AWS_REGION"
echo "AWS Profile: $AWS_PROFILE"
echo "Template: iam-cicd.yaml"
echo "Staging Stack: $STAGING_STACK"
echo "Production Stack: $PRODUCTION_STACK"

echo -e "\nThis will create an IAM user for CI/CD with access to S3 buckets and CloudFront distributions."
echo "Note: Access keys will need to be created manually after deployment."
read -p "Are you sure you want to proceed with CI/CD IAM deployment? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Operation cancelled"
    read -p "Press Enter to exit..."
    exit 1
fi

show_status "Dependency Verification"
echo "Verifying required stacks exist..."

STAGING_STATUS=$(check_stack_status "$STAGING_STACK")
PRODUCTION_STATUS=$(check_stack_status "$PRODUCTION_STACK")

echo "Staging stack ($STAGING_STACK): $STAGING_STATUS"
echo "Production stack ($PRODUCTION_STACK): $PRODUCTION_STATUS"

if [ "$STAGING_STATUS" = "DOES_NOT_EXIST" ] || [ "$PRODUCTION_STATUS" = "DOES_NOT_EXIST" ]; then
    echo -e "\nError: Required dependency stacks do not exist."
    echo "Please deploy staging and production stacks first before creating CI/CD IAM user."
    read -p "Press Enter to exit..."
    exit 1
fi

show_status "CI/CD IAM Stack Verification"
delete_stack_if_exists "${STACK_NAME}"

show_status "CI/CD IAM Stack Deployment"

# Deploy the stack
aws cloudformation deploy \
    --template-file "${PROJECT_ROOT}/templates/iam-cicd.yaml" \
    --stack-name "${STACK_NAME}" \
    --parameter-overrides ProjectName="${PROJECT_NAME}" \
    --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
    --region "${AWS_REGION}" \
    --profile "${AWS_PROFILE}" \
    --tags Project="${PROJECT_NAME}" Purpose=CI-CD ManagedBy=CloudFormation

DEPLOY_STATUS=$?

if [ $DEPLOY_STATUS -eq 0 ]; then
    show_status "CI/CD IAM Deployment Successful"
    echo "Retrieving CI/CD IAM stack outputs..."
    
    OUTPUTS=$(aws cloudformation describe-stacks \
        --stack-name "${STACK_NAME}" \
        --query 'Stacks[0].Outputs' \
        --region "${AWS_REGION}" \
        --profile "${AWS_PROFILE}" \
        --output table)
    
    echo "$OUTPUTS"
    
    USER_NAME=$(aws cloudformation describe-stacks \
        --stack-name "${STACK_NAME}" \
        --query 'Stacks[0].Outputs[?OutputKey==`CICDUserName`].OutputValue' \
        --region "${AWS_REGION}" \
        --profile "${AWS_PROFILE}" \
        --output text)
    
    echo -e "\n=== NEXT STEPS ==="
    echo "1. Create access keys for the CI/CD user:"
    echo "   aws iam create-access-key --user-name $USER_NAME --profile $AWS_PROFILE"
    echo ""
    echo "2. Add the credentials to your GitHub repository secrets:"
    echo "   - Repository Settings > Secrets and variables > Actions"
    echo "   - Add AWS_ACCESS_KEY_ID"
    echo "   - Add AWS_SECRET_ACCESS_KEY"
    echo ""
    echo "3. Update your GitHub workflow with the correct bucket names and CloudFront distribution IDs from the outputs above."
    
else
    show_status "CI/CD IAM Deployment Failed"
    echo "Stack events (most recent first):"
    aws cloudformation describe-stack-events \
        --stack-name "${STACK_NAME}" \
        --query 'StackEvents[?ResourceStatus==`CREATE_FAILED` || ResourceStatus==`UPDATE_FAILED`].[LogicalResourceId,ResourceStatus,ResourceStatusReason]' \
        --region "${AWS_REGION}" \
        --profile "${AWS_PROFILE}" \
        --output table
fi

echo -e "\nScript execution completed."
read -p "Press Enter to exit..."