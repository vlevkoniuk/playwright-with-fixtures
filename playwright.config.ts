import { defineConfig, devices } from '@playwright/test';

// const rpConfig = {
//     apiKey: 'r-d_YZwgDZc4RsmNPB8tgpulA44PRXs4NFaPOum7L9bpxgK24EpQ1vJibEmL6c7TALep',
//     endpoint: 'http://localhost:8080/api/v2',
//     project: 'test_automation',
//     launch: 'Playwright Jira test run',
//     attributes: [],
//     description: 'playwright reportportal example'
// };

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    testDir: './tests',
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 1 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? '50%' : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    // reporter: [['html'], ['allure-playwright'], ['@reportportal/agent-js-playwright', rpConfig], ['json']],
    reporter: process.env.CI
        ? [
            ['list'],
            ['blob'],
            ['allure-playwright'],
            ['json', { outputFile: 'test-results/test-results.json' }],
            ['junit', { outputFile: 'test-results/test-results.xml' }],
            ['pwmochawesome', { charts: true, reportTitle: 'Automation Exercise Test Report', reportFilename: 'automation-exercise-report' }]
        ]
        : [
            ['list'],
            ['allure-playwright'],
            ['pwmochawesome', { charts: true, reportTitle: 'Automation Exercise Test Report', reportFilename: 'automation-exercise-report' }],
            ['html', { open: 'never' }],
            ['json', { outputFile: 'test-results/test-results.json' }]
        ],
    // timeout: 45000,
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto('')`. */
        // baseURL: 'http://localhost:3000',

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'retain-on-failure',

        /* Take screenshot on failure */
        screenshot: 'only-on-failure',

        /* Record video for all tests */
        // Note: For custom fixtures creating their own context, video options must be set during context creation
        video: {
            mode: 'retain-on-failure',
            size: { width: 1680, height: 900 }
        }
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                headless: true,
                viewport: {
                    width: 1680,
                    height: 900
                }
                // storageState: '.auth/storage-state-0.json'
            }
        }

        // {
        //     name: 'firefox',
        //     use: { ...devices['Desktop Firefox'] }
        // },

        // {
        //     name: 'webkit',
        //     use: { ...devices['Desktop Safari'] }
        // }

        /* Test against mobile viewports. */
        // {
        //   name: 'Mobile Chrome',
        //   use: { ...devices['Pixel 5'] },
        // },
        // {
        //   name: 'Mobile Safari',
        //   use: { ...devices['iPhone 12'] },
        // },

        /* Test against branded browsers. */
        // {
        //   name: 'Microsoft Edge',
        //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
        // },
        // {
        //   name: 'Google Chrome',
        //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
        // },
    ]

    /* Run your local dev server before starting the tests */
    // webServer: {
    //   command: 'npm run start',
    //   url: 'http://localhost:3000',
    //   reuseExistingServer: !process.env.CI,
    // },
});
