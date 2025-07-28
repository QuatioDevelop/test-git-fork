const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const jwt = require('jsonwebtoken');
const { addCorsHeaders, handleOptionsRequest } = require('./utils/cors');

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

exports.handler = async (event) => {
    // Handle CORS preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return handleOptionsRequest(event);
    }

    try {
        // Get Authorization header
        const authHeader = event.headers?.Authorization || event.headers?.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return addCorsHeaders({
                statusCode: 401,
                body: JSON.stringify({
                    error: 'unauthorized',
                    message: 'Authorization header required'
                })
            }, event);
        }

        // Extract and verify JWT token
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        let decodedToken;
        
        try {
            decodedToken = jwt.verify(token, JWT_SECRET);
        } catch (jwtError) {
            return addCorsHeaders({
                statusCode: 401,
                body: JSON.stringify({
                    error: 'invalid_token',
                    message: 'Invalid or expired token'
                })
            }, event);
        }

        const userEmail = decodedToken.email;

        if (!userEmail) {
            return addCorsHeaders({
                statusCode: 400,
                body: JSON.stringify({
                    error: 'invalid_token',
                    message: 'Token does not contain email'
                })
            }, event);
        }

        // Delete user from DynamoDB
        await dynamodb.send(new DeleteCommand({
            TableName: process.env.MAIN_TABLE_NAME,
            Key: {
                PK: `USER#${userEmail}`,
                SK: 'PROFILE'
            }
        }));

        return addCorsHeaders({
            statusCode: 200,
            body: JSON.stringify({
                message: 'User deleted successfully'
            })
        }, event);

    } catch (error) {
        console.error('Error in user delete function:', error);
        return addCorsHeaders({
            statusCode: 500,
            body: JSON.stringify({
                error: 'internal_error',
                message: 'Internal server error'
            })
        }, event);
    }
};