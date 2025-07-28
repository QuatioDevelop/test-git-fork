const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { addCorsHeaders, handleOptionsRequest } = require('./utils/cors');
const { validateCognitoToken, createAuthErrorResponse } = require('./utils/cognito-auth');

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    // Handle CORS preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return handleOptionsRequest(event);
    }

    try {
        // Validate Cognito authentication for admin endpoints
        const authResult = await validateCognitoToken(event);
        
        if (!authResult.isValid) {
            console.log('Admin rooms access denied:', {
                error: authResult.error,
                endpoint: event.resource,
                sourceIp: event.requestContext?.identity?.sourceIp
            });
            return createAuthErrorResponse(authResult, event);
        }

        console.log('Admin rooms endpoint called by authenticated user:', {
            username: authResult.user.username,
            email: authResult.user.email,
            endpoint: event.resource,
            method: event.httpMethod
        });

        const roomId = event.pathParameters?.roomId;
        if (!roomId) {
            const response = {
                statusCode: 400,
                body: JSON.stringify({
                    error: 'room_id_required',
                    message: 'Room ID is required'
                })
            };
            return addCorsHeaders(response, event);
        }

        const httpMethod = event.httpMethod;
        const path = event.resource;

        if (httpMethod === 'PUT' && path === '/admin/rooms/{roomId}/override') {
            // Update room manual override
            const body = JSON.parse(event.body || '{}');
            const { override } = body;

            // Validate override value
            if (override !== null && override !== 'open' && override !== 'closed') {
                const response = {
                    statusCode: 400,
                    body: JSON.stringify({
                        error: 'invalid_override',
                        message: 'Override must be "open", "closed", or null'
                    })
                };
                return addCorsHeaders(response, event);
            }

            // Update room in database
            const updateParams = {
                TableName: process.env.MAIN_TABLE_NAME,
                Key: {
                    PK: 'ROOM#STATUS',
                    SK: `ROOM#${roomId}`
                },
                UpdateExpression: 'SET manualOverride = :override, updatedAt = :updatedAt',
                ExpressionAttributeValues: {
                    ':override': override,
                    ':updatedAt': new Date().toISOString()
                },
                ReturnValues: 'ALL_NEW'
            };

            const result = await dynamodb.send(new UpdateCommand(updateParams));

            if (!result.Attributes) {
                const response = {
                    statusCode: 404,
                    body: JSON.stringify({
                        error: 'room_not_found',
                        message: 'Room not found'
                    })
                };
                return addCorsHeaders(response, event);
            }

            const response = {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'Room override updated successfully',
                    roomId: roomId,
                    override: override,
                    room: {
                        id: roomId,
                        title: result.Attributes.title,
                        status: result.Attributes.status,
                        openAt: result.Attributes.openAt,
                        manualOverride: result.Attributes.manualOverride
                    }
                })
            };
            return addCorsHeaders(response, event);
        }

        if (httpMethod === 'PUT' && path === '/admin/rooms/{roomId}/schedule') {
            // Update room schedule (openAt time)
            const body = JSON.parse(event.body || '{}');
            const { openAt } = body;

            // Validate openAt format (ISO string)
            if (openAt && isNaN(new Date(openAt).getTime())) {
                const response = {
                    statusCode: 400,
                    body: JSON.stringify({
                        error: 'invalid_date',
                        message: 'openAt must be a valid ISO date string'
                    })
                };
                return addCorsHeaders(response, event);
            }

            // Update room in database
            const updateParams = {
                TableName: process.env.MAIN_TABLE_NAME,
                Key: {
                    PK: 'ROOM#STATUS',
                    SK: `ROOM#${roomId}`
                },
                UpdateExpression: 'SET openAt = :openAt, updatedAt = :updatedAt',
                ExpressionAttributeValues: {
                    ':openAt': openAt,
                    ':updatedAt': new Date().toISOString()
                },
                ReturnValues: 'ALL_NEW'
            };

            const result = await dynamodb.send(new UpdateCommand(updateParams));

            if (!result.Attributes) {
                const response = {
                    statusCode: 404,
                    body: JSON.stringify({
                        error: 'room_not_found',
                        message: 'Room not found'
                    })
                };
                return addCorsHeaders(response, event);
            }

            const response = {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'Room schedule updated successfully',
                    roomId: roomId,
                    openAt: openAt,
                    room: {
                        id: roomId,
                        title: result.Attributes.title,
                        status: result.Attributes.status,
                        openAt: result.Attributes.openAt,
                        manualOverride: result.Attributes.manualOverride
                    }
                })
            };
            return addCorsHeaders(response, event);
        }

        // Method not allowed
        const response = {
            statusCode: 405,
            body: JSON.stringify({
                error: 'method_not_allowed',
                message: 'Method not allowed'
            })
        };
        return addCorsHeaders(response, event);

    } catch (error) {
        console.error('Error in admin-rooms function:', error);
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