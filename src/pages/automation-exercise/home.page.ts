import { Page, Locator } from '@playwright/test';
import { AutomationExerciseBasePage } from './base.page';
import { ConfigService } from '../../services/config.service';
import { CategoryFilterComponent } from '../../commponents/automation-exercise/category-filter.component';

export class HomePage extends AutomationExerciseBasePage {
    public readonly categoryFilter: CategoryFilterComponent;

    private get featuresSection(): Locator {
        return this.page.locator('.features_items');
    }

    private get categorySection(): Locator {
        return this.page.locator('.left-sidebar');
    }

    public constructor(page: Page, configService: ConfigService) {
        super(page, configService, configService.config.uiConfig.automationExerciseBaseUrl);
        this.categoryFilter = new CategoryFilterComponent(this.page.locator('.left-sidebar'));
    }

    public async waitForPageLoad(): Promise<void> {
        await this.featuresSection.waitFor({ state: 'visible' });
    }

    public async isCategorySectionVisible(): Promise<boolean> {
        return await this.categorySection.isVisible();
    }
}
