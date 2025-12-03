import { Locator } from '@playwright/test';

export class LoginFormComponent {
    private get emailInput(): Locator {
        return this.baseLocator.locator('input[data-qa="login-email"]');
    }

    private get passwordInput(): Locator {
        return this.baseLocator.locator('input[data-qa="login-password"]');
    }

    private get loginButton(): Locator {
        return this.baseLocator.locator('button[data-qa="login-button"]');
    }

    private get loginFormHeading(): Locator {
        return this.baseLocator.locator('h2');
    }

    public constructor(private readonly baseLocator: Locator) {}

    public async waitForVisible(): Promise<void> {
        await this.loginFormHeading.waitFor({ state: 'visible' });
    }

    public async login(email: string, password: string): Promise<void> {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }

    public async isVisible(): Promise<boolean> {
        return await this.loginFormHeading.isVisible();
    }
}
