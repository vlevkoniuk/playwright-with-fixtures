# Allure Reports on GitLab Pages - Build History

## Overview

Allure reports are organized by pipeline ID on GitLab Pages, allowing you to access reports from any pipeline run. Each build gets its own directory, and historical reports are preserved.

## Prerequisites

**Important**: GitLab Pages is automatically enabled for projects. After the first successful `pages` job, your reports will be available.

**Note**: Unlike GitHub Pages which requires manual configuration, GitLab Pages works out of the box.

---

## URL Structure

### Latest Report (Auto-redirect)
```
https://<namespace>.gitlab.io/<project>/
```
Automatically redirects to the latest pipeline report.

### Specific Pipeline
```
https://<namespace>.gitlab.io/<project>/<pipeline-id>/
```
Example: `https://myusername.gitlab.io/my-project/42/`

### All Builds Index
```
https://<namespace>.gitlab.io/<project>/builds.html
```
Lists all available pipeline reports.

---

## How It Works

### 1. Report Generation

Each pipeline run:
1. Generates Allure report from test results
2. Creates a directory named with the pipeline ID (e.g., `42/`)
3. Copies the Allure report into that directory
4. Creates/updates index pages

### 2. Directory Structure

```
public/
├── index.html          # Redirects to latest pipeline
├── builds.html         # Lists all pipelines
├── 42/                 # Pipeline #42
│   ├── index.html
│   ├── data/
│   ├── history/
│   └── ...
├── 43/                 # Pipeline #43
│   ├── index.html
│   ├── data/
│   └── ...
└── 44/                 # Pipeline #44 (latest)
    ├── index.html
    ├── data/
    └── ...
```

### 3. History Preservation

The `pages` job preserves previous builds by:
- Cloning the existing `gl-pages` branch
- Copying previous builds to the new `public/` directory
- Adding the new build
- Uploading the complete `public/` directory

**Important**: GitLab uses the `gl-pages` branch (not `gh-pages` like GitHub).

---

## Implementation

### Pipeline Configuration

```yaml
pages:
  stage: deploy
  image: alpine:latest
  needs:
    - job: generate-reports
      artifacts: true
  before_script:
    - apk add --no-cache git
  script:
    # Clone existing pages to preserve history
    - |
      if git ls-remote --exit-code --heads origin gl-pages >/dev/null 2>&1; then
        git clone --depth 1 --branch gl-pages \
          https://gitlab-ci-token:${CI_JOB_TOKEN}@${CI_SERVER_HOST}/${CI_PROJECT_PATH}.git \
          gl-pages-repo
        cp -r gl-pages-repo/* public/ 2>/dev/null || mkdir -p public
      else
        mkdir -p public
      fi

    # Create pipeline-specific directory
    - mkdir -p public/${CI_PIPELINE_IID}
    - cp -r allure-report/* public/${CI_PIPELINE_IID}/

    # Create index.html that redirects to latest
    - |
      cat > public/index.html << EOF
      <!DOCTYPE html>
      <html>
      <head>
        <meta http-equiv="refresh" content="0; url=./${CI_PIPELINE_IID}/">
        <title>Allure Reports</title>
      </head>
      <body>
        <h1>Allure Test Reports</h1>
        <p>Redirecting to latest report: Pipeline #${CI_PIPELINE_IID}</p>
      </body>
      </html>
      EOF

  artifacts:
    paths:
      - public
    expire_in: never

  rules:
    - if: '$CI_COMMIT_BRANCH == "main"'
    - if: '$CI_COMMIT_BRANCH == "master"'
    - if: '$CI_COMMIT_BRANCH == "develop"'
```

---

## Features

### ✅ Build History Preservation
- All pipeline reports are kept
- No automatic cleanup (manage manually if needed)
- Access any historical pipeline by ID

### ✅ Auto-redirect to Latest
- Root URL always shows latest pipeline
- No need to remember pipeline IDs
- Convenient for quick access

### ✅ Build Index Page
- `builds.html` lists all available pipelines
- Dynamically populated via JavaScript
- Shows latest pipeline highlighted

