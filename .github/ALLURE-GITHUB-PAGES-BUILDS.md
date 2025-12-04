# Allure Reports on GitHub Pages - Build History

## Overview

Allure reports are now organized by build number on GitHub Pages, allowing you to access reports from any workflow run. Each build gets its own directory, and historical reports are preserved.

## Prerequisites

**Important**: GitHub Pages must be configured to deploy from the `gh-pages` branch:

1. Go to `Repository Settings` → `Pages`
2. Under "Source", select `Deploy from a branch`
3. Under "Branch", select `gh-pages` and `/ (root)`
4. Click Save

**Note**: This is different from the "GitHub Actions" source used previously. The `peaceiris/actions-gh-pages` action creates and manages the `gh-pages` branch automatically.

---

## URL Structure

### Latest Report (Auto-redirect)
```
https://<username>.github.io/<repo>/
```
Automatically redirects to the latest build report.

### Specific Build
```
https://<username>.github.io/<repo>/<build-number>/
```
Example: `https://username.github.io/my-repo/42/`

### All Builds Index
```
https://<username>.github.io/<repo>/builds.html
```
Lists all available build reports.

---

## How It Works

### 1. Report Generation

Each workflow run:
1. Generates Allure report from test results
2. Creates a directory named with the build number (e.g., `42/`)
3. Copies the Allure report into that directory
4. Creates/updates index pages

### 2. Directory Structure

```
gh-pages/
├── index.html          # Redirects to latest build
├── builds.html         # Lists all builds
├── 42/                 # Build #42
│   ├── index.html
│   ├── data/
│   ├── history/
│   └── ...
├── 43/                 # Build #43
│   ├── index.html
│   ├── data/
│   └── ...
└── 44/                 # Build #44 (latest)
    ├── index.html
    ├── data/
    └── ...
```

### 3. Keep Files Strategy

The `peaceiris/actions-gh-pages` action is configured with `keep_files: true`, which means:
- Previous build directories are preserved
- New builds are added without removing old ones
- You can access historical reports indefinitely

---

## Implementation

### Workflow Configuration

```yaml
- name: Prepare Allure report for Pages
  if: always() && (github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master')
  run: |
    # Create build-specific directory
    mkdir -p gh-pages/${{ github.run_number }}
    cp -r allure-report/* gh-pages/${{ github.run_number }}/

    # Create index.html that redirects to latest
    cat > gh-pages/index.html << 'EOF'
    <!DOCTYPE html>
    <html>
    <head>
      <meta http-equiv="refresh" content="0; url=./${{ github.run_number }}/">
      <title>Allure Reports</title>
    </head>
    <body>
      <h1>Allure Test Reports</h1>
      <p>Redirecting to latest report: Build #${{ github.run_number }}</p>
    </body>
    </html>
    EOF

    # Create builds.html for listing all builds
    cat > gh-pages/builds.html << 'EOF'
    <!DOCTYPE html>
    <html>
    <head>
      <title>All Builds - Allure Reports</title>
    </head>
    <body>
      <h1>📊 Allure Test Reports - All Builds</h1>
      <ul id="builds"></ul>
      <script>
        const currentBuild = ${{ github.run_number }};
        document.getElementById('builds').innerHTML =
          '<li><a href="./' + currentBuild + '/">Build #' + currentBuild + '</a> (Latest)</li>';
      </script>
    </body>
    </html>
    EOF

- name: Deploy to GitHub Pages
  if: always() && (github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master')
  uses: peaceiris/actions-gh-pages@v4
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./gh-pages
    keep_files: true          # ✅ Preserve previous builds
    destination_dir: ./
```

---

## Features

### ✅ Build History Preservation
- All build reports are kept
- No automatic cleanup (manage manually if needed)
- Access any historical build by number

### ✅ Auto-redirect to Latest
- Root URL always shows latest build
- No need to remember build numbers
- Convenient for quick access

### ✅ Build Index Page
- `builds.html` lists all available builds
- Currently shows latest build
- Can be enhanced to list all builds dynamically

### ✅ Direct Build Access
- Bookmark specific builds
- Share build-specific URLs
- Compare across builds

