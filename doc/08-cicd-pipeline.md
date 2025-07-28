# 08. CI/CD Pipeline - GitHub Actions

## 🎯 Overview

Este documento describe el pipeline CI/CD completamente funcional implementado con GitHub Actions para SURA Esencia Fest 2025.

## 🏗️ Architecture

### Hybrid Strategy
- **Frontend**: Automatic GitHub Actions deployment para todos los environments
- **Backend**: Hybrid approach (manual dev + automated staging/prod)

### Branch Strategy
```
feature/branch → main → staging → production
     ↓            ↓        ↓          ↓
  development   dev     staging    production
```

## 🌐 Frontend Pipeline

### Triggers
- **main branch** → dev environment (automatic)
- **staging branch** → staging environment (automatic)  
- **production branch** → production environment (automatic)

### Path Monitoring
Solo se ejecuta si hay cambios en:
```yaml
paths:
  - 'apps/client/**'
  - 'apps/admin/**' 
  - 'apps/shared/**'
  - 'iac/frontend/**'
  - 'package.json'
  - 'turbo.json'
```

### Workflow Steps
1. **Build Stage**
   - Turborepo build + export
   - Lint + TypeScript checking
   - Static site generation
   - Upload artifacts

2. **Deploy Stage**
   - Download build artifacts
   - S3 sync with cache headers
   - CloudFront invalidation
   - Environment URL output

### Environment Mapping
- `main` → `dev` environment
- `staging` → `staging` environment  
- `production` → `prod` environment

## 🔧 Backend Pipeline

### Triggers
- **staging branch** → staging environment
- **production branch** → production environment
- **main branch** → manual deployment (dev)

### Path Monitoring
```yaml
paths:
  - 'iac/backend/**'
  - '.github/workflows/backend-deploy.yml'
```

### Workflow Steps
1. **Validate & Build**
   - SAM template validation
   - Container build (`--use-container`)
   - Change detection
   - Upload SAM artifacts

2. **Deploy Stage**
   - Download SAM artifacts
   - Deploy using .toml configuration
   - Health check validation
   - API URL output

### Configuration Files
- `dev.toml` - Development environment
- `staging.toml` - Staging environment  
- `prod.toml` - Production environment

## 🚀 Promotion Flow

### Complete Validated Flow
```bash
# 1. Development (main branch)
git merge feature/branch main
git push origin main
# → Triggers: 🌐 Frontend Deploy to dev

# 2. Staging Promotion  
gh pr create --base staging --head main
gh pr merge
# → Triggers: 🌐 Frontend Deploy to staging + 🔧 Backend Deploy to staging

# 3. Production Promotion
gh pr create --base production --head staging  
gh pr merge
# → Triggers: 🌐 Frontend Deploy to prod + 🔧 Backend Deploy to prod
```

## 🛡️ Security & Permissions

### OIDC Authentication
- **No static credentials** stored in GitHub
- **Temporary tokens** generated per execution
- **IAM Role**: `GitHubActions-SuraEsenciaFest2025`
- **Granular permissions** per environment

### Environment Protection
- **production environments**: Branch restriction (only from `production` branch)
- **staging environments**: Branch restriction (only from `staging` branch)
- **dev environment**: No restrictions (automatic from `main`)

## 📊 Workflow Naming

### Dynamic Run Names
- **Frontend**: `🌐 Frontend Deploy to {environment}`
- **Backend**: `🔧 Backend Deploy to {environment}`

### Visual Distinction
- 🌐 = Frontend workflows
- 🔧 = Backend workflows
- Environment clearly displayed in run name

## 🔍 Monitoring & Debugging

### Workflow Status Check
```bash
# List recent runs
gh run list --limit 10

# Check specific workflow
gh run list --workflow=frontend-deploy.yml --limit 5
gh run list --workflow=backend-deploy.yml --limit 5

# View specific run details
gh run view <run-id>
```

### Environment URLs
- **Dev Frontend**: https://dx44kyf0i0jsk.cloudfront.net
- **Staging Frontend**: Available after staging deployment
- **Production Frontend**: Available after production deployment
- **Staging Backend API**: https://api.staging.esenciafest.com
- **Production Backend API**: https://api.esenciafest.com

## 🛠️ Development Workflow

### Local Development
```bash
# Frontend Development
npm run dev                    # All apps on localhost

# Backend Development (2 options)
npm run backend:local          # SAM Local APIs (localhost:3002)
npm run backend:deploy:dev     # Deploy to AWS dev environment
```

### Feature Development
```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Develop and test locally
npm run dev
npm run backend:local          # or backend:deploy:dev

# 3. Merge to main (triggers dev deployment)
git checkout main
git merge feature/my-feature
git push origin main

# 4. Promote to staging when ready
gh pr create --base staging --head main
gh pr merge

# 5. Promote to production when validated
gh pr create --base production --head staging
gh pr merge
```

## 🚨 Troubleshooting

### Common Issues

#### Frontend not triggering
- **Cause**: No changes in monitored paths
- **Solution**: Ensure changes in `apps/`, `iac/frontend/`, or root configs

#### Backend not triggering  
- **Cause**: Only triggers on `staging`/`production` branches
- **Solution**: Use `npm run backend:deploy:dev` for dev environment

#### OIDC Authentication Failure
- **Cause**: Missing permissions in workflow
- **Solution**: Ensure `id-token: write` and `contents: read` permissions

#### SAM Build Failures
- **Cause**: Container build issues
- **Solution**: Check Docker availability and SAM template syntax

### Environment Debugging
```bash
# Check API health
curl https://api.staging.esenciafest.com/health
curl https://api.esenciafest.com/health

# Check frontend deployment
curl -I https://dev.esenciafest.com
curl -I https://staging.esenciafest.com
curl -I https://esenciafest.com
```

## 📈 Performance Metrics

### Deployment Times (Observed)
- **Frontend Build**: ~2-3 minutes
- **Backend Build**: ~1-2 minutes  
- **Backend Deploy**: ~2-3 minutes
- **Total Pipeline**: ~4-6 minutes

### Resource Optimization
- **Container builds**: Only for staging/prod (better compatibility)
- **Artifact caching**: Build artifacts reused between jobs
- **Path filtering**: Prevents unnecessary builds
- **Change detection**: SAM skips deployment if no changes

## 🔄 Future Improvements

### Potential Enhancements
1. **Artifact reuse**: Share build artifacts between environments
2. **Parallel deployments**: Frontend + Backend simultaneous deployment
3. **Advanced approval gates**: Manual approval for production (requires GitHub Pro)
4. **Rollback automation**: Automatic rollback on health check failures
5. **Performance monitoring**: Deployment time tracking and alerting

### Branch Protection (Requires GitHub Pro)
```yaml
# Would enable:
- Required PR reviews for staging/production
- Status checks before merge
- Force push protection
- Admin bypass restrictions
```

## ✅ Validation Status

**Pipeline Status**: ✅ FULLY OPERATIONAL

**Validated Flows**:
- ✅ main → dev (frontend only, as expected)
- ✅ main → staging (frontend + backend)
- ✅ staging → production (frontend + backend)

**Security**: ✅ OIDC authentication working
**Monitoring**: ✅ Dynamic naming and clear distinction
**Performance**: ✅ Efficient builds with change detection

---

**Last Updated**: 2025-07-13  
**Status**: Production Ready  
**Issue**: #3 - Configurar CI/CD Pipeline (COMPLETED)