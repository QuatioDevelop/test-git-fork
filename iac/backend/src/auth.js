const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
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
        const body = JSON.parse(event.body);
        const { email, name, lastname, country, negocio } = body;

        if (!email) {
            return addCorsHeaders({
                statusCode: 400,
                body: JSON.stringify({
                    error: 'email_required',
                    message: 'Email is required'
                })
            }, event);
        }

        // Check if user exists
        const userResult = await dynamodb.send(new GetCommand({
            TableName: process.env.MAIN_TABLE_NAME,
            Key: {
                PK: `USER#${email}`,
                SK: 'PROFILE'
            }
        }));

        let userData;

        if (userResult.Item) {
            // User exists - login
            userData = userResult.Item;
        } else {
            // User doesn't exist - check if registration data provided
            if (!name || !lastname || !country || !negocio) {
                return addCorsHeaders({
                    statusCode: 400,
                    body: JSON.stringify({
                        error: 'registration_required',
                        message: 'User not found, please provide name, lastname, country and negocio'
                    })
                }, event);
            }

            // Create new user
            userData = {
                PK: `USER#${email}`,
                SK: 'PROFILE',
                email,
                name,
                lastname,
                country,
                negocio,
                role: '', // Keep for compatibility
                position: '', // Keep for compatibility
                progress: [],
                createdAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString()
            };

            await dynamodb.send(new PutCommand({
                TableName: process.env.MAIN_TABLE_NAME,
                Item: userData
            }));
        }

        // Update last login
        await dynamodb.send(new UpdateCommand({
            TableName: process.env.MAIN_TABLE_NAME,
            Key: {
                PK: `USER#${email}`,
                SK: 'PROFILE'
            },
            UpdateExpression: 'SET lastLoginAt = :timestamp',
            ExpressionAttributeValues: {
                ':timestamp': new Date().toISOString()
            }
        }));

        // Generate JWT token
        const token = jwt.sign(
            { 
                email: userData.email,
                name: userData.name,
                lastname: userData.lastname,
                country: userData.country,
                negocio: userData.negocio
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return addCorsHeaders({
            statusCode: 200,
            body: JSON.stringify({
                token,
                user: {
                    email: userData.email,
                    name: userData.name,
                    lastname: userData.lastname,
                    country: userData.country,
                    negocio: userData.negocio,
                    role: userData.role || '',
                    position: userData.position || '',
                    progress: userData.progress
                }
            })
        }, event);

    } catch (error) {
        console.error('Error in auth function:', error);
        return addCorsHeaders({
            statusCode: 500,
            body: JSON.stringify({
                error: 'internal_error',
                message: 'Internal server error'
            })
        }, event);
    }
};

