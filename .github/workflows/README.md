# GitHub Actions CI/CD Workflows

This directory contains GitHub Actions workflows for automated testing and reporting.

## 📋 Available Workflows

### 1. **Playwright Tests CI** (`playwright-tests.yml`)

Main workflow that runs on every push and pull request.

#### Features:
- ✅ Node.js 24.x setup
- ✅ Dependency installation with caching
- ✅ Playwright browser installation (Chromium)
- ✅ ESLint linting
- ✅ Parallel test execution with sharding (2 shards)
- ✅ Allure report generation (regular and single-file)
- ✅ Playwright HTML report
- ✅ Test results publishing
- ✅ GitHub Pages deployment for Allure reports
- ✅ PR comments with report links
- ✅ Artifacts upload (30-day retention)

#### Triggers:
- Push to `main`, `master`, or `develop` branches
- Pull requests to `main`, `master`, or `develop` branches
- Manual dispatch with optional test filter

#### Jobs:
1. **lint** - Runs ESLint with zero warnings tolerance
2. **test** - Executes Playwright tests in parallel shards
3. **report** - Merges results and generates reports
4. **notify** - Sends notifications and updates summaries

---

### 2. **Scheduled Tests** (`scheduled-tests.yml`)

Automated test runs on a schedule.

#### Features:
- 🕐 Daily smoke tests at 2 AM UTC
- 📅 Weekly regression tests on Mondays at 9 AM UTC
- ✅ Smoke tests run before regression tests
- ✅ Artifacts upload for both test types

#### Triggers:
- Scheduled cron jobs
- Manual dispatch

#### Jobs:
1. **smoke-tests** - Runs tests tagged with `@smoke`
2. **regression-tests** - Runs tests tagged with `@regression` (after smoke tests)

---

### 3. **Multi-Browser Tests** (`multi-browser-tests.yml`)

Cross-browser and cross-platform testing.

#### Features:
- 🌐 Tests on Chromium, Firefox, and WebKit
- 💻 Tests on Ubuntu, Windows, and macOS
- ✅ Matrix strategy for parallel execution
- ✅ Separate reports for each browser/OS combination

#### Triggers:
- Manual dispatch
- Push to `main` or `master` when test files change

#### Jobs:
1. **test** - Runs tests on all browser/OS combinations

---

## 🔐 Required Secrets

Configure these secrets in your GitHub repository settings:

| Secret Name | Description | Example |
|------------|-------------|---------|
| `AUTOMATION_EXERCISE_EMAIL` | Login email for automationexercise.com | `user@example.com` |
| `AUTOMATION_EXERCISE_PASSWORD` | Password for automationexercise.com | `your-password` |
| `JIRA_LOGIN` | Jira login email | `user@example.com` |
| `JIRA_PASSWORD` | Jira password or API token | `your-token` |

### Setting up secrets:
1. Go to your repository on GitHub
2. Navigate to `Settings` → `Secrets and variables` → `Actions`
3. Click `New repository secret`
4. Add each secret with the corresponding value

---

## 📊 Reports and Artifacts

### Allure Reports
- **Location**: Published to GitHub Pages at `https://<username>.github.io/<repo>/allure-report/<run-number>/`
- **Retention**: 30 days
- **Formats**:
  - Full Allure report
  - Single-file Allure report

### Playwright Reports
- **Download**: Available as artifact `playwright-report-merged`
- **Retention**: 30 days
- **View locally**:
  ```bash
  npx playwright show-report <downloaded-artifact-path>
  ```

### Test Results
- **Format**: JUnit XML
- **Display**: Inline in GitHub Actions UI via `publish-unit-test-result-action`
- **PR Comments**: Automatic comments on pull requests with report links

---

## 🚀 Manual Workflow Dispatch

### Running Tests Manually

You can manually trigger workflows with custom parameters:

1. Go to `Actions` tab in your repository
2. Select the workflow (e.g., "Playwright Tests CI")
3. Click `Run workflow`
4. Optional: Enter a test filter (e.g., `@automation-exercise` or `@category`)
5. Click `Run workflow`

---

## 📈 Test Sharding

The main workflow uses sharding to parallelize test execution:

- **Current setup**: 2 shards (`1/2` and `2/2`)
- **Benefits**: Faster test execution
- **Customization**: Modify the matrix in `playwright-tests.yml`:
  ```yaml
  matrix:
    shard: [1/3, 2/3, 3/3]  # 3 shards
  ```

---

## 🔧 Customization

### Changing Node Version
Update the `NODE_VERSION` environment variable in workflow files:
```yaml
env:
  NODE_VERSION: '24.x'  # Change to desired version
```

### Adding More Browsers
Update the `playwright.config.ts` and modify workflows:
```yaml
- name: Install Playwright browsers
  run: npx playwright install --with-deps chromium firefox webkit
```

### Modifying Test Tags
Use grep patterns to filter tests:
```yaml
- name: Run smoke tests
  run: npx playwright test --grep "@smoke"
```

### Adjusting Cron Schedule
Modify the schedule in `scheduled-tests.yml`:
```yaml
schedule:
  - cron: '0 2 * * *'  # Daily at 2 AM UTC
```

---

## 🐛 Debugging Failed Workflows

### View Logs
1. Go to `Actions` tab
2. Click on the failed workflow run
3. Click on the failed job
4. Expand the failed step to view logs

### Download Artifacts
1. Scroll to the bottom of the workflow run page
2. Download relevant artifacts:
   - `test-results-*` - Test execution results
   - `playwright-report-*` - HTML report
   - `allure-report-*` - Allure report

### Re-run Failed Jobs
1. Click `Re-run jobs` → `Re-run failed jobs`
2. Or re-run all jobs to test consistency

---

## 📝 Best Practices

1. **Tag Your Tests**: Use tags like `@smoke`, `@regression`, `@critical` for better filtering
2. **Keep Secrets Secure**: Never commit secrets to the repository
3. **Monitor Flaky Tests**: Use Allure history to track test stability
4. **Review Reports**: Check Allure reports for detailed test insights
5. **Update Dependencies**: Regularly update Playwright and other dependencies
6. **Optimize Sharding**: Adjust shard count based on test suite size

---

## 🆘 Troubleshooting

### Common Issues

#### Tests failing in CI but passing locally
- Check environment variables and secrets
- Verify browser versions match
- Review headless mode differences

#### Allure report not generating
- Ensure `allure-results` directory exists
- Check Allure Playwright reporter is configured
- Verify npm dependencies are installed

#### GitHub Pages not updating
- Check repository settings for GitHub Pages
- Ensure `gh-pages` branch permissions
- Verify workflow has write permissions

#### Artifacts not uploading
- Check artifact size limits (500MB max)
- Verify upload paths are correct
- Review workflow permissions

---

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Allure Report Documentation](https://docs.qameta.io/allure/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [publish-unit-test-result-action](https://github.com/EnricoMi/publish-unit-test-result-action)

---

## 🤝 Contributing

When adding new workflows:
1. Document the workflow in this README
2. Add appropriate triggers and jobs
3. Include artifact uploads for debugging
4. Test the workflow before merging
5. Update secrets documentation if needed
