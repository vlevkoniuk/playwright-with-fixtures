import { Locator, Page } from '@playwright/test';

export class HeaderComponent {
    private get loggedInAsText(): Locator {
        return this.page.locator('a:has-text("Logged in as")');
    }

    private get loginLink(): Locator {
        return this.page.locator('a[href="/login"]');
    }

    private get logoutLink(): Locator {
        return this.page.locator('a[href="/logout"]');
    }

    private get homeLink(): Locator {
        return this.page.locator('a[href="/"]').first();
    }

    public constructor(private readonly page: Page) {}

    public async isLoggedIn(): Promise<boolean> {
        return await this.loggedInAsText.isVisible();
    }

    public async getLoggedInUsername(): Promise<string | null> {
        if (await this.isLoggedIn()) {
            const text = await this.loggedInAsText.textContent();
            return text?.replace('Logged in as ', '').trim() ?? null;
        }
        return null;
    }

    public async clickLogin(): Promise<void> {
        await this.loginLink.click();
    }

    public async clickLogout(): Promise<void> {
        await this.logoutLink.click();
    }

    public async clickHome(): Promise<void> {
        await this.homeLink.click();
    }
}