### ✅ Direct Pipeline Access
- Bookmark specific pipelines
- Share pipeline-specific URLs
- Compare across pipelines

---

## Usage Examples

### Accessing Reports

**Latest Report:**
```
https://myusername.gitlab.io/my-project/
```

**Specific Pipeline:**
```
https://myusername.gitlab.io/my-project/42/
https://myusername.gitlab.io/my-project/43/
https://myusername.gitlab.io/my-project/44/
```

**All Builds:**
```
https://myusername.gitlab.io/my-project/builds.html
```

### In Pipeline Summary

The pipeline automatically prints URLs:
```
📊 Allure Report URL:
https://myusername.gitlab.io/my-project/44/

📋 All Builds:
https://myusername.gitlab.io/my-project/builds.html
```

### In Merge Request Comments

MR comments include pipeline-specific links:
```
Allure Report (GitLab Pages): View Report (Pipeline #44)
https://myusername.gitlab.io/my-project/44/
```

---

## Managing Old Reports

### Manual Cleanup

To remove old pipeline reports:

1. **Clone gl-pages branch:**
   ```bash
   git clone --branch gl-pages https://gitlab.com/<namespace>/<project>.git pages
   cd pages
   ```

2. **Remove old pipelines:**
   ```bash
   # Remove pipelines older than pipeline 40
   rm -rf {1..40}/

   # Or keep only last 10 pipelines
   ls -d [0-9]* | sort -n | head -n -10 | xargs rm -rf
   ```

3. **Commit and push:**
   ```bash
   git add .
   git commit -m "Clean up old pipeline reports"
   git push
   ```

### Automated Cleanup (Optional)

Add a cleanup job to your pipeline:

```yaml
cleanup-old-reports:
  stage: deploy
  image: alpine:latest
  needs: []
  before_script:
    - apk add --no-cache git
  script:
    # Clone gl-pages branch
    - |
      git clone --depth 1 --branch gl-pages \
        https://gitlab-ci-token:${CI_JOB_TOKEN}@${CI_SERVER_HOST}/${CI_PROJECT_PATH}.git \
        pages
      cd pages

      # Keep only last 30 pipelines
      MIN_PIPELINE=$((CI_PIPELINE_IID - 30))
      for dir in [0-9]*/; do
        pipeline_num=$(basename "$dir" /)
        if [ "$pipeline_num" -lt "$MIN_PIPELINE" ]; then
          echo "Removing old pipeline: $pipeline_num"
          rm -rf "$dir"
        fi
      done

      # Commit if changes
      git config user.name "GitLab CI"
      git config user.email "gitlab-ci@gitlab.com"
      git add .
      git commit -m "Cleanup old pipelines (keeping last 30)" || echo "No pipelines to clean"

      # Push back
      git push https://gitlab-ci-token:${CI_JOB_TOKEN}@${CI_SERVER_HOST}/${CI_PROJECT_PATH}.git gl-pages
  rules:
    - if: '$CI_COMMIT_BRANCH == "main" && $CI_PIPELINE_SOURCE == "schedule"'
```

Run this on a schedule (Settings → CI/CD → Schedules).

---

## Comparison with GitHub Pages

### GitHub Pages (Previous Approach)
- Uses `gh-pages` branch
- Requires peaceiris/actions-gh-pages action
- Requires manual Pages configuration
- URL: `https://username.github.io/repo/<build>/`
- Uses `github.run_number` for builds

### GitLab Pages (Current Approach)
- Uses `gl-pages` branch (automatic)
- Built-in Pages support
- No configuration required
- URL: `https://namespace.gitlab.io/project/<pipeline>/`
- Uses `CI_PIPELINE_IID` for pipelines

### Key Differences

| Feature | GitHub Actions | GitLab CI |
|---------|---------------|-----------|
| **Branch** | gh-pages | gl-pages |
| **Configuration** | Manual setup required | Automatic |
| **Deployment** | peaceiris action | Built-in `pages` job |
| **Build ID** | Run number | Pipeline IID |
| **URL Format** | username.github.io/repo | namespace.gitlab.io/project |
| **History** | keep_files: true | Manual clone + copy |

---

## Benefits

