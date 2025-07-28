const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { addCorsHeaders, handleOptionsRequest } = require('./utils/cors');

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

// Default room configuration
const DEFAULT_ROOMS = {
    sala1: { openAt: '2025-08-18T10:00:00Z', manualOverride: null },
    sala2: { openAt: '2025-08-18T11:00:00Z', manualOverride: null },
    sala3: { openAt: '2025-08-18T12:00:00Z', manualOverride: null },
    sala4: { openAt: '2025-08-18T13:00:00Z', manualOverride: null },
    sala5: { openAt: '2025-08-18T14:00:00Z', manualOverride: null }
};

exports.handler = async (event) => {
    // Handle CORS preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return handleOptionsRequest(event);
    }

    try {
        // Get all room statuses
        const result = await dynamodb.send(new QueryCommand({
            TableName: process.env.MAIN_TABLE_NAME,
            KeyConditionExpression: 'PK = :pk',
            ExpressionAttributeValues: {
                ':pk': 'ROOM#STATUS'
            }
        }));

        let roomStatuses = {};

        if (result.Items && result.Items.length > 0) {
            // Rooms exist in DB, return them
            result.Items.forEach(item => {
                const roomId = item.SK.replace('ROOM#', '');
                roomStatuses[roomId] = {
                    openAt: item.openAt,
                    manualOverride: item.manualOverride || null,
                    vimeoUrl: item.vimeoUrl || null,
                    content: item.content || null
                };
            });
        } else {
            // No rooms in DB, return defaults and optionally seed them
            roomStatuses = DEFAULT_ROOMS;
            
            // Optionally seed the database with default rooms
            if (event.queryStringParameters && event.queryStringParameters.seed === 'true') {
                const putPromises = Object.entries(DEFAULT_ROOMS).map(([roomId, roomData]) => {
                    return dynamodb.send(new PutCommand({
                        TableName: process.env.MAIN_TABLE_NAME,
                        Item: {
                            PK: 'ROOM#STATUS',
                            SK: `ROOM#${roomId}`,
                            ...roomData,
                            createdAt: new Date().toISOString()
                        }
                    }));
                });

                await Promise.all(putPromises);
            }
        }

        const response = {
            statusCode: 200,
            body: JSON.stringify(roomStatuses)
        };
        return addCorsHeaders(response, event);

    } catch (error) {
        console.error('Error in rooms function:', error);
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