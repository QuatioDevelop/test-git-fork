#!/bin/bash

# Function declarations
show_status() {
    echo -e "\n=== $1 ==="
}

test_url_access() {
    local url=$1
    if curl -s -f -I "$url" &>/dev/null; then
        return 0
    else
        return 1
    fi
}

show_result() {
    if [ $2 -eq 0 ]; then
        echo "✓ $1" 
    else
        echo "✗ $1"
    fi
}

clean_test_files() {
    local bucket=$1
    echo -e "\nCleaning test files from bucket..."
    if aws s3 rm "s3://${bucket}/" --recursive \
        --region "$AWS_REGION" \
        --profile "$AWS_PROFILE" \
        --exclude "*" \
        --include "index.html" \
        --include "error.html"; then
        show_result "Test files cleaned successfully" 0
    else
        show_result "Failed to clean test files" 1
    fi
}

# Get script directory and project root
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
    echo "Usage: $0 <AWS_PROFILE> [--environment|-e <environment>]"
    echo "The AWS_PROFILE was not specified. Call the command with the AWS_PROFILE as the first argument."
    read -p "Press Enter to exit..."
    exit 1
fi

AWS_PROFILE=$1
shift  # Remove the first argument (AWS_PROFILE) from the arguments list

# Required environment variables
: ${AWS_REGION:?"AWS_REGION must be set in config.env"}
: ${PROJECT_NAME:?"PROJECT_NAME must be set in config.env"}

# Parse command line arguments
ENVIRONMENT="dev"  # Default environment
while [[ $# -gt 0 ]]; do
    case $1 in
        --environment|-e)
            ENVIRONMENT="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            read -p "Press Enter to exit..."
            exit 1
            ;;
    esac
done

# Define bucket name based on stack name pattern
STACK_NAME="${PROJECT_NAME}-${ENVIRONMENT}"
BUCKET_NAME="${PROJECT_NAME}-${ENVIRONMENT}-static-content"

show_status "Starting S3 Website Tests"
echo "Project: $PROJECT_NAME"
echo "Environment: $ENVIRONMENT"
echo "Region: $AWS_REGION"
echo "Bucket: $BUCKET_NAME"
echo "AWS Profile: $AWS_PROFILE"

# Step 1: Verify bucket exists and website configuration
show_status "Checking Bucket Configuration"
if aws s3api get-bucket-website \
    --bucket "$BUCKET_NAME" \
    --region "$AWS_REGION" \
    --profile "$AWS_PROFILE" &>/dev/null; then
    show_result "Bucket website configuration exists" 0
    
    # Get and display website configuration
    aws s3api get-bucket-website \
        --bucket "$BUCKET_NAME" \
        --region "$AWS_REGION" \
        --profile "$AWS_PROFILE" \
        --output json
else
    show_result "Bucket website configuration check failed" 1
    read -p "Press Enter to exit..."
    exit 1
fi

# Step 2: Upload test files
show_status "Uploading Test Files"
TEST_FILES_PATH="${PROJECT_ROOT}/test/website-test"

if aws s3 cp "$TEST_FILES_PATH" "s3://${BUCKET_NAME}/" \
    --recursive \
    --region "$AWS_REGION" \
    --profile "$AWS_PROFILE"; then
    show_result "Test files uploaded successfully" 0
else
    show_result "Failed to upload test files" 1
    read -p "Press Enter to exit..."
    exit 1
fi

# Step 3: Test website endpoint
show_status "Testing Website Endpoint"
WEBSITE_URL="http://${BUCKET_NAME}.s3-website-${AWS_REGION}.amazonaws.com"
echo "Website URL: $WEBSITE_URL"

# Test index.html access
if test_url_access "$WEBSITE_URL"; then
    show_result "Index page is accessible" 0
    INDEX_TEST=0
else
    show_result "Index page is not accessible" 1
    INDEX_TEST=1
fi

# Test error page
if test_url_access "$WEBSITE_URL/non-existent-page"; then
    show_result "Error page test failed (should return 404)" 1
    ERROR_TEST=1
else
    show_result "Error page is properly configured" 0
    ERROR_TEST=0
fi

# Step 4: Check bucket policy
show_status "Checking Bucket Policy"
if aws s3api get-bucket-policy \
    --bucket "$BUCKET_NAME" \
    --region "$AWS_REGION" \
    --profile "$AWS_PROFILE" &>/dev/null; then
    show_result "Bucket has a policy configured" 0
    POLICY_TEST=0
    
    # Display the policy
    aws s3api get-bucket-policy \
        --bucket "$BUCKET_NAME" \
        --region "$AWS_REGION" \
        --profile "$AWS_PROFILE" \
        --output json
else
    show_result "Bucket policy not found" 1
    POLICY_TEST=1
fi

# Summary
show_status "Test Summary"
echo "Website URL: $WEBSITE_URL"
echo "Test Files Location: $TEST_FILES_PATH"

if [ $INDEX_TEST -eq 0 ] && [ $ERROR_TEST -eq 0 ] && [ $POLICY_TEST -eq 0 ]; then
    echo -e "\n✅ All tests passed successfully!"
else
    echo -e "\n❌ Some tests failed. Please check the output above."
fi

echo -e "\nManual Verification Steps:"
echo "1. Visit $WEBSITE_URL to check the index page"
echo "2. Visit $WEBSITE_URL/non-existent-page to check the error page"
echo "3. Review the bucket policy output above"

# Ask if user wants to clean up test files
echo -e "\nWould you like to remove the test files from the bucket? (y/N)"
read -r CLEAN_UP
if [[ $CLEAN_UP =~ ^[Yy]$ ]]; then
    clean_test_files "$BUCKET_NAME"
fi

# Final pause
echo -e "\nScript execution completed."
read -p "Press Enter to exit..."