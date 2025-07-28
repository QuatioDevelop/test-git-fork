const { addCorsHeaders, handleOptionsRequest } = require('./utils/cors');

exports.handler = async (event) => {
    // Handle CORS preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return handleOptionsRequest(event);
    }

    const response = {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Backend is healthy',
            environment: process.env.ENVIRONMENT,
            timestamp: new Date().toISOString(),
            version: '1.0.2', // Testing promotion flow
            tables: {
                main: process.env.MAIN_TABLE_NAME,
                logs: process.env.LOGS_TABLE_NAME
            }
        })
    };
    
    return addCorsHeaders(response, event);
};