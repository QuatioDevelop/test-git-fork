#!/bin/bash

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/../.." && pwd )"

# Load environment variables from config.env file
if [ -f "$PROJECT_ROOT/config.env" ]; then
    export $(grep -v '^#' "$PROJECT_ROOT/config.env" | xargs)
fi

# Check for required argument
if [ -z "$1" ]; then
    echo "Usage: $0 <AWS_PROFILE> [--environment|-e <environment>] [--force|-f]"
    echo "The AWS_PROFILE was not specified. Call the command with the AWS_PROFILE as the first argument."
    read -p "Press any key to continue..."
    exit 1
fi

AWS_PROFILE=$1
shift  # Remove the first argument (AWS_PROFILE) from the arguments list

# Required environment variables
: ${AWS_REGION:?"AWS_REGION must be set"}
: ${PROJECT_NAME:?"PROJECT_NAME must be set"}

# Parse command line arguments
ENVIRONMENT="dev"  # Default environment
FORCE=false
while [[ $# -gt 0 ]]; do
    case $1 in
        --environment|-e)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --force|-f)
            FORCE=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            read -p "Press any key to continue..."
            exit 1
            ;;
    esac
done

# Debugging output
echo "AWS_REGION: $AWS_REGION"
echo "PROJECT_NAME: $PROJECT_NAME"
echo "AWS_PROFILE: $AWS_PROFILE"
echo "ENVIRONMENT: $ENVIRONMENT"

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    echo "Invalid environment. Must be one of: dev, staging, prod"
    read -p "Press any key to continue..."
    exit 1
fi

STACK_NAME="${PROJECT_NAME}-${ENVIRONMENT}"

# Ask for confirmation
echo -e "\nYou are about to DELETE the following stack:"
echo "Project: $PROJECT_NAME"
echo "Environment: $ENVIRONMENT"
echo "Region: $AWS_REGION"
echo "Stack Name: $STACK_NAME"
echo "AWS Profile: $AWS_PROFILE"
echo -e "\nWARNING: This action will delete all resources associated with this stack!"

if [ "$ENVIRONMENT" == "prod" ] && [ "$FORCE" != "true" ]; then
    echo -e "\n⚠️  WARNING: You are attempting to delete a PRODUCTION stack! ⚠️"
    read -p "Are you absolutely sure you want to proceed? Type 'yes' to confirm: " -r
    if [[ ! $REPLY == "yes" ]]; then
        echo "Operation cancelled"
        read -p "Press any key to continue..."
        exit 1
    fi
else
    read -p "Are you sure you want to proceed? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Operation cancelled"
        read -p "Press any key to continue..."
        exit 1
    fi
fi

# Function to clear a versioned bucket using the clear-versioned-bucket.sh script
clear_bucket() {
    local bucket_name=$1
    if [ -z "$bucket_name" ]; then
        echo "No bucket name provided"
        return 1
    fi

    echo "Clearing bucket: ${bucket_name}"
    bash "${SCRIPT_DIR}/../utils/clear-versioned-bucket.sh" "$bucket_name" "$AWS_PROFILE"
}

# Function to retrieve S3 buckets from environment variables
get_s3_buckets() {
    local static_content_bucket="${PROJECT_NAME}-${ENVIRONMENT}-static-content"
    local logging_bucket="${PROJECT_NAME}-${ENVIRONMENT}-static-content-logs"
    
    echo -e "$static_content_bucket\n$logging_bucket"
}

echo "Deleting stack: ${STACK_NAME}"

# Get all resources from the stack for debugging
echo "Retrieving all resources from the stack..."
ALL_STACK_RESOURCES=$(aws cloudformation describe-stack-resources \
    --stack-name "${STACK_NAME}" \
    --region "${AWS_REGION}" \
    --profile "${AWS_PROFILE}" 2>/dev/null)

# Debugging output to check all resources
echo "All stack resources response: $ALL_STACK_RESOURCES"

# Get all bucket names from the environment variables
echo "Retrieving bucket information..."
ALL_BUCKETS=$(get_s3_buckets)

# Debugging output to check the response
echo "Filtered stack resources response: $ALL_BUCKETS"

if [ ! -z "$ALL_BUCKETS" ] && [ "$ALL_BUCKETS" != "[]" ]; then
    echo "$ALL_BUCKETS" | while read -r bucket; do
        echo -e "\nProcessing bucket: $bucket"
        clear_bucket "$bucket"
    done
else
    echo "No S3 buckets found in stack"
fi

# Delete the stack
aws cloudformation delete-stack \
    --stack-name "${STACK_NAME}" \
    --region "${AWS_REGION}" \
    --profile "${AWS_PROFILE}"

echo "Waiting for stack deletion to complete..."
aws cloudformation wait stack-delete-complete \
    --stack-name "${STACK_NAME}" \
    --region "${AWS_REGION}" \
    --profile "${AWS_PROFILE}"

if [ $? -eq 0 ]; then
    echo "Stack deletion successful!"
else
    echo "Stack deletion failed!"
    
    # Show what resources are still present and why
    echo -e "\nRemaining resources:"
    aws cloudformation describe-stack-events \
        --stack-name "${STACK_NAME}" \
        --region "${AWS_REGION}" \
        --profile "${AWS_PROFILE}" \
        --query 'StackEvents[?ResourceStatus==`DELETE_FAILED`].[LogicalResourceId,ResourceStatus,ResourceStatusReason]' \
        --output table
        
    read -p "Press any key to continue..."
    exit 1
fi

# Pause at the end of the script
read -p "Press any key to exit..."