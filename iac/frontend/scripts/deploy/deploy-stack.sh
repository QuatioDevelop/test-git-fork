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
    echo "Usage: $0 <AWS_PROFILE> [--environment|-e <environment>] [--parameter-file|-p <file>]"
    echo "The AWS_PROFILE was not specified. Call the command with the AWS_PROFILE as the first argument."
    read -p "Press Enter to exit..."
    exit 1
fi

AWS_PROFILE=$1
shift  # Remove the first argument (AWS_PROFILE) from the arguments list

# Required environment variables
: ${AWS_REGION:?"AWS_REGION must be set in config.env"}
: ${PROJECT_NAME:?"PROJECT_NAME must be set in config.env"}
: ${TEMPLATE_BUCKET_NAME:?"TEMPLATE_BUCKET_NAME must be set in config.env"}

# Parse command line arguments
ENVIRONMENT="dev"  # Default environment
while [[ $# -gt 0 ]]; do
    case $1 in
        --environment|-e)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --parameter-file|-p)
            PARAMETER_FILE="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            read -p "Press Enter to exit..."
            exit 1
            ;;
    esac
done

# Use default parameter file if not specified
if [ -z "$PARAMETER_FILE" ]; then
    PARAMETER_FILE="${PROJECT_ROOT}/environments/${ENVIRONMENT}.json"
fi

# Validate parameter file exists
if [ ! -f "$PARAMETER_FILE" ]; then
    echo "Parameter file not found: $PARAMETER_FILE"
    read -p "Press Enter to exit..."
    exit 1
fi

# Create a temporary parameter file with ProjectName and TemplateBucket injected
TEMP_PARAMS_FILE="${PROJECT_ROOT}/environments/temp_params_${ENVIRONMENT}.json"

# Clean up temp file on script exit
trap 'rm -f "${TEMP_PARAMS_FILE}"' EXIT

# Read the original parameter file and inject parameters
cat > "$TEMP_PARAMS_FILE" << EOF
{
    "Parameters": {
        "ProjectName": "${PROJECT_NAME}",
        "Environment": "${ENVIRONMENT}",
        "TemplateBucket": "${TEMPLATE_BUCKET_NAME}",
EOF

# Extract all parameters except ProjectName, Environment, and TemplateBucket (already injected)
sed -n '/"Parameters": {/,/}/p' "$PARAMETER_FILE" | \
    grep -v -E '"(ProjectName|Environment|TemplateBucket)"' | \
    grep -E '^        "' | \
    sed 's/^        /        /' >> "$TEMP_PARAMS_FILE"

# Add Tags section
cat >> "$TEMP_PARAMS_FILE" << EOF
    },
    "Tags": {
        "Project": "${PROJECT_NAME}",
        "Environment": "${ENVIRONMENT}",
        "ManagedBy": "CloudFormation"
    }
}
EOF

# Show deployment configuration
show_status "Deployment Configuration"
echo "Project: $PROJECT_NAME"
echo "Environment: $ENVIRONMENT"
echo "Region: $AWS_REGION"
echo "Template bucket: $TEMPLATE_BUCKET_NAME"
echo "AWS Profile: $AWS_PROFILE"
echo -e "\nParameter file: $PARAMETER_FILE"
echo -e "\nParameters to be used:"
cat "$TEMP_PARAMS_FILE"

echo -e "\nPlease review the configuration carefully."
read -p "Are you sure you want to proceed with deployment? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Operation cancelled"
    read -p "Press Enter to exit..."
    exit 1
fi

# Deploy stack
STACK_NAME="${PROJECT_NAME}-${ENVIRONMENT}"

show_status "Template Synchronization"
echo "Syncing templates..."

# First sync templates
if [ ! -f "${SCRIPT_DIR}/sync-templates.sh" ]; then
    echo "Error: sync-templates.sh not found at: ${SCRIPT_DIR}/sync-templates.sh"
    read -p "Press Enter to exit..."
    exit 1
fi

bash "${SCRIPT_DIR}/sync-templates.sh" "${AWS_PROFILE}"

# Verify if templates exist in S3
echo -e "\nVerifying template existence in S3..."
if ! aws s3 ls "s3://${TEMPLATE_BUCKET_NAME}/${PROJECT_NAME}/nested/" --profile "${AWS_PROFILE}" &> /dev/null; then
    echo "Error: Templates not found in S3 bucket. Please check if sync was successful."
    read -p "Press Enter to exit..."
    exit 1
fi

show_status "Stack Verification"
# Check and clean up existing failed stack
delete_stack_if_exists "${STACK_NAME}"

show_status "Stack Deployment"
# Deploy the stack
aws cloudformation deploy \
    --template-file "${PROJECT_ROOT}/templates/main.yaml" \
    --stack-name "${STACK_NAME}" \
    --parameter-overrides "file://${TEMP_PARAMS_FILE}" \
    --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
    --region "${AWS_REGION}" \
    --profile "${AWS_PROFILE}" \
    --tags Project="${PROJECT_NAME}" Environment="${ENVIRONMENT}" ManagedBy=CloudFormation

DEPLOY_STATUS=$?

if [ $DEPLOY_STATUS -eq 0 ]; then
    show_status "Deployment Successful"
    echo "Retrieving stack outputs..."
    aws cloudformation describe-stacks \
        --stack-name "${STACK_NAME}" \
        --query 'Stacks[0].Outputs' \
        --region "${AWS_REGION}" \
        --profile "${AWS_PROFILE}" \
        --output table
else
    show_status "Deployment Failed"
    echo "Stack events (most recent first):"
    aws cloudformation describe-stack-events \
        --stack-name "${STACK_NAME}" \
        --query 'StackEvents[?ResourceStatus==`CREATE_FAILED` || ResourceStatus==`UPDATE_FAILED`].[LogicalResourceId,ResourceStatus,ResourceStatusReason]' \
        --region "${AWS_REGION}" \
        --profile "${AWS_PROFILE}" \
        --output table
fi

# Final pause
echo -e "\nScript execution completed."
read -p "Press Enter to exit..."