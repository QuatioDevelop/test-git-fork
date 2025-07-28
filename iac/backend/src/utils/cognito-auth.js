const jwt = require('jsonwebtoken');
const { CognitoIdentityProviderClient, GetUserCommand } = require('@aws-sdk/client-cognito-identity-provider');

const cognitoClient = new CognitoIdentityProviderClient({});

/**
 * Middleware to validate Cognito JWT tokens for admin endpoints
 * @param {Object} event - API Gateway event
 * @returns {Object} - Validation result with user info or error
 */
async function validateCognitoToken(event) {
    try {
        // Extract token from Authorization header
        const authHeader = event.headers?.Authorization || event.headers?.authorization;
        if (!authHeader) {
            return {
                isValid: false,
                statusCode: 401,
                error: 'authorization_required',
                message: 'Authorization header is required'
            };
        }

        const token = authHeader.replace(/^Bearer\s+/i, '');
        if (!token) {
            return {
                isValid: false,
                statusCode: 401,
                error: 'invalid_token_format',
                message: 'Bearer token is required'
            };
        }

        // Decode JWT token without verification (we'll verify with Cognito)
        let decodedToken;
        try {
            decodedToken = jwt.decode(token, { complete: true });
        } catch (error) {
            return {
                isValid: false,
                statusCode: 401,
                error: 'invalid_token',
                message: 'Token is malformed'
            };
        }

        if (!decodedToken) {
            return {
                isValid: false,
                statusCode: 401,
                error: 'invalid_token',
                message: 'Token could not be decoded'
            };
        }

        // Check if token is expired
        const currentTime = Math.floor(Date.now() / 1000);
        if (decodedToken.payload.exp < currentTime) {
            return {
                isValid: false,
                statusCode: 401,
                error: 'token_expired',
                message: 'Token has expired'
            };
        }

        // Verify token with Cognito by getting user info
        try {
            const getUserCommand = new GetUserCommand({
                AccessToken: token
            });

            const userResponse = await cognitoClient.send(getUserCommand);
            
            // Extract user information
            const userInfo = {
                username: userResponse.Username,
                email: userResponse.UserAttributes.find(attr => attr.Name === 'email')?.Value,
                emailVerified: userResponse.UserAttributes.find(attr => attr.Name === 'email_verified')?.Value === 'true'
            };

            // Note: GetUser API doesn't return UserStatus or Enabled fields
            // If the token is valid and GetUser succeeds, the user is implicitly confirmed and enabled

            // Log successful authentication for audit
            console.log('Admin authentication successful', {
                username: userInfo.username,
                email: userInfo.email,
                timestamp: new Date().toISOString(),
                endpoint: event.resource,
                method: event.httpMethod,
                sourceIp: event.requestContext?.identity?.sourceIp
            });

            return {
                isValid: true,
                user: userInfo,
                tokenPayload: decodedToken.payload
            };

        } catch (cognitoError) {
            console.error('Cognito token validation failed:', cognitoError);
            
            // Map Cognito errors to appropriate HTTP status codes
            if (cognitoError.name === 'NotAuthorizedException') {
                return {
                    isValid: false,
                    statusCode: 401,
                    error: 'invalid_token',
                    message: 'Token is invalid or expired'
                };
            }

            if (cognitoError.name === 'UserNotFoundException') {
                return {
                    isValid: false,
                    statusCode: 403,
                    error: 'user_not_found',
                    message: 'User not found'
                };
            }

            return {
                isValid: false,
                statusCode: 500,
                error: 'authentication_error',
                message: 'Internal authentication error'
            };
        }

    } catch (error) {
        console.error('Token validation error:', error);
        return {
            isValid: false,
            statusCode: 500,
            error: 'internal_error',
            message: 'Internal server error during authentication'
        };
    }
}

/**
 * Helper function to create error response for authentication failures
 * @param {Object} authResult - Result from validateCognitoToken
 * @param {Object} event - API Gateway event for CORS
 * @returns {Object} - Formatted error response
 */
function createAuthErrorResponse(authResult, event) {
    const { addCorsHeaders } = require('./cors');
    
    const response = {
        statusCode: authResult.statusCode,
        body: JSON.stringify({
            error: authResult.error,
            message: authResult.message
        })
    };

    return addCorsHeaders(response, event);
}

module.exports = {
    validateCognitoToken,
    createAuthErrorResponse
};