---

## Usage Examples

### Accessing Reports

**Latest Report:**
```
https://username.github.io/repo/
```

**Specific Build:**
```
https://username.github.io/repo/42/
https://username.github.io/repo/43/
https://username.github.io/repo/44/
```

**All Builds:**
```
https://username.github.io/repo/builds.html
```

### In Workflow Summary

The workflow automatically adds links to the summary:
```
## Test Reports

### Allure Report
📊 View Latest Report (Build #44)
📋 View All Builds
```

### In PR Comments

PR comments can include build-specific links:
```
Allure Report: Build #44
https://username.github.io/repo/44/
```

---

## Enhanced Builds Index (Optional)

To create a dynamic builds index that lists all builds, you can enhance `builds.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>All Builds - Allure Reports</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
    h1 { color: #333; }
    ul { list-style: none; padding: 0; }
    li { margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 5px; }
    a { color: #0066cc; text-decoration: none; font-weight: bold; }
    a:hover { text-decoration: underline; }
    .latest { background: #e3f2fd; border: 2px solid #2196f3; }
  </style>
</head>
<body>
  <h1>📊 Allure Test Reports - All Builds</h1>
  <p>Available reports by build number:</p>
  <ul id="builds"></ul>
  <script>
    // Fetch list of directories from GitHub API
    fetch('https://api.github.com/repos/<owner>/<repo>/contents/?ref=gh-pages')
      .then(r => r.json())
      .then(data => {
        const builds = data
          .filter(item => item.type === 'dir' && /^\d+$/.test(item.name))
          .map(item => parseInt(item.name))
          .sort((a, b) => b - a);

        const html = builds.map((build, index) =>
          `<li class="${index === 0 ? 'latest' : ''}">
            <a href="./${build}/">Build #${build}</a>
            ${index === 0 ? '(Latest)' : ''}
          </li>`
        ).join('');

        document.getElementById('builds').innerHTML = html;
      });
  </script>
</body>
</html>
```

**Note**: This requires the GitHub Pages repository to be public, or you need to handle authentication for private repos.

---

## Managing Old Reports

### Manual Cleanup

To remove old build reports:

1. **Clone gh-pages branch:**
   ```bash
   git clone --branch gh-pages https://github.com/username/repo.git gh-pages
   cd gh-pages
   ```

2. **Remove old builds:**
   ```bash
   # Remove builds older than build 40
   rm -rf {1..40}/

   # Or keep only last 10 builds
   ls -d [0-9]* | sort -n | head -n -10 | xargs rm -rf
   ```

3. **Commit and push:**
   ```bash
   git add .
   git commit -m "Clean up old build reports"
   git push
   ```

### Automated Cleanup (Optional)

Add a cleanup step to your workflow:

```yaml
- name: Cleanup old builds
  if: always() && (github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master')
  run: |
    # Keep only last 30 builds
    git clone --branch gh-pages --depth 1 https://github.com/${{ github.repository }}.git gh-pages-cleanup
    cd gh-pages-cleanup

    # Remove builds older than current - 30
    MIN_BUILD=$((  ${{ github.run_number }} - 30 ))
    for dir in [0-9]*/; do
      build_num=$(basename "$dir" /)
      if [ "$build_num" -lt "$MIN_BUILD" ]; then
        echo "Removing old build: $build_num"
        rm -rf "$dir"
      fi
    done

    git config user.name github-actions
    git config user.email github-actions@github.com
    git add .
    git commit -m "Cleanup old builds (keeping last 30)" || echo "No builds to clean"
    git push
```

---

## Comparison with Previous Approach

### Previous (Single Report)
- URL: `https://username.github.io/repo/`
- Only latest report available
- Previous reports lost on each deployment
- Simple setup

### Current (Build History)
- URLs:
  - Latest: `https://username.github.io/repo/`
  - Specific: `https://username.github.io/repo/<build>/`
  - Index: `https://username.github.io/repo/builds.html`
- All reports preserved
- Historical analysis possible
- Slightly more complex setup

---

## Benefits

### 1. Historical Analysis
- Compare test results across builds
- Track flakiness over time
- Identify when tests started failing

