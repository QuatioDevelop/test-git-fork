const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, UpdateCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
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
        // Verify JWT token
        const authHeader = event.headers.Authorization || event.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            const response = {
                statusCode: 401,
                body: JSON.stringify({
                    error: 'unauthorized',
                    message: 'Bearer token required'
                })
            };
            return addCorsHeaders(response, event);
        }

        const token = authHeader.substring(7);
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            const response = {
                statusCode: 401,
                body: JSON.stringify({
                    error: 'invalid_token',
                    message: 'Invalid or expired token'
                })
            };
            return addCorsHeaders(response, event);
        }

        const userEmail = decoded.email;
        const httpMethod = event.httpMethod;

        if (httpMethod === 'GET') {
            // Get user progress
            const result = await dynamodb.send(new GetCommand({
                TableName: process.env.MAIN_TABLE_NAME,
                Key: {
                    PK: `USER#${userEmail}`,
                    SK: 'PROFILE'
                }
            }));

            if (!result.Item) {
                const response = {
                    statusCode: 404,
                    body: JSON.stringify({
                        error: 'user_not_found',
                        message: 'User not found'
                    })
                };
                return addCorsHeaders(response, event);
            }

            const response = {
                statusCode: 200,
                body: JSON.stringify({
                    progress: result.Item.progress || []
                })
            };
            return addCorsHeaders(response, event);

        } else if (httpMethod === 'PUT') {
            // Update user progress - add room to completed list
            const salaId = event.pathParameters?.salaId;
            if (!salaId) {
                const response = {
                    statusCode: 400,
                    body: JSON.stringify({
                        error: 'sala_id_required',
                        message: 'Sala ID is required'
                    })
                };
                return addCorsHeaders(response, event);
            }

            // Add room to user's progress
            await dynamodb.send(new UpdateCommand({
                TableName: process.env.MAIN_TABLE_NAME,
                Key: {
                    PK: `USER#${userEmail}`,
                    SK: 'PROFILE'
                },
                UpdateExpression: 'SET progress = list_append(if_not_exists(progress, :empty_list), :sala_list)',
                ExpressionAttributeValues: {
                    ':empty_list': [],
                    ':sala_list': [salaId]
                }
            }));

            // Log activity
            await dynamodb.send(new PutCommand({
                TableName: process.env.LOGS_TABLE_NAME,
                Item: {
                    PK: `USER#${userEmail}`,
                    SK: `ACTIVITY#${Date.now()}`,
                    action: 'room_completed',
                    salaId: salaId,
                    timestamp: new Date().toISOString(),
                    ttl: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60) // 90 days
                }
            }));

            const response = {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'Progress updated successfully',
                    salaId: salaId
                })
            };
            return addCorsHeaders(response, event);
        }

        const response = {
            statusCode: 405,
            body: JSON.stringify({
                error: 'method_not_allowed',
                message: 'Method not allowed'
            })
        };
        return addCorsHeaders(response, event);

    } catch (error) {
        console.error('Error in user-progress function:', error);
        const response = {
            statusCode: 500,
            body: JSON.stringify({
                error: 'internal_error',
                message: 'Internal server error'
            })
        };
        return addCorsHeaders(response, event);
    }
};