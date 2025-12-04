# GitLab CI/CD Setup for Playwright Tests

## Overview

This repository includes a comprehensive GitLab CI/CD pipeline that automatically runs Playwright tests with parallel execution, generates multiple report formats, and deploys Allure reports to GitLab Pages with build history.

## Features

- ✅ **Parallel Test Execution** with sharding (2 shards by default)
- ✅ **Linting** with ESLint before tests
- ✅ **Multiple Report Formats**:
  - Allure Report (interactive HTML)
  - Allure Single File Report (portable)
  - Playwright HTML Report
  - JSON Report for test summary
- ✅ **GitLab Pages Deployment** with build-specific URLs
- ✅ **Build History** - all reports preserved and accessible
- ✅ **Test Artifacts**: Screenshots, videos, traces (on failure)
- ✅ **Merge Request Comments** with test results
- ✅ **Pipeline Summary** with test statistics

---

## Pipeline Structure

### Stages

1. **test**: Run Playwright tests in parallel shards
2. **report**: Merge results and generate reports
3. **deploy**: Deploy Allure report to GitLab Pages
4. **notify**: Add MR comments and summary

### Jobs

#### 1. `test` (Parallel)
- Runs on 2 parallel shards
- Installs dependencies and Playwright browsers
- Runs ESLint
- Executes Playwright tests with sharding
- Uploads artifacts: blob reports, allure results, test results (screenshots/videos/traces)
- Fails if any test fails

#### 2. `generate-reports`
- Merges all shard results
- Generates Allure report (HTML + single file)
- Generates Playwright HTML report
- Creates JSON report for test summary
- Parses test statistics

#### 3. `pages`
- Deploys to GitLab Pages with build history
- Creates build-specific directory (e.g., `/42/`)
- Updates index.html to redirect to latest build
- Creates builds.html for navigating all builds
- Only runs on `main`, `master`, or `develop` branches

#### 4. `comment-mr`
- Posts test results comment on Merge Requests
- Includes test summary and report links
- Requires `GITLAB_TOKEN` variable

#### 5. `notify-summary`
- Prints pipeline summary to console
- Shows test statistics and report URLs

---

## Prerequisites

### 1. GitLab Pages

GitLab Pages should be enabled for your project automatically. After the first successful pipeline run on `main`/`master`/`develop`, your reports will be available at:

```
https://<namespace>.gitlab.io/<project>/
```

### 2. CI/CD Variables

Add these variables in **Settings → CI/CD → Variables**:

#### Required Variables:
- `AUTOMATION_EXERCISE_EMAIL` - Email for automationexercise.com login
- `AUTOMATION_EXERCISE_PASSWORD` - Password for automationexercise.com
- `JIRA_LOGIN` - Jira username/email
- `JIRA_PASSWORD` - Jira password

#### Optional Variables (for MR comments):
- `GITLAB_TOKEN` - Personal Access Token with `api` scope
  - Go to **Settings → Access Tokens**
  - Create token with `api` scope
  - Add as CI/CD variable

**Important**: Mark all sensitive variables as **Protected** and **Masked**.

---

## Report URLs

### Latest Report (Auto-redirect)
```
https://<namespace>.gitlab.io/<project>/
```
Automatically redirects to the latest build report.

### Specific Build
```
https://<namespace>.gitlab.io/<project>/<pipeline-id>/
```
Example: `https://myusername.gitlab.io/my-project/42/`

### All Builds Index
```
https://<namespace>.gitlab.io/<project>/builds.html
```
Lists all available build reports with links.

---

## Customization

### Adjust Parallel Shards

To change the number of parallel shards, edit `.gitlab-ci.yml`:

```yaml
test:
  parallel:
    matrix:
      - SHARD_INDEX: [1, 2, 3, 4]  # 4 shards
        SHARD_TOTAL: [4]
```

### Change Node.js Version

Edit the `NODE_VERSION` variable:

```yaml
variables:
  NODE_VERSION: "24.x"  # Change to desired version
```

### Modify Playwright Image

Update the image version in all jobs:

```yaml
image: mcr.microsoft.com/playwright:v1.48.2-noble
```

Latest versions: https://mcr.microsoft.com/en-us/product/playwright/about

### Add More Branches for Pages Deployment

Edit the `pages` job rules:

```yaml
pages:
  rules:
    - if: '$CI_COMMIT_BRANCH == "main"'
    - if: '$CI_COMMIT_BRANCH == "master"'
    - if: '$CI_COMMIT_BRANCH == "develop"'
    - if: '$CI_COMMIT_BRANCH == "staging"'  # Add more branches
```

### Adjust Artifact Retention

Change `expire_in` values:

```yaml
artifacts:
  expire_in: 30 days  # Change to 7 days, 90 days, etc.
```

---

## Build History

### How It Works

Each pipeline run creates a unique directory named with the pipeline ID:

```
public/
├── index.html          # Redirects to latest build
├── builds.html         # Lists all builds
├── 42/                 # Pipeline #42
│   └── allure-report/
├── 43/                 # Pipeline #43
│   └── allure-report/
└── 44/                 # Pipeline #44 (latest)
    └── allure-report/
```

### Accessing Historical Reports

1. **Latest Report**: Visit the root URL (auto-redirects)
2. **Specific Build**: Add pipeline ID to URL: `/<pipeline-id>/`
3. **Browse All Builds**: Visit `/builds.html`

### Managing Old Reports

GitLab Pages has storage limits. To clean up old reports:

#### Manual Cleanup

1. Clone the repository with `gl-pages` branch:
   ```bash
   git clone --branch gl-pages https://gitlab.com/<namespace>/<project>.git pages
   cd pages
   ```

2. Remove old builds:
   ```bash
   # Remove specific build
   rm -rf 42/

   # Keep only last 20 builds
   ls -d [0-9]* | sort -n | head -n -20 | xargs rm -rf
   ```

3. Commit and push:
   ```bash
   git add .
   git commit -m "Clean up old build reports"
   git push
   ```

#### Automated Cleanup (Optional)

Add a cleanup job to `.gitlab-ci.yml`:

```yaml
cleanup-old-reports:
  stage: deploy
  image: alpine:latest
  needs: []
  before_script:
    - apk add --no-cache git
  script:
    - |
      # Clone gl-pages branch
      git clone --depth 1 --branch gl-pages https://gitlab-ci-token:${CI_JOB_TOKEN}@${CI_SERVER_HOST}/${CI_PROJECT_PATH}.git pages
      cd pages

      # Keep only last 30 builds
      MIN_BUILD=$((CI_PIPELINE_IID - 30))
      for dir in [0-9]*/; do
        build_num=$(basename "$dir" /)
        if [ "$build_num" -lt "$MIN_BUILD" ]; then
          echo "Removing old build: $build_num"
          rm -rf "$dir"
        fi
      done

      # Commit if changes
      git config user.name "GitLab CI"
      git config user.email "gitlab-ci@gitlab.com"
      git add .
      git commit -m "Cleanup old builds (keeping last 30)" || echo "No builds to clean"

      # Push back
      git push https://gitlab-ci-token:${CI_JOB_TOKEN}@${CI_SERVER_HOST}/${CI_PROJECT_PATH}.git gl-pages
  rules:
    - if: '$CI_COMMIT_BRANCH == "main" && $CI_PIPELINE_SOURCE == "schedule"'
```

Then create a scheduled pipeline to run weekly.

---

## Workflow Triggers

The pipeline runs automatically on:

- **Push** to any branch
- **Merge Request** creation/update
- **Manual trigger** via GitLab UI

### Manual Trigger

1. Go to **CI/CD → Pipelines**
2. Click **Run pipeline**
3. Select branch
4. Click **Run pipeline**

### Scheduled Pipelines

To run tests on a schedule:

1. Go to **CI/CD → Schedules**
2. Click **New schedule**
3. Set interval (e.g., "0 2 * * *" for daily at 2 AM)
4. Select target branch
5. Save

---

## Troubleshooting

### Pipeline Fails on Test Job

**Symptom**: Test job fails with errors

**Solutions**:
1. Check test logs in GitLab pipeline view
2. Verify CI/CD variables are set correctly
3. Check if tests pass locally
4. Review Playwright version compatibility

### GitLab Pages Not Updating

**Symptom**: Pages URL shows old report or 404

**Check 1**: Verify pipeline completed successfully
- Go to **CI/CD → Pipelines**
- Check `pages` job succeeded

**Check 2**: Verify GitLab Pages is enabled
- Go to **Settings → Pages**
- Should show "Your pages are served under: https://..."

**Check 3**: Wait for propagation
- GitLab Pages can take 1-2 minutes to update
- Try clearing browser cache

**Check 4**: Check branch
- Pages only deploy from `main`, `master`, or `develop` branches
- Verify you pushed to one of these branches

### MR Comments Not Appearing

**Symptom**: No comment added to Merge Request

**Check 1**: Verify `GITLAB_TOKEN` is set
- Go to **Settings → CI/CD → Variables**
- Ensure `GITLAB_TOKEN` exists with correct value

**Check 2**: Verify token permissions
- Token must have `api` scope
- Recreate token if needed

**Check 3**: Check job logs
- View `comment-mr` job logs for errors

### Artifacts Not Uploading

**Symptom**: Cannot download reports from pipeline

**Solutions**:
1. Check artifact paths in `.gitlab-ci.yml`
2. Verify files are generated (check job logs)
3. Check GitLab storage quota (Settings → Usage Quotas)

### Shards Not Running in Parallel

**Symptom**: Shards run sequentially instead of parallel

**Check 1**: Verify GitLab plan supports parallel jobs
- Free tier: 1 runner
- Paid tiers: Multiple runners

**Check 2**: Check runner availability
- Go to **Settings → CI/CD → Runners**
- Ensure runners are available

**Solution**: Reduce `parallel.matrix` or upgrade GitLab plan

### Out of Storage

**Symptom**: Pipeline fails with storage errors

**Solutions**:
1. Clean up old artifacts (Settings → CI/CD → Job artifacts)
2. Clean up old Pages builds (see "Managing Old Reports")
3. Reduce artifact retention time
4. Upgrade storage quota

---

## Comparison: GitHub Actions vs GitLab CI

| Feature | GitHub Actions | GitLab CI |
|---------|---------------|-----------|
| **Parallel Jobs** | Matrix strategy | Parallel matrix |
| **Artifacts** | upload-artifact action | artifacts: paths |
| **Pages** | peaceiris/actions-gh-pages | Built-in GitLab Pages |
| **Build Number** | `github.run_number` | `CI_PIPELINE_IID` |
| **Branch Check** | `github.ref` | `CI_COMMIT_BRANCH` |
| **Secrets** | GitHub Secrets | CI/CD Variables |
| **MR Comments** | actions/github-script | GitLab API with curl |
| **Caching** | actions/cache | cache: key/paths |

---

## Best Practices

1. **Protect Sensitive Variables**: Always mark credentials as **Protected** and **Masked**
2. **Use Specific Image Versions**: Pin Playwright image version for consistency
3. **Keep Artifacts Short-lived**: Use appropriate `expire_in` values (30 days default)
4. **Clean Up Old Reports**: Implement periodic cleanup of old Pages builds
5. **Monitor Storage Usage**: Check **Settings → Usage Quotas** regularly
6. **Use Protected Branches**: Enable branch protection for `main`/`master`
7. **Review Failed Jobs**: Always check logs when jobs fail
8. **Test Locally First**: Run `npm test` locally before pushing

---

## Additional Resources

- [GitLab CI/CD Documentation](https://docs.gitlab.com/ee/ci/)
- [GitLab Pages Documentation](https://docs.gitlab.com/ee/user/project/pages/)
- [Playwright Documentation](https://playwright.dev/)
- [Allure Documentation](https://docs.qameta.io/allure/)

---

## Summary

✅ **Comprehensive CI/CD**: Automated testing with parallel execution
✅ **Multiple Reports**: Allure, Playwright HTML, JSON summary
✅ **Build History**: Permanent URLs for all builds on GitLab Pages
✅ **Failure Artifacts**: Screenshots, videos, traces automatically captured
✅ **MR Integration**: Automatic comments with test results
✅ **Easy Customization**: Simple YAML configuration
✅ **Cost Effective**: Works with GitLab Free tier (with limitations)

Your tests are now fully automated with comprehensive reporting and historical tracking!
