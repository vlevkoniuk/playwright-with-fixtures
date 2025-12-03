# GitHub Actions Permissions Fix

## Issue
The `publish-unit-test-result-action` failed with a 403 error:
```
Resource not accessible by integration: 403
{"message": "Resource not accessible by integration"}
```

## Root Cause
GitHub Actions workflows need explicit permissions to create check runs, write to pull requests, and access certain resources. By default, workflows have limited permissions.

## Solution
Added explicit `permissions` block to all workflow files.

## Permissions Added

### Main Workflow (playwright-tests.yml)
```yaml
permissions:
  contents: read          # Read repository contents
  checks: write          # Create check runs (required for test results)
  pull-requests: write   # Comment on PRs (required for PR comments)
  actions: read          # Read workflow artifacts
```

### Other Workflows (scheduled-tests.yml, multi-browser-tests.yml)
```yaml
permissions:
  contents: read    # Read repository contents
  actions: read     # Read workflow artifacts
```

## What Each Permission Does

| Permission | Level | Purpose |
|-----------|-------|---------|
| `contents` | read | Read files from the repository |
| `checks` | write | Create check runs (test result summaries) |
| `pull-requests` | write | Add comments to pull requests |
| `actions` | read | Access workflow artifacts and runs |

## Why This Was Needed

The `EnricoMi/publish-unit-test-result-action@v2` action requires:
1. **`checks: write`** - To create check runs showing test results
2. **`pull-requests: write`** - To comment on PRs with results
3. **`contents: read`** - To access the repository

Without these permissions, the action cannot function.

## Security Note

These permissions follow the **principle of least privilege**:
- ✅ Only granted what's needed
- ✅ Read-only where possible
- ✅ Write only for specific resources (checks, PRs)
- ❌ No destructive permissions (delete, admin)

## Testing
After adding permissions, the workflow should:
- ✅ Create check runs successfully
- ✅ Add test result comments to PRs
- ✅ Display test results inline in workflow runs

## Further Reading
- [GitHub Actions Permissions](https://docs.github.com/en/actions/security-guides/automatic-token-authentication#permissions-for-the-github_token)
- [publish-unit-test-result-action docs](https://github.com/EnricoMi/publish-unit-test-result-action#permissions)
