# CI/CD Setup Guide

## 🚀 Quick Start

### Prerequisites
- GitHub repository with Actions enabled
- Secrets configured (see below)
- Node.js 24.x or higher

### Initial Setup

1. **Configure GitHub Secrets**
   ```
   Repository Settings → Secrets and variables → Actions → New repository secret
   ```

   Add the following secrets:
   - `AUTOMATION_EXERCISE_EMAIL`
   - `AUTOMATION_EXERCISE_PASSWORD`
   - `JIRA_LOGIN`
   - `JIRA_PASSWORD`

2. **Enable GitHub Pages** (for Allure reports)
   ```
   Repository Settings → Pages → Source: GitHub Actions
   ```

3. **Update Dependabot Configuration**

   Edit [.github/dependabot.yml](.github/dependabot.yml) and replace `your-github-username` with your actual GitHub username.

4. **Push to Repository**
   ```bash
   git add .
   git commit -m "chore: add CI/CD workflows"
   git push
   ```

---

## 📊 Workflow Status

[![Playwright Tests CI](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/playwright-tests.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/playwright-tests.yml)
[![Scheduled Tests](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/scheduled-tests.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/scheduled-tests.yml)

> **Note**: Replace `YOUR_USERNAME` and `YOUR_REPO` with your actual GitHub username and repository name.

---

## 🔄 Available Workflows

| Workflow | Trigger | Purpose | Duration |
|----------|---------|---------|----------|
| **Playwright Tests CI** | Push, PR, Manual | Main test suite with reports | ~10-15 min |
| **Scheduled Tests** | Cron, Manual | Daily smoke + weekly regression | ~15-20 min |
| **Multi-Browser Tests** | Manual, Push (main) | Cross-browser testing | ~20-30 min |

---

## 🎯 Workflow Features

### ✅ What's Included

- **Linting**: ESLint with zero-tolerance for warnings
- **Testing**: Parallel execution with sharding
- **Reporting**:
  - Allure reports (with GitHub Pages deployment)
  - Playwright HTML reports
  - JUnit XML results
  - Test result summaries in PR comments
- **Artifacts**: 30-day retention for all reports
- **Notifications**: PR comments and workflow summaries
- **Caching**: npm dependencies cached for faster runs
- **Matrix Testing**: Multiple browsers and OS combinations

---

## 📈 Test Execution Strategies

### Parallel Execution (Sharding)

Tests are split across multiple runners for faster execution:

```yaml
strategy:
  matrix:
    shard: [1/2, 2/2]  # 2 parallel runners
```

**Benefits**:
- ⚡ 50% faster execution
- 🔄 Better resource utilization
- 📊 Easier to scale

### Test Filtering

Run specific test subsets using tags:

```bash
# Via workflow dispatch
npm run test:category    # @category tests
npm run test:smoke      # @smoke tests
npm run test:regression # @regression tests
```

---

## 📊 Viewing Reports

### Allure Reports

**GitHub Pages** (Main branch only):
```
https://YOUR_USERNAME.github.io/YOUR_REPO/allure-report/RUN_NUMBER/
```

**Download Artifact**:
1. Go to workflow run
2. Scroll to "Artifacts"
3. Download `allure-report` or `allure-report-single-file`

### Playwright Reports

**Download and View**:
```bash
# Download 'playwright-report-merged' artifact
npx playwright show-report ./path-to-downloaded-artifact
```

### Test Results

**Inline in PR**:
- Automatic comment with links
- Test results table
- Pass/fail summary

**Workflow Summary**:
- Click on workflow run
- Check "Summary" section
- View test results inline

---

## 🔧 Customization Examples

### Add a New Browser

**Update `playwright.config.ts`**:
```typescript
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },
]
```

**Update workflow**:
```yaml
- name: Install Playwright browsers
  run: npx playwright install --with-deps chromium firefox webkit
```

### Adjust Test Sharding

For larger test suites, increase shards:

```yaml
strategy:
  matrix:
    shard: [1/4, 2/4, 3/4, 4/4]  # 4 shards
```

### Change Schedule

Edit `scheduled-tests.yml`:

```yaml
schedule:
  - cron: '0 2 * * *'      # Daily at 2 AM
  - cron: '0 14 * * 5'     # Friday at 2 PM
  - cron: '*/30 * * * *'   # Every 30 minutes
```

### Add Slack Notifications

Add to `notify` job:

```yaml
- name: Send Slack notification
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
    payload: |
      {
        "text": "Test Results: ${{ steps.test_status.outputs.status }}"
      }
```

---

## 🐛 Debugging Tips

### Test Failures in CI

1. **Download Artifacts**:
   - `test-results-*` - Screenshots, videos, traces
   - `playwright-report-*` - Full HTML report

2. **Check Environment**:
   ```yaml
   - name: Debug environment
     run: |
       echo "Node: $(node --version)"
       echo "NPM: $(npm --version)"
       echo "Playwright: $(npx playwright --version)"
   ```

3. **Enable Trace on Failure**:
   ```typescript
   // playwright.config.ts
   use: {
     trace: 'on-first-retry',
   }
   ```

### Workflow Not Triggering

- Check branch names in workflow triggers
- Verify paths in `on.push.paths`
- Check workflow file syntax (YAML validation)

### Secrets Not Working

- Verify secret names match exactly
- Check secret values don't have extra spaces
- Secrets are case-sensitive

---

## 📚 npm Scripts Reference

| Command | Description |
|---------|-------------|
| `npm test` | Run linter + all tests |
| `npm run test:headed` | Run tests in headed mode |
| `npm run test:ui` | Open Playwright UI mode |
| `npm run test:debug` | Debug tests |
| `npm run test:category` | Run category tests |
| `npm run test:smoke` | Run smoke tests |
| `npm run test:regression` | Run regression tests |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run allure:generate` | Generate Allure report |
| `npm run allure:open` | Open Allure report |
| `npm run allure:serve` | Serve Allure report |
| `npm run report:open` | Open Playwright report |

---

## 🔐 Security Best Practices

1. **Never commit secrets**:
   ```bash
   # Add to .gitignore
   .env
   .env.local
   *.key
   *.pem
   ```

2. **Use minimal permissions**:
   ```yaml
   permissions:
     contents: read
     pull-requests: write
   ```

3. **Rotate secrets regularly**:
   - Update in repository settings
   - Update in local `.env` files

4. **Use environment-specific secrets**:
   - Separate dev/staging/prod secrets
   - Use GitHub Environments for deployment

---

## 📈 Performance Optimization

### Reduce Workflow Time

1. **Cache dependencies**:
   ```yaml
   - uses: actions/setup-node@v4
     with:
       cache: 'npm'
   ```

2. **Install only needed browsers**:
   ```bash
   npx playwright install --with-deps chromium  # Instead of all browsers
   ```

3. **Use `--grep-invert` to skip tests**:
   ```bash
   npx playwright test --grep-invert @slow
   ```

4. **Optimize test parallelization**:
   ```typescript
   workers: process.env.CI ? 2 : 1
   ```

---

## 🎓 Learning Resources

- **Workflows**: [.github/workflows/README.md](.github/workflows/README.md)
- **Playwright**: https://playwright.dev/docs/ci
- **Allure**: https://docs.qameta.io/allure/
- **GitHub Actions**: https://docs.github.com/en/actions

---

## 🤝 Contributing

When adding new CI/CD features:

1. Test locally first
2. Use manual dispatch for testing
3. Document in this file
4. Update workflow README
5. Add appropriate badges

---

## 📞 Support

Issues with CI/CD? Check:
1. [Troubleshooting Guide](.github/workflows/README.md#-troubleshooting)
2. Workflow run logs
3. Recent commits for breaking changes
4. GitHub Actions status page

---

## 📝 Changelog

### Version 1.0.0
- ✅ Initial CI/CD setup
- ✅ Main test workflow with sharding
- ✅ Scheduled smoke and regression tests
- ✅ Multi-browser testing support
- ✅ Allure and Playwright reporting
- ✅ GitHub Pages deployment
- ✅ Dependabot integration
