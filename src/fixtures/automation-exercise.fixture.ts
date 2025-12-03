import { test as base, Browser } from '@playwright/test';
import { LoginPage } from '../pages/automation-exercise/login.page';
import { HomePage } from '../pages/automation-exercise/home.page';
import { ConfigService } from '../services/config.service';
import * as fs from 'fs';

interface AutomationExerciseFixture {
    loginPage: LoginPage;
    homePage: HomePage;
    configService: ConfigService;
}

const storageState = (workerId: number): string => `.auth/automation-exercise-storage-state-${workerId}.json`;

export const test = base.extend<AutomationExerciseFixture>({
    configService: async ({ browserName }, use) => {
        console.log(browserName);
        const configService = new ConfigService();
        await use(configService);
    },

    loginPage: async ({ browser, configService }, use) => {
        const workerId = test.info().workerIndex;
        await authenticateAutomationExercise(browser, workerId, configService);

        const context = await browser.newContext({
            storageState: storageState(workerId),
            recordVideo: {
                dir: 'test-results/videos'
            }
        });
        const page = await context.newPage();
        const loginPage = new LoginPage(page, configService);
        await use(loginPage);

        await page.close();
        await context.close();
    },

    homePage: async ({ browser, configService }, use) => {
        const workerId = test.info().workerIndex;
        await authenticateAutomationExercise(browser, workerId, configService);

        const context = await browser.newContext({
            storageState: storageState(workerId),
            recordVideo: {
                dir: 'test-results/videos'
            }
        });
        const page = await context.newPage();
        const homePage = new HomePage(page, configService);
        await use(homePage);

        await page.close();
        await context.close();
    }
});

async function authenticateAutomationExercise(browser: Browser, workerId: number, configService: ConfigService): Promise<void> {
    if (fs.existsSync(storageState(workerId))) return;

    const context = await browser.newContext();
    const page = await context.newPage();
    const loginPage = new LoginPage(page, configService);

    await loginPage.goto();
    await loginPage.loginWithStoredCredentials();

    await page.context().storageState({ path: storageState(workerId) });
    await context.close();
}
