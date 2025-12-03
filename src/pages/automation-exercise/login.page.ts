import { Page } from '@playwright/test';
import { LoginFormComponent } from '../../commponents/automation-exercise/login-form.component';
import { HeaderComponent } from '../../commponents/automation-exercise/header.component';
import { ConfigService } from '../../services/config.service';

export class LoginPage {
    private readonly _url: string;
    public readonly loginForm: LoginFormComponent;
    public readonly header: HeaderComponent;

    public constructor(
        private readonly page: Page,
        private readonly configService: ConfigService
    ) {
        this._url = `${this.configService.config.uiConfig.automationExerciseBaseUrl}login`;
        this.loginForm = new LoginFormComponent(this.page.locator('.login-form').first());
        this.header = new HeaderComponent(this.page);
    }

    public async goto(): Promise<void> {
        await this.page.goto(this._url, { waitUntil: 'domcontentloaded', timeout: 4000 });
        await this.loginForm.waitForVisible();
    }

    public async login(email: string, password: string): Promise<void> {
        await this.loginForm.login(email, password);
        await this.header.isLoggedIn();
    }

    public async loginWithStoredCredentials(): Promise<void> {
        const email = this.configService.config.automationExerciseAuth.email;
        const password = this.configService.config.automationExerciseAuth.password;
        await this.login(email, password);
    }

    public async isLoggedIn(): Promise<boolean> {
        return await this.header.isLoggedIn();
    }
}
