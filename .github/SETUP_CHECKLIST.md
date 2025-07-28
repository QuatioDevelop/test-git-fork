# GitHub Actions Setup Checklist

## ✅ Phase 1: Basic Workflow Creation (COMPLETED)
- [x] Created `.github/workflows/frontend-deploy.yml`
- [x] Created `.github/workflows/backend-deploy.yml`
- [x] Added backend development scripts to `package.json`
- [x] Created comprehensive setup documentation

## 🔧 Phase 2: AWS & GitHub Configuration (REQUIRED)

### 1. AWS OIDC Setup
- [ ] Create OIDC identity provider in AWS IAM
- [ ] Create IAM role `GitHubActions-SURA-EsenciaFest`
- [ ] Attach PowerUserAccess policy to the role
- [ ] Configure trust relationship for the repository

### 2. GitHub Repository Settings

#### A. Environment Variables (Repository Variables)
Go to: Settings → Secrets and variables → Actions → Variables tab

**Add these Repository Variables:**
```
AWS_ROLE_ARN = arn:aws:iam::YOUR-ACCOUNT-ID:role/GitHubActions-SURA-EsenciaFest
```

#### B. Environment Setup
Go to: Settings → Environments

**Create these environments:**
1. **dev** (no protection rules)
2. **staging** (add required reviewers)
3. **prod** (add required reviewers + admin approval)
4. **backend-staging** (add required reviewers)
5. **backend-prod** (add admin approval)

**For each environment, add the same variable:**
```
AWS_ROLE_ARN = arn:aws:iam::YOUR-ACCOUNT-ID:role/GitHubActions-SURA-EsenciaFest
```

### 3. Certificate ARN Updates
- [ ] Update certificate ARNs in workflow files:
  - Production: Update `API_CERT_ARN` in `backend-deploy.yml` line 61
  - Dev/Staging: Update `API_CERT_ARN` in `backend-deploy.yml` line 63

## 🧪 Phase 3: Testing & Validation

### 1. Frontend Workflow Testing
- [ ] Test manual dispatch to dev environment
- [ ] Test automatic trigger from main branch
- [ ] Verify artifacts are created and used correctly
- [ ] Check deployment outputs and URLs

### 2. Backend Workflow Testing
- [ ] Test SAM template validation
- [ ] Test build process with containers
- [ ] Test manual dispatch to staging
- [ ] Verify health check endpoint works

### 3. Integration Testing
- [ ] Test full frontend + backend deployment to staging
- [ ] Verify API endpoints are accessible from frontend
- [ ] Test approval flows for production deployments
- [ ] Validate environment-specific configurations

## 🚀 Phase 4: Branch Strategy Implementation

### 1. Branch Setup
- [ ] Create `staging` branch from `main`
- [ ] Create `production` branch from `staging`
- [ ] Set up branch protection rules
- [ ] Configure auto-merge policies if needed

### 2. Workflow Triggers
- [ ] Test `main` → dev deployment
- [ ] Test `staging` → staging deployment (with approval)
- [ ] Test `production` → prod deployment (with approval)

## 📋 Phase 5: Documentation & Training

### 1. Developer Documentation
- [ ] Create team guidelines for branch workflow
- [ ] Document emergency rollback procedures
- [ ] Create troubleshooting guide for common issues
- [ ] Set up monitoring and alerting

### 2. Team Training
- [ ] Train developers on hybrid workflow
- [ ] Explain when to use manual scripts vs GitHub Actions
- [ ] Document approval processes for staging/prod

## 🔍 Quick Validation Commands

After setup completion, test with these commands:

```bash
# Test manual backend development
npm run backend:validate
npm run backend:build
npm run backend:local

# Test manual backend deployment to dev
npm run backend:deploy:dev

# Test manual frontend deployment
npm run frontend:deploy:dev

# Test GitHub Actions (via workflow dispatch)
# Go to Actions tab → Select workflow → Run workflow
```

## 🚨 Required Before Production Use

1. **Security Review**: Ensure IAM roles have minimal required permissions
2. **Certificate Validation**: Verify all SSL certificates are valid and properly configured
3. **Environment Isolation**: Confirm dev/staging/prod environments are properly isolated
4. **Backup Strategy**: Implement backup procedures for critical resources
5. **Monitoring Setup**: Configure CloudWatch alarms and notifications
6. **Access Control**: Set up proper team access to GitHub environments and AWS resources

## 📞 Support Resources

- **AWS OIDC Documentation**: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html
- **GitHub Actions Documentation**: https://docs.github.com/en/actions
- **SAM CLI Documentation**: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference.html
- **Project CI/CD Setup Guide**: `.github/CICD_SETUP.md`