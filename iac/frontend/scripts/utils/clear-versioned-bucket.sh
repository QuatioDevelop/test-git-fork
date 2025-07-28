#!/bin/bash

# Verificar si se proporcionaron los argumentos necesarios
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <BucketName> <AWS_PROFILE>"
    exit 1
fi

BUCKET_NAME=$1
AWS_PROFILE=$2

echo "Starting clear-versioned-bucket.sh"
echo "Bucket Name: $BUCKET_NAME"
echo "AWS Profile: $AWS_PROFILE"

# Verificar si el bucket existe
if ! aws s3api head-bucket --bucket "$BUCKET_NAME" --profile "$AWS_PROFILE" 2>/dev/null; then
    echo "Bucket $BUCKET_NAME does not exist or you don't have access to it"
    exit 0
fi

# Verificar si el bucket tiene versionamiento habilitado
versioning_status=$(aws s3api get-bucket-versioning --bucket "$BUCKET_NAME" --profile "$AWS_PROFILE" --query 'Status' --output text)
echo "Versioning status: $versioning_status"

if [ "$versioning_status" == "Enabled" ]; then
    echo "Bucket has versioning enabled. Processing all versions..."
    
    # Eliminar todas las versiones usando delete-objects (más eficiente)
    versions_delete=$(aws s3api list-object-versions --bucket "$BUCKET_NAME" --profile "$AWS_PROFILE" --query '{Objects: Versions[].{Key:Key,VersionId:VersionId}}' --output json)
    if [ "$versions_delete" != '{"Objects":[]}' ] && [ "$versions_delete" != "null" ]; then
        echo "Processing versions..."
        aws s3api delete-objects --bucket "$BUCKET_NAME" --profile "$AWS_PROFILE" --delete "$versions_delete"
        echo "Versions processed."
    else
        echo "No versions found."
    fi

    # Eliminar marcadores de eliminación
    markers_delete=$(aws s3api list-object-versions --bucket "$BUCKET_NAME" --profile "$AWS_PROFILE" --query '{Objects: DeleteMarkers[].{Key:Key,VersionId:VersionId}}' --output json)
    if [ "$markers_delete" != '{"Objects":[]}' ] && [ "$markers_delete" != "null" ]; then
        echo "Processing delete markers..."
        aws s3api delete-objects --bucket "$BUCKET_NAME" --profile "$AWS_PROFILE" --delete "$markers_delete"
        echo "Delete markers processed."
    else
        echo "No delete markers found."
    fi
else
    echo "Bucket does not have versioning enabled. Using simple deletion..."
    # Para buckets sin versionamiento, usar el comando simple de eliminación
    aws s3 rm "s3://$BUCKET_NAME" --recursive --profile "$AWS_PROFILE"
fi

echo "Bucket $BUCKET_NAME has been cleared."