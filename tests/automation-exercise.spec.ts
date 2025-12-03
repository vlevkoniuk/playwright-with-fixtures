import { test } from '../src/fixtures/automation-exercise.fixture';
import { expect } from '@playwright/test';

test.describe('Automation Exercise Tests', { tag: ['@automation-exercise'] }, () => {
    test('should verify user is logged in on home page', async ({ homePage }) => {
        await homePage.goto();
        await homePage.waitForPageLoad();

        const isLoggedIn = await homePage.header.isLoggedIn();
        expect(isLoggedIn).toBeTruthy();

        const username = await homePage.header.getLoggedInUsername();
        console.log(`Logged in as: ${username}`);
        expect(username).not.toBeNull();
    });

    test('should verify home page title', async ({ homePage }) => {
        await homePage.goto();
        await homePage.waitForPageLoad();

        await homePage.verifyTitle('Automation Exercise');
    });

    test('should verify category section is visible', async ({ homePage }) => {
        await homePage.goto();
        await homePage.waitForPageLoad();

        const isCategoryVisible = await homePage.isCategorySectionVisible();
        expect(isCategoryVisible).toBeTruthy();
    });
});
