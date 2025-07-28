# Static Site Infrastructure Boilerplate

A reusable Infrastructure as Code (IaC) boilerplate for deploying static websites using AWS services. This project provides a complete infrastructure setup using AWS CloudFormation for hosting static websites with focus on performance, security, and cost optimization.

## Features

- S3-based static website hosting
- CloudFront distribution for content delivery
- SSL/TLS support via ACM
- Security headers and best practices
- Built-in monitoring and alerting
- Multi-environment support

## Prerequisites

- AWS CLI installed and configured
- AWS account with appropriate permissions
- Existing ACM certificate for your domain
- Bash shell (for deployment scripts)

## Quick Start

For detailed deployment instructions, please refer to the [Deployment Guide](docs/deployment.md).

## Project Structure

```
.
├── templates/           # CloudFormation templates
│   ├── main.yaml       # Main template
│   └── nested/         # Nested stack templates
├── scripts/            # Utility scripts
│   └── deploy/         # Deployment scripts
├── docs/              # Documentation
├── examples/          # Example configurations
└── test/             # Test files
```

## Configuration

1. Create `config.env` with project settings:
```properties
PROJECT_NAME=chat-admin
AWS_REGION=us-east-1
TEMPLATE_BUCKET_NAME=quatio-cf-templates-us-east-1
```

2. Create environment-specific files in `environments/`:
```json
{
    "Parameters": {
        "DomainName": "example.com",
        "PriceClass": "PriceClass_200",
        "CertificateArn": "arn:aws:acm:us-east-1:ACCOUNT:certificate/ID"
    }
}
```

## Documentation

Detailed documentation can be found in the `docs/` directory:
- [Architecture Overview](docs/architecture.md)
- [Deployment Guide](docs/deployment.md)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.