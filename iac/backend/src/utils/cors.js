/**
 * Environment-based CORS handler for AWS Lambda functions
 * Uses CORS_ORIGINS environment variable for allowed origins
 */

const getAllowedOrigins = () => {
  const environment = process.env.ENVIRONMENT || 'dev';
  const corsOrigins = process.env.CORS_ORIGINS || 'https://esenciafest.com,https://admin.esenciafest.com';
  
  console.log(`[CORS] Environment: ${environment}`);
  console.log(`[CORS] CORS_ORIGINS env var: ${corsOrigins}`);
  
  // Parse comma-separated origins from environment variable
  const configuredOrigins = corsOrigins.split(',').map(origin => origin.trim());
  
  // Add localhost patterns for dev environment only
  const localhostPatterns = environment === 'dev' ? [
    /^http:\/\/localhost:\d+$/,
    /^http:\/\/127\.0\.0\.1:\d+$/
  ] : [];

  console.log(`[CORS] Configured origins: ${JSON.stringify(configuredOrigins)}`);
  console.log(`[CORS] Localhost patterns enabled: ${localhostPatterns.length > 0}`);

  return {
    origins: configuredOrigins,
    patterns: localhostPatterns
  };
};

const isOriginAllowed = (origin, headers) => {
  if (!origin) return false;
  
  const { origins, patterns } = getAllowedOrigins();
  
  // Check exact matches
  if (origins.includes(origin)) {
    return true;
  }
  
  // Check pattern matches (for localhost in dev)
  if (patterns.some(pattern => pattern.test(origin))) {
    return true;
  }
  
  // Special handling for E2E tests
  // Allow localhost origins if they provide valid E2E test key
  const e2eTestKey = headers?.['x-e2e-test-key'] || headers?.['X-E2E-Test-Key'];
  const validE2eKey = process.env.E2E_TEST_SECRET || 'e2e-test-secret-2025';
  
  if (e2eTestKey === validE2eKey && /^http:\/\/localhost:\d+$/.test(origin)) {
    console.log(`[CORS] ✅ E2E test origin approved with valid key: ${origin}`);
    return true;
  }
  
  return false;
};

const getCorsHeaders = (event) => {
  const origin = event.headers?.origin || event.headers?.Origin;
  
  console.log(`[CORS] Request origin: ${origin}`);
  
  if (!isOriginAllowed(origin, event.headers)) {
    console.log(`[CORS] ❌ Origin rejected: ${origin}`);
    return null; // Indicate CORS rejection
  }
  
  console.log(`[CORS] ✅ Origin approved: ${origin}`);
  
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-e2e-test-key',
    'Access-Control-Allow-Credentials': 'false',
    'Access-Control-Max-Age': '86400' // 24 hours
  };
};

const handleOptionsRequest = (event) => {
  const corsHeaders = getCorsHeaders(event);
  
  if (!corsHeaders) {
    // CORS rejection for OPTIONS request
    return {
      statusCode: 403,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'cors_rejected',
        message: 'Origin not allowed by CORS policy' 
      })
    };
  }
  
  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({ message: 'CORS preflight response' })
  };
};

const addCorsHeaders = (response, event) => {
  const corsHeaders = getCorsHeaders(event);
  
  if (!corsHeaders) {
    // CORS rejection - return 403
    return {
      statusCode: 403,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'cors_rejected',
        message: 'Origin not allowed by CORS policy' 
      })
    };
  }
  
  return {
    ...response,
    headers: {
      'Content-Type': 'application/json',
      ...response.headers,
      ...corsHeaders
    }
  };
};

module.exports = {
  getCorsHeaders,
  handleOptionsRequest,
  addCorsHeaders,
  isOriginAllowed
};