### 2. Debugging
- Access reports from any build
- No need to download artifacts
- Permanent links (until manually cleaned)

### 3. Collaboration
- Share specific build reports with team
- Reference specific builds in discussions
- No artifact expiration concerns

### 4. Trends
- Review test history
- Identify patterns in failures
- Track test suite growth

---

## Troubleshooting

### Link Not Appearing in Workflow Summary

**Symptom**: The Allure report link is not shown in the workflow summary after the build completes.

**Check 1**: Verify you're on main/master branch
```bash
# Links only appear for main/master branches
git branch
```

**Check 2**: Check "Add Allure report link to summary" step
- Open the workflow run
- Check the "Add Allure report link to summary" step
- Verify it ran and didn't skip

**Check 3**: Check deploy step outcome
```yaml
# The workflow checks if deployment succeeded
if [ "${{ steps.gh-pages-deploy.outcome }}" == "success" ]
```

**Solution**: If deployment was skipped or failed, the link won't appear. Check the "Deploy to GitHub Pages" step for errors.

### Reports Not Appearing

**Check 1**: Verify GitHub Pages is enabled
```
Repository Settings → Pages → Source: Deploy from a branch
Branch: gh-pages / (root)
```

**Important**: Change Pages source from "GitHub Actions" to "Deploy from a branch" and select `gh-pages` branch. This is required for the `peaceiris/actions-gh-pages` action.

**Check 2**: Verify workflow completed
- Check "Deploy to GitHub Pages" step succeeded
- Look for "peaceiris/actions-gh-pages@v4" success message

**Check 3**: Wait for propagation
- GitHub Pages can take 1-2 minutes to update
- Try accessing after a short delay
- You'll see a note in the summary: "It may take 1-2 minutes for GitHub Pages to update"

**Check 4**: Verify gh-pages branch exists
```bash
git ls-remote --heads origin
# Should show refs/heads/gh-pages
```

### 404 Errors

**Cause 1**: Build directory doesn't exist or Pages not yet updated

**Solution**: Verify the build number exists in gh-pages branch:
```bash
git clone --branch gh-pages https://github.com/username/repo.git
ls -la
```

### Index Not Redirecting

**Cause**: index.html not updated or cached

**Solution**:
1. Clear browser cache
2. Try incognito/private mode
3. Check index.html in gh-pages branch

### Old Builds Taking Space

**Cause**: `keep_files: true` preserves all builds

**Solution**: Implement manual or automated cleanup (see "Managing Old Reports" section)

---

## Security Considerations

### Public Repositories
- Reports are publicly accessible
- Do not include sensitive data in tests
- Sanitize test data if needed

### Private Repositories
- Reports only accessible with repository access
- GitHub Pages for private repos requires GitHub Pro/Team
- Consider using private runners

---

## Best Practices

1. **Clean Up Regularly**: Remove old builds periodically to save space
2. **Keep Last N Builds**: Keep 20-30 recent builds for historical analysis
3. **Bookmark Important Builds**: Save links to builds with significant changes
4. **Use Build Numbers in Tickets**: Reference specific build reports in bug reports
5. **Document Breaking Changes**: Link to build reports when merging breaking changes

---

## Related Documentation

- [CI/CD Setup Guide](../CI-CD-SETUP.md)
- [Test Failure Handling](TEST-FAILURE-HANDLING.md)
- [Playwright Report Summary](PLAYWRIGHT-REPORT-SUMMARY.md)
- [peaceiris/actions-gh-pages](https://github.com/peaceiris/actions-gh-pages)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)

---

## Summary

✅ **Build-specific URLs**: Each build has its own permanent URL
✅ **Historical Reports**: All builds preserved until manually cleaned
✅ **Auto-redirect**: Root URL always shows latest build
✅ **Build Index**: `builds.html` provides navigation to all builds
✅ **Easy Sharing**: Share specific build reports via direct URLs
✅ **Long-term Analysis**: Compare test results across builds
✅ **No Expiration**: Reports don't expire like artifacts (30 days)

**Result**: Complete test history accessible via permanent URLs! 📊🔗
