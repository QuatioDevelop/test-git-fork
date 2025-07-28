param(
    [Parameter(Mandatory=$true)]
    [string]$BucketName,
    
    [Parameter(Mandatory=$true)]
    [string]$AwsProfile
)

Write-Host "Getting versions for bucket: $BucketName"
$versions = aws s3api list-object-versions --bucket $BucketName --profile $AwsProfile | ConvertFrom-Json

$toDelete = @{
    Objects = @()
}

# Add all versions
if ($versions.Versions) {
    Write-Host "Processing ${$versions.Versions.Count} versions..."
    $versions.Versions | ForEach-Object {
        $toDelete.Objects += @{
            Key = $_.Key
            VersionId = $_.VersionId
        }
    }
}

# Add all delete markers
if ($versions.DeleteMarkers) {
    Write-Host "Processing ${$versions.DeleteMarkers.Count} delete markers..."
    $versions.DeleteMarkers | ForEach-Object {
        $toDelete.Objects += @{
            Key = $_.Key
            VersionId = $_.VersionId
        }
    }
}

if ($toDelete.Objects.Count -gt 0) {
    Write-Host "Found $($toDelete.Objects.Count) objects to delete"
    
    # Convert to JSON and save without BOM
    $toDelete | ConvertTo-Json -Depth 10 | Set-Content -Path .\to-delete.json -NoNewline

    # Delete objects
    Write-Host "Deleting objects..."
    aws s3api delete-objects --bucket $BucketName --delete file://to-delete.json --profile $AwsProfile

    # Clean up temporary file
    Remove-Item -Path .\to-delete.json
} else {
    Write-Host "No objects found to delete"
}

# Try to delete the bucket
Write-Host "Attempting to delete bucket..."
aws s3api delete-bucket --bucket $BucketName --profile $AwsProfile

if ($LASTEXITCODE -eq 0) {
    Write-Host "Bucket deleted successfully"
} else {
    Write-Host "Failed to delete bucket. You may need to run this script again if there were multiple batches of versions"
}