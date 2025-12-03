# Artifact Naming Fix

## Issue
GitHub Actions artifact names cannot contain forward slashes (`/`) or other special characters. The shard notation `1/2`, `2/2` caused upload failures.

## Solution
Added a `shard_index` field to the matrix strategy to create filesystem-safe artifact names.

### Before (Broken)
```yaml
strategy:
  matrix:
    shard: [1/2, 2/2]

# Artifact name: test-results-1/2  ❌ FAILS
```

### After (Fixed)
```yaml
strategy:
  matrix:
    shard: [1/2, 2/2]
    include:
      - shard: 1/2
        shard_index: 1
      - shard: 2/2
        shard_index: 2

# Artifact name: test-results-shard-1  ✅ WORKS
```

## Changed Artifact Names

| Old Name (Broken) | New Name (Fixed) |
|------------------|------------------|
| `test-results-1/2` | `test-results-shard-1` |
| `test-results-2/2` | `test-results-shard-2` |
| `playwright-report-1/2` | `playwright-report-shard-1` |
| `playwright-report-2/2` | `playwright-report-shard-2` |
| `allure-results-1/2` | `allure-results-shard-1` |
| `allure-results-2/2` | `allure-results-shard-2` |

## Testing
After this fix, artifacts should upload successfully in the GitHub Actions workflow.

## Scaling Shards
To add more shards, extend both arrays:

```yaml
strategy:
  matrix:
    shard: [1/3, 2/3, 3/3]
    include:
      - shard: 1/3
        shard_index: 1
      - shard: 2/3
        shard_index: 2
      - shard: 3/3
        shard_index: 3
```
