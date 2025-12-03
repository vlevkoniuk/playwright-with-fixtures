# Sharding and Blob Report Update

## Problem Fixed
Tests were all running on shard 1 instead of being distributed across multiple shards.

## Root Cause
The previous configuration used a single `shard` variable with values like `1/2` and `2/2`, which didn't properly distribute tests.

## Solution
Updated to use Playwright's recommended sharding approach with separate `shardIndex` and `shardTotal` variables, plus blob reports for proper merging.

---

## Changes Made

### 1. Workflow Updates ([.github/workflows/playwright-tests.yml](.github/workflows/playwright-tests.yml))

#### Before (Incorrect):
```yaml
matrix:
  shard: [1/2, 2/2]
  include:
    - shard: 1/2
      shard_index: 1
    - shard: 2/2
      shard_index: 2

# All tests ran on shard 1 ❌
run: npx playwright test --shard=${{ matrix.shard }}
```

#### After (Correct):
```yaml
matrix:
  shardIndex: [1, 2]
  shardTotal: [2]

# Tests properly distributed ✅
run: npx playwright test --shard=${{ matrix.shardIndex }}/${{ matrix.shardTotal }}
```

### 2. Blob Reporter Configuration

#### Playwright Config ([playwright.config.ts](playwright.config.ts))
```typescript
reporter: process.env.CI
    ? [
        ['list'],
        ['blob'],              // ✅ Blob reporter for CI
        ['allure-playwright']
    ]
    : [
        ['list'],
        ['allure-playwright'],
        ['html', { open: 'never' }]
    ]
```

**Why Blob Reporter?**
- Designed for sharded test runs
- Efficiently stores test results
- Enables proper merging of results from multiple shards
- Smaller artifact sizes

### 3. New Jobs Structure

#### a. **Test Job** (Runs in parallel)
- Runs tests on each shard
- Uploads blob reports (1-day retention)
- Uploads Allure results (30-day retention)

#### b. **Merge Reports Job** (New!)
- Downloads all blob reports
- Merges into single HTML report
- Uploads unified Playwright report

#### c. **Report Job** (Updated)
- Downloads blob reports for JUnit
- Generates merged JUnit XML
- Publishes test results
- Generates Allure reports

---

## Benefits

### 1. **Proper Sharding** ✅
- Tests actually distributed across shards
- Faster CI execution
- Better parallelization

### 2. **Efficient Reporting** 📊
- Blob reports are smaller
- Faster upload/download
- Proper merging of shard results

### 3. **Better Artifacts** 📦
| Artifact | Retention | Purpose |
|----------|-----------|---------|
| `blob-report-1`, `blob-report-2` | 1 day | Raw test data for merging |
| `playwright-html-report` | 30 days | Unified HTML report |
| `allure-report` | 30 days | Allure report |
| `allure-report-single-file` | 30 days | Portable Allure report |

---

## Scaling Shards

To increase to 4 shards:

```yaml
strategy:
  matrix:
    shardIndex: [1, 2, 3, 4]
    shardTotal: [4]
```

**Formula**: With N shards, tests run ~N times faster (minus merge overhead)

---

## Local vs CI Reporting

### Local Development
```bash
npm test
# Uses: HTML reporter, Allure, JSON
# Output: playwright-report/, allure-results/
```

### CI Environment
```bash
CI=true npm test
# Uses: Blob reporter, Allure
# Output: blob-report/, allure-results/
```

---

## Viewing Reports

### Playwright HTML Report
1. Download `playwright-html-report` artifact
2. Run: `npx playwright show-report <path-to-artifact>`

### Allure Report
- **GitHub Pages**: `https://username.github.io/repo/allure-report/run-number/`
- **Download**: Download artifact and open `index.html`

### Test Results (Inline)
- View in workflow summary
- Check runs on commits
- PR comments

---

## Troubleshooting

### Blob reports not found
- Check `blob-report/` directory exists
- Verify blob reporter in config
- Ensure CI environment variable is set

### Tests still running on one shard
- Verify `shardIndex` and `shardTotal` are used
- Check test run command uses correct syntax
- Review job matrix configuration

### Merge reports failing
- Ensure all blob reports downloaded
- Check Playwright version compatibility
- Verify merge-reports command syntax

---

## Migration Checklist

- [x] Update workflow matrix to use `shardIndex` and `shardTotal`
- [x] Change test command to use `${{ matrix.shardIndex }}/${{ matrix.shardTotal }}`
- [x] Add blob reporter to playwright.config.ts
- [x] Update artifact uploads to use blob reports
- [x] Add merge-reports job
- [x] Update report job to merge blob reports for JUnit
- [x] Test workflow runs successfully

---

## References

- [Playwright Sharding Docs](https://playwright.dev/docs/test-sharding)
- [Blob Reporter Docs](https://playwright.dev/docs/test-reporters#blob-reporter)
- [Merge Reports Docs](https://playwright.dev/docs/test-sharding#merge-reports-from-multiple-shards)
