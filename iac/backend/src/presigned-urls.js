const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { handleOptionsRequest, addCorsHeaders } = require('./utils/cors');

const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });

/**
 * Lambda function to generate presigned URLs for S3 uploads
 * Supports: images, videos, HTML files (Genially content), documents
 */
exports.handler = async (event) => {
    console.log('Presigned URL request:', JSON.stringify(event, null, 2));
    
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return handleOptionsRequest(event);
    }
    
    try {
        const { fileName, fileType, category = 'general' } = JSON.parse(event.body || '{}');
        
        // Validate required parameters
        if (!fileName || !fileType) {
            return addCorsHeaders({
                statusCode: 400,
                body: JSON.stringify({
                    error: 'fileName and fileType are required',
                    details: 'Provide fileName (string) and fileType (MIME type)'
                })
            }, event);
        }
        
        // Validate file type against allowed types
        const allowedTypes = [
            // Images
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
            // Videos
            'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov',
            // HTML (Genially content)
            'text/html', 'application/zip', 'application/x-zip-compressed',
            // Documents
            'application/pdf', 'application/json', 'text/plain', 'text/css', 'application/javascript'
        ];
        
        if (!allowedTypes.includes(fileType)) {
            return addCorsHeaders({
                statusCode: 400,
                body: JSON.stringify({
                    error: 'File type not allowed',
                    allowedTypes: allowedTypes,
                    received: fileType
                })
            }, event);
        }
        
        // Generate safe key with category prefix
        const timestamp = Date.now();
        const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const s3Key = `${category}/${timestamp}-${safeName}`;
        
        // Create presigned URL parameters
        const command = new PutObjectCommand({
            Bucket: process.env.ASSETS_BUCKET_NAME,
            Key: s3Key,
            ContentType: fileType,
            Metadata: {
                category: category,
                originalName: fileName,
                uploadedAt: new Date().toISOString()
            }
        });
        
        // Generate presigned URL (valid for 15 minutes)
        const presignedUrl = await getSignedUrl(s3Client, command, { 
            expiresIn: 900 // 15 minutes
        });
        
        // Generate CloudFront URL for accessing the file after upload
        const cloudFrontDomain = process.env.CLOUDFRONT_DOMAIN;
        const publicUrl = cloudFrontDomain ? 
            `https://${cloudFrontDomain}/${s3Key}` : 
            `https://${process.env.ASSETS_BUCKET_NAME}.s3.amazonaws.com/${s3Key}`;
        
        const response = {
            presignedUrl,
            s3Key,
            publicUrl,
            expiresIn: 900,
            uploadHeaders: {
                'Content-Type': fileType
            }
        };
        
        console.log('Generated presigned URL successfully:', { s3Key, category });
        
        return addCorsHeaders({
            statusCode: 200,
            body: JSON.stringify(response)
        }, event);
        
    } catch (error) {
        console.error('Error generating presigned URL:', error);
        
        return addCorsHeaders({
            statusCode: 500,
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message
            })
        }, event);
    }
};