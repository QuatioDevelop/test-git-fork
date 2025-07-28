# Infrastructure Architecture Documentation

## Overview
This project provides a reusable Infrastructure as Code (IaC) boilerplate for deploying static websites on AWS, focusing on performance, security, and cost optimization. The infrastructure is designed to support various static site frameworks including vanilla JavaScript, React, and Vue.js applications.

## Current Architecture

### Core Components

#### Storage Layer
- **Amazon S3**
  - Primary storage for static website content
  - Configured with website hosting enabled
  - Bucket policy allows CloudFront access
  - Structured logging enabled
  - Standardized naming convention based on project

#### Content Delivery
- **Amazon CloudFront**
  - Primary CDN distribution
  - Edge locations optimized for Colombia (Bogotá and São Paulo)
  - Price Class 200 configuration
  - Custom error page handling
  - Brotli and GZIP compression enabled
  - HTTPS enforcement with redirect-to-https policy

#### Security
- **AWS Certificate Manager**
  - SSL/TLS certificate management
  - Automatic certificate renewal
  - HTTPS enforcement

### Technical Specifications

#### CloudFront Configuration
```yaml
Default Cache Behavior:
  - DefaultTTL: 3600 (1 hour)
  - MaxTTL: 86400 (1 day)
  - Compression: Enabled (Brotli + GZIP)
  - ViewerProtocolPolicy: redirect-to-https
  - Origin Protocol Policy: http-only (for S3 website endpoints)
```

#### Security Headers
```yaml
Default Security Headers:
  - Strict-Transport-Security: max-age=31536000; includeSubdomains
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - Content-Security-Policy: default-src 'self'
  - Referrer-Policy: strict-origin-when-cross-origin
```

### Infrastructure Organization

#### Template Structure
```
templates/
├── main.yaml           # Main stack template
└── nested/
    ├── s3.yaml        # S3 bucket configuration
    └── cloudfront.yaml # CloudFront distribution
```

#### Environment Management
```
environments/
├── staging.json       # Staging environment parameters
└── prod.json         # Production environment parameters
```

## Monitoring and Observability

### Current Metrics (Planned)
- Error rates
- Cache hit/miss ratios
- CloudFront performance metrics
- Cost tracking

### Future Monitoring Enhancements
- CloudWatch dashboards
- Custom metric aggregation
- Budget alerts
- Performance thresholds

## Deployment Pipeline

### Current Implementation
1. Environment configuration via JSON files
2. CloudFormation stack deployment
3. Nested stack management
4. Resource cleanup scripts

### Infrastructure Validation
- S3 bucket deployment ✅
- CloudFront distribution deployment ✅
- HTTPS configuration (pending validation)
- Cache behavior testing (in progress)
- Error page validation (pending)

## Security Architecture

### Current Security Features
1. HTTPS enforcement
2. Basic security headers
3. S3 bucket policy restrictions
4. CloudFront origin access restrictions

### Planned Security Enhancements
1. AWS WAF integration
2. Enhanced security rules
3. Rate limiting
4. IP-based restrictions (optional)

## Cost Optimization

### Current Strategies
- Price Class 200 selection for LATAM coverage
- Efficient cache TTL configuration
- Compression enabled for bandwidth reduction

### Future Optimizations
- Environment-specific price classes
- S3 lifecycle rules for logs
- Advanced budget alerts
- Cache optimization based on content type

## Future Architecture Components

### Phase-wise Implementation
1. **Enhanced Features** (Next Phase)
   - Custom cache behaviors
   - Advanced security headers
   - Detailed logging
   - Performance optimizations

2. **Multi-Environment Support**
   - Staging/Production environments
   - Environment-specific configurations
   - Advanced budget controls

3. **Security Hardening**
   - WAF implementation
   - Advanced security rules
   - Custom protection rules

## Best Practices Implementation

### Resource Management
- Project-based naming conventions
- Consistent tagging strategy
- Modular template design
- Environment segregation

### Performance Optimization
- Edge location selection for LATAM
- Optimized cache behaviors
- Compression enablement
- Error page caching

### Security Standards
- HTTPS enforcement
- Security header implementation
- Access restrictions
- SSL/TLS management

## Notes and Considerations

### Current Limitations
- Single environment configuration
- Basic monitoring setup
- Manual certificate management
- Limited security features

### Technical Decisions
1. Using S3 website endpoints with CustomOrigin
2. Price Class 200 for LATAM coverage
3. Default TTL settings for general use cases
4. Modular template structure for maintenance

### Implementation Guidelines
1. Environment-specific parameters in JSON
2. Clear documentation requirements
3. Script-based deployment process
4. Standardized testing procedures