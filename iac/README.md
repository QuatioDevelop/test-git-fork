# Infrastructure as Code

AWS infrastructure para Esencia Fest 2025

## Estructura

- `frontend/` - S3 + CloudFront estático
- `backend/` - SAM serverless (Lambda + API + DynamoDB)
- `shared/` - DNS + certificados

## Deploy

```bash
# Frontend
cd frontend && ./deploy.sh

# Backend  
cd backend && sam deploy

# Shared resources
cd shared && aws cloudformation deploy
```