### 1. Historical Analysis
- Compare test results across pipelines
- Track flakiness over time
- Identify when tests started failing

### 2. Debugging
- Access reports from any pipeline
- No need to download artifacts
- Permanent links (until manually cleaned)

### 3. Collaboration
- Share specific pipeline reports with team
- Reference specific pipelines in discussions
- No artifact expiration concerns

### 4. Trends
- Review test history
- Identify patterns in failures
- Track test suite growth

---

## Troubleshooting

### Reports Not Appearing

**Check 1**: Verify pipeline completed
- Go to **CI/CD → Pipelines**
- Check `pages` job succeeded
- Look for green checkmark

**Check 2**: Verify GitLab Pages is enabled
- Go to **Settings → Pages**
- Should show: "Your pages are served under: https://..."

**Check 3**: Wait for propagation
- GitLab Pages can take 1-2 minutes to update
- Try accessing after a short delay

**Check 4**: Verify gl-pages branch exists
```bash
git ls-remote --heads origin
# Should show refs/heads/gl-pages
```

**Check 5**: Verify branch
- Pages only deploy from `main`, `master`, or `develop`
- Check your current branch

### 404 Errors

**Cause 1**: Pipeline directory doesn't exist

**Solution**: Verify the pipeline ID exists in gl-pages branch:
```bash
git clone --branch gl-pages https://gitlab.com/<namespace>/<project>.git
ls -la
```

**Cause 2**: Pages not yet updated

**Solution**: Wait 1-2 minutes and refresh

### Index Not Redirecting

**Cause**: index.html not updated or cached

**Solution**:
1. Clear browser cache
2. Try incognito/private mode
3. Check index.html in gl-pages branch

### Old Pipelines Taking Space

**Cause**: All pipelines are preserved by default

**Solution**: Implement manual or automated cleanup (see "Managing Old Reports" section)

### Pages Job Fails with Git Error

**Cause**: First pipeline run, gl-pages branch doesn't exist yet

**Solution**: This is normal. The job will succeed and create the branch. Subsequent pipelines will work correctly.

---

## Security Considerations

### Public Projects
- Reports are publicly accessible
- Do not include sensitive data in tests
- Sanitize test data if needed

### Private Projects
- Reports only accessible with project access
- GitLab Pages for private projects requires GitLab Premium/Ultimate
- Or: Set Pages access control (Settings → Pages → Access Control)

### Access Control Options

**GitLab Free/Premium:**
- Public projects: Pages are public
- Private projects: Pages are public by default (Premium can restrict)

**GitLab Ultimate:**
- Can restrict Pages to project members only
- Settings → Pages → Access Control → "Only project members"

---

## Best Practices

1. **Clean Up Regularly**: Remove old pipelines periodically to save storage
2. **Keep Last N Pipelines**: Keep 20-30 recent pipelines for historical analysis
3. **Bookmark Important Pipelines**: Save links to pipelines with significant changes
4. **Use Pipeline IDs in Issues**: Reference specific pipeline reports in bug reports
5. **Document Breaking Changes**: Link to pipeline reports when merging breaking changes
6. **Monitor Storage**: Check **Settings → Usage Quotas** for storage usage

---

## Related Documentation

- [GitLab CI Setup Guide](GITLAB-CI-SETUP.md)
- [GitLab Pages Documentation](https://docs.gitlab.com/ee/user/project/pages/)
- [GitLab CI/CD Documentation](https://docs.gitlab.com/ee/ci/)

---

## Summary

✅ **Pipeline-specific URLs**: Each pipeline has its own permanent URL
✅ **Historical Reports**: All pipelines preserved until manually cleaned
✅ **Auto-redirect**: Root URL always shows latest pipeline
✅ **Build Index**: `builds.html` provides navigation to all pipelines
✅ **Easy Sharing**: Share specific pipeline reports via direct URLs
✅ **Long-term Analysis**: Compare test results across pipelines
✅ **No Expiration**: Reports don't expire like artifacts
✅ **Built-in Support**: No external actions or configuration needed

**Result**: Complete test history accessible via permanent URLs on GitLab Pages! 📊🔗
