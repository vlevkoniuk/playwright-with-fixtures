import { Locator } from '@playwright/test';
import { CategoryDto, SubcategoryDto } from '../../models/ui/category.dto';

export class CategoryFilterComponent {
    private get categoryPanel(): Locator {
        return this.baseLocator.locator('.panel-group');
    }

    private get allCategoryHeaders(): Locator {
        return this.categoryPanel.locator('.panel-heading');
    }

    private getCategoryHeader(categoryName: string): Locator {
        return this.categoryPanel.locator(`.panel-heading:has-text("${categoryName}")`);
    }

    private getCategoryToggle(categoryName: string): Locator {
        return this.getCategoryHeader(categoryName).locator('a[data-toggle="collapse"]');
    }

    private async getCategoryBody(categoryName: string): Promise<Locator> {
        const toggle = this.getCategoryToggle(categoryName);
        const href = await toggle.getAttribute('href');

        if (!href) {
            throw new Error(`Category "${categoryName}" does not have a collapse panel`);
        }

        return this.baseLocator.page().locator(href);
    }

    private async getSubcategoryLink(categoryName: string, subcategoryName: string): Promise<Locator> {
        const categoryBody = await this.getCategoryBody(categoryName);
        return categoryBody.locator(`a:has-text("${subcategoryName}")`);
    }

    public constructor(private readonly baseLocator: Locator) {}

    public async waitForVisible(): Promise<void> {
        await this.categoryPanel.waitFor({ state: 'visible' });
    }

    public async isVisible(): Promise<boolean> {
        return await this.categoryPanel.isVisible();
    }

    public async getCategories(): Promise<CategoryDto[]> {
        const categories: CategoryDto[] = [];
        const categoryHeaders = await this.allCategoryHeaders.all();

        for (const header of categoryHeaders) {
            const categoryName = (await header.textContent())?.trim() ?? '';
            if (!categoryName) continue;

            const toggle = header.locator('a[data-toggle="collapse"]');
            const href = await toggle.getAttribute('href');

            if (!href) {
                categories.push({
                    name: categoryName,
                    subcategories: []
                });
                continue;
            }

            const isExpanded = (await toggle.getAttribute('aria-expanded')) === 'true';

            if (!isExpanded) {
                await toggle.click();
                await this.baseLocator.page().waitForTimeout(300);
            }

            const categoryBody = this.baseLocator.page().locator(`${href} .panel-body`);
            const subcategoryLinks = await categoryBody.locator('li a').all();
            const subcategories: SubcategoryDto[] = [];

            for (const link of subcategoryLinks) {
                const subcategoryText = await link.textContent();
                const subcategoryName = subcategoryText?.trim() ?? '';
                if (subcategoryName) {
                    subcategories.push({ name: subcategoryName });
                }
            }

            categories.push({
                name: categoryName,
                subcategories
            });

            if (!isExpanded) {
                await toggle.click();
                await this.baseLocator.page().waitForTimeout(300);
            }
        }

        return categories;
    }

    public async clickCategory(categoryName: string, subcategoryName?: string): Promise<void> {
        const categoryToggle = this.getCategoryToggle(categoryName);
        const isExpanded = (await categoryToggle.getAttribute('aria-expanded')) === 'true';

        if (!subcategoryName) {
            await categoryToggle.click();
            return;
        }

        if (!isExpanded) {
            await categoryToggle.click();
            await this.baseLocator.page().waitForTimeout(300);
        }

        const subcategoryLink = await this.getSubcategoryLink(categoryName, subcategoryName);
        await subcategoryLink.click();
    }

    public async isCategoryExpanded(categoryName: string): Promise<boolean> {
        const categoryToggle = this.getCategoryToggle(categoryName);
        const isExpanded = !(await categoryToggle.getAttribute('class'))?.includes('collapsed');
        return isExpanded;
    }

    public async expandCategory(categoryName: string): Promise<void> {
        const isExpanded = await this.isCategoryExpanded(categoryName);
        if (!isExpanded) {
            await this.getCategoryToggle(categoryName).click();
            await this.baseLocator.page().waitForTimeout(300);
        }
    }

    public async collapseCategory(categoryName: string): Promise<void> {
        const isExpanded = await this.isCategoryExpanded(categoryName);
        if (isExpanded) {
            await this.getCategoryToggle(categoryName).click();
            await this.baseLocator.page().waitForTimeout(300);
        }
    }

    public async getSubcategories(categoryName: string): Promise<SubcategoryDto[]> {
        await this.expandCategory(categoryName);

        const categoryBody = await this.getCategoryBody(categoryName);
        const subcategoryLinks = await categoryBody.locator('li a').all();
        const subcategories: SubcategoryDto[] = [];

        for (const link of subcategoryLinks) {
            const subcategoryText = await link.textContent();
            const subcategoryName = subcategoryText?.trim() ?? '';
            if (subcategoryName) {
                subcategories.push({ name: subcategoryName });
            }
        }

        return subcategories;
    }
}
