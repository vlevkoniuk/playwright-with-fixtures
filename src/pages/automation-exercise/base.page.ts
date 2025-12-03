import { Page, expect } from '@playwright/test';
import { HeaderComponent } from '../../commponents/automation-exercise/header.component';
import { ConfigService } from '../../services/config.service';

export class AutomationExerciseBasePage {
    public readonly header: HeaderComponent;

    public constructor(
        protected readonly page: Page,
        protected readonly configService: ConfigService,
        protected readonly _url = ''
    ) {
        this.header = new HeaderComponent(this.page);
    }

    public async goto(): Promise<void> {
        const fullUrl = this._url || this.configService.config.uiConfig.automationExerciseBaseUrl;
        await this.page.goto(fullUrl);
    }

    public async verifyTitle(expectedTitle: string): Promise<void> {
        await expect(this.page).toHaveTitle(expectedTitle);
    }

    public async verifyUrl(expectedUrl: string): Promise<void> {
        await expect(this.page).toHaveURL(expectedUrl);
    }

    public get pageInstance(): Page {
        return this.page;
    }
}
