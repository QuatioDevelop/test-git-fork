# E2E Testing Guide

## 🎯 Testing Strategy

E2E tests are **only executed automatically** on:
- **Staging deployments** (`staging` branch)
- **Production deployments** (`production` branch)
- **Manual workflow triggers**

## 🧪 Running E2E Tests Locally

**Before pushing to any branch**, developers should run E2E tests locally to ensure functionality:

### Quick Start
```bash
# Start both applications
npm run dev  # Client (port 3000) + Admin (port 3001)

# In another terminal, run E2E tests
npm run test:e2e
```

### Detailed Steps

1. **Install Playwright browsers** (first time only):
   ```bash
   npx playwright install --with-deps chromium firefox
   ```

2. **Start development servers**:
   ```bash
   npm run dev
   # This starts:
   # - Client app on http://localhost:3000
   # - Admin app on http://localhost:3001
   ```

3. **Run E2E tests**:
   ```bash
   # Run all E2E tests
   npm run test:e2e

   # Run specific test file
   npx playwright test tests/e2e/user-flows.spec.ts

   # Run with UI (debugging)
   npx playwright test --headed --debug
   ```

### Test Coverage

Current E2E tests cover:
- **User authentication flows**: Login, registration, auto-redirect
- **Form validation**: Required fields, error messages
- **User lifecycle**: Complete journey from registration to cleanup

## 🚀 CI/CD Integration

### Development Flow
1. **Feature Development**: Unit + smoke tests only (fast feedback ~2-3 min)
2. **Local E2E**: Developer responsibility before pushing
3. **Staging Deployment**: Full E2E validation
4. **Production Deployment**: Full E2E validation

### Manual E2E Trigger
You can manually trigger E2E tests on any branch:
```bash
gh workflow run testing.yml --ref your-branch-name -f test_type=e2e
```

## 🔧 Debugging E2E Tests

### Common Issues
- **Port conflicts**: Ensure ports 3000 and 3001 are available
- **Build errors**: Run `npm run build` first to catch build issues
- **Race conditions**: Tests include proper waits and timeouts

### Debug Tools
```bash
# Run with trace collection
npx playwright test --trace on

# Open Playwright inspector
npx playwright test --debug

# View test report
npx playwright show-report
```

## 📊 Performance Expectations

- **Local E2E run**: ~3-5 minutes for full suite
- **CI E2E run**: ~5-7 minutes (includes setup + cleanup)
- **Development feedback**: ~2-3 minutes (unit + smoke only)

## 🎭 Best Practices

1. **Run E2E before important commits**
2. **Test in both Chromium and Firefox locally**
3. **Keep tests focused and deterministic**
4. **Use proper cleanup (deleteUser) to avoid test pollution**
5. **Report E2E failures immediately** - don't merge broken flows to staging