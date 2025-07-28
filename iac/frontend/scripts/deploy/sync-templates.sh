#!/bin/bash

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/../.." && pwd )"

# Load environment variables from config.env file
if [ -f "$PROJECT_ROOT/config.env" ]; then
    export $(grep -v '^#' "$PROJECT_ROOT/config.env" | xargs)
fi

# Check for AWS_PROFILE parameter
if [ -z "$1" ]; then
    echo "Usage: $0 <AWS_PROFILE>"
    echo "The AWS_PROFILE was not specified. Call the command with the AWS_PROFILE as the first argument."
    read -p "Press any key to continue..."
    exit 1
fi

AWS_PROFILE=$1

# Debugging output
echo "AWS_REGION: $AWS_REGION"
echo "PROJECT_NAME: $PROJECT_NAME"
echo "TEMPLATE_BUCKET_NAME: $TEMPLATE_BUCKET_NAME"
echo "AWS_PROFILE: $AWS_PROFILE"

# Required environment variables
: ${AWS_REGION:?"AWS_REGION must be set"}
: ${PROJECT_NAME:?"PROJECT_NAME must be set"}
TEMPLATE_BUCKET_NAME=${TEMPLATE_BUCKET_NAME:-"company-cf-templates-${AWS_REGION}"}

# Create the bucket if it doesn't exist
if ! aws s3 ls "s3://${TEMPLATE_BUCKET_NAME}" --profile ${AWS_PROFILE} 2>&1 > /dev/null; then
    echo "Creating S3 bucket: ${TEMPLATE_BUCKET_NAME}"
    aws s3 mb "s3://${TEMPLATE_BUCKET_NAME}" --region ${AWS_REGION} --profile ${AWS_PROFILE}
    aws s3api put-bucket-versioning \
        --bucket ${TEMPLATE_BUCKET_NAME} \
        --versioning-configuration Status=Enabled \
        --profile ${AWS_PROFILE}
fi

# Sync templates to S3
echo "Syncing templates to s3://${TEMPLATE_BUCKET_NAME}/${PROJECT_NAME}/"
aws s3 sync "${PROJECT_ROOT}/templates/" \
    "s3://${TEMPLATE_BUCKET_NAME}/${PROJECT_NAME}/" \
    --delete \
    --exclude "*.md" \
    --exclude "*.txt" \
    --include "*.yaml" \
    --include "*.yml" \
    --profile ${AWS_PROFILE}

if [ $? -eq 0 ]; then
    echo "Templates successfully synced to S3"
else
    echo "Error syncing templates to S3"
    read -p "Press any key to continue..."
    exit 1
fi