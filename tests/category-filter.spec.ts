import { test } from '../src/fixtures/automation-exercise.fixture';
import { expect } from '@playwright/test';
import { CategoryDto } from '../src/models/ui/category.dto';

test.describe('Category Filter Tests', { tag: ['@automation-exercise', '@category'] }, () => {
    test('should extract and display all categories with subcategories', async ({ homePage }) => {
        let categories: CategoryDto[];

        await test.step('Given I navigate to the home page', async () => {
            await homePage.goto();
            await homePage.waitForPageLoad();
        });

        await test.step('When I extract all categories with subcategories', async () => {
            categories = await homePage.categoryFilter.getCategories();
            console.log('\n=== Categories Structure ===');
            console.log(JSON.stringify(categories, null, 2));
        });

        test.step('Then categories should be present and valid', () => {
            expect(categories.length).toBeGreaterThan(0);

            categories.forEach((category: CategoryDto) => {
                console.log(`\nCategory: ${category.name}`);
                expect(category.name).toBeTruthy();

                if (category.subcategories.length > 0) {
                    console.log(`  Subcategories (${category.subcategories.length}):`);
                    category.subcategories.forEach(sub => {
                        console.log(`    - ${sub.name}`);
                        expect(sub.name).toBeTruthy();
                    });
                }
            });
        });
    });

    test('should click category without subcategory', async ({ homePage }) => {
        let categories: CategoryDto[];
        let firstCategory: CategoryDto;
        let isExpandedBefore: boolean;
        let isExpandedAfter: boolean;

        await test.step('Given I navigate to the home page', async () => {
            await homePage.goto();
            await homePage.waitForPageLoad();
        });

        await test.step('And I get all available categories', async () => {
            categories = await homePage.categoryFilter.getCategories();
            expect(categories.length).toBeGreaterThan(0);
            firstCategory = categories[0];
        });

        await test.step('And I check the initial state of the first category', async () => {
            isExpandedBefore = await homePage.categoryFilter.isCategoryExpanded(firstCategory.name);
            console.log(`Category "${firstCategory.name}" initial state: ${isExpandedBefore ? 'expanded' : 'collapsed'}`);
        });

        await test.step('When I click on the category', async () => {
            await homePage.categoryFilter.clickCategory(firstCategory.name);
        });

        await test.step('Then the category state should be toggled', async () => {
            isExpandedAfter = await homePage.categoryFilter.isCategoryExpanded(firstCategory.name);
            expect(isExpandedAfter).toBe(!isExpandedBefore);
            console.log(`Category "${firstCategory.name}" toggled from ${isExpandedBefore} to ${isExpandedAfter}`);
        });
    });

    test('should click category with subcategory and navigate', async ({ homePage }) => {
        let categories: CategoryDto[];
        let categoryWithSubcategories: CategoryDto | undefined;
        let categoryName: string;
        let subcategoryName: string;
        let currentUrl: string;

        await test.step('Given I navigate to the home page', async () => {
            await homePage.goto();
            await homePage.waitForPageLoad();
        });

        await test.step('And I find a category with subcategories', async () => {
            categories = await homePage.categoryFilter.getCategories();
            categoryWithSubcategories = categories.find(cat => cat.subcategories.length > 0);
            expect(categoryWithSubcategories).toBeDefined();
            expect(categoryWithSubcategories!.subcategories.length).toBeGreaterThan(0);
        });

        await test.step('When I click on a subcategory', async () => {
            categoryName = categoryWithSubcategories!.name;
            subcategoryName = categoryWithSubcategories!.subcategories[0].name;
            console.log(`Clicking category: "${categoryName}" -> subcategory: "${subcategoryName}"`);
            await homePage.categoryFilter.clickCategory(categoryName, subcategoryName);
        });

        await test.step('Then I should be navigated to the category products page', async () => {
            await homePage.pageInstance.waitForLoadState('networkidle');
            currentUrl = homePage.pageInstance.url();
            console.log(`Navigated to: ${currentUrl}`);
            expect(currentUrl).toContain('category_products');
        });
    });

    test('should expand and collapse categories', async ({ homePage }) => {
        let categories: CategoryDto[];
        let firstCategory: CategoryDto;
        let isExpanded: boolean;

        await test.step('Given I navigate to the home page', async () => {
            await homePage.goto();
            await homePage.waitForPageLoad();
        });

        await test.step('And I get all available categories', async () => {
            categories = await homePage.categoryFilter.getCategories();
            expect(categories.length).toBeGreaterThan(0);
            firstCategory = categories[0];
        });

        await test.step('When I collapse the first category', async () => {
            await homePage.categoryFilter.collapseCategory(firstCategory.name);
        });

        await test.step('Then the category should be collapsed', async () => {
            isExpanded = await homePage.categoryFilter.isCategoryExpanded(firstCategory.name);
            expect(isExpanded).toBe(false);
            console.log(`Category "${firstCategory.name}" collapsed`);
        });

        await test.step('When I expand the category', async () => {
            await homePage.categoryFilter.expandCategory(firstCategory.name);
        });

        await test.step('Then the category should be expanded', async () => {
            isExpanded = await homePage.categoryFilter.isCategoryExpanded(firstCategory.name);
            expect(isExpanded).toBe(true);
            console.log(`Category "${firstCategory.name}" expanded`);
        });
    });

    test('should get subcategories for specific category', async ({ homePage }) => {
        let categories: CategoryDto[];
        let categoryWithSubcategories: CategoryDto | undefined;
        let categoryName: string;
        let subcategories: { name: string }[];

        await test.step('Given I navigate to the home page', async () => {
            await homePage.goto();
            await homePage.waitForPageLoad();
        });

        await test.step('And I find a category with subcategories', async () => {
            categories = await homePage.categoryFilter.getCategories();
            categoryWithSubcategories = categories.find(cat => cat.subcategories.length > 0);
            expect(categoryWithSubcategories).toBeDefined();
            categoryName = categoryWithSubcategories!.name;
        });

        await test.step('When I get subcategories for the category', async () => {
            subcategories = await homePage.categoryFilter.getSubcategories(categoryName);
            console.log(`\nSubcategories for "${categoryName}":`);
            subcategories.forEach(sub => {
                console.log(`  - ${sub.name}`);
            });
        });

        await test.step('Then the subcategories should match the expected count', () => {
            expect(subcategories.length).toBe(categoryWithSubcategories!.subcategories.length);
            expect(subcategories.length).toBeGreaterThan(0);
        });
    });

    test('should verify category filter is visible', async ({ homePage }) => {
        let isVisible: boolean;

        await test.step('Given I navigate to the home page', async () => {
            await homePage.goto();
            await homePage.waitForPageLoad();
        });

        await test.step('When I check if category filter is visible', async () => {
            isVisible = await homePage.categoryFilter.isVisible();
        });

        await test.step('Then the category filter should be visible', () => {
            expect(isVisible).toBe(true);
        });
    });

    test('should navigate through multiple subcategories', async ({ homePage }) => {
        let categories: CategoryDto[];
        let categoryWithSubcategories: CategoryDto | undefined;
        let categoryName: string;
        let firstSubcategory: string;
        let secondSubcategory: string;
        let firstUrl: string;
        let secondUrl: string;

        await test.step('Given I navigate to the home page', async () => {
            await homePage.goto();
            await homePage.waitForPageLoad();
        });

        await test.step('And I find a category with multiple subcategories', async () => {
            categories = await homePage.categoryFilter.getCategories();
            categoryWithSubcategories = categories.find(cat => cat.subcategories.length > 1);

            if (!categoryWithSubcategories || categoryWithSubcategories.subcategories.length < 2) {
                test.skip();
                return;
            }

            categoryName = categoryWithSubcategories.name;
            firstSubcategory = categoryWithSubcategories.subcategories[0].name;
            secondSubcategory = categoryWithSubcategories.subcategories[1].name;
            console.log(`\nNavigating through subcategories of "${categoryName}":`);
        });

        await test.step('When I click the first subcategory', async () => {
            console.log(`  1. Clicking "${firstSubcategory}"`);
            await homePage.categoryFilter.clickCategory(categoryName, firstSubcategory);
            await homePage.pageInstance.waitForLoadState('networkidle');
        });

        await test.step('Then I should be navigated to the first subcategory page', () => {
            firstUrl = homePage.pageInstance.url();
            console.log(`     URL: ${firstUrl}`);
            expect(firstUrl).toContain('category_products');
        });

        await test.step('When I navigate back and click the second subcategory', async () => {
            await homePage.pageInstance.goBack();
            await homePage.waitForPageLoad();
            console.log(`  2. Clicking "${secondSubcategory}"`);
            await homePage.categoryFilter.clickCategory(categoryName, secondSubcategory);
            await homePage.pageInstance.waitForLoadState('networkidle');
        });

        await test.step('Then I should be navigated to a different subcategory page', () => {
            secondUrl = homePage.pageInstance.url();
            console.log(`     URL: ${secondUrl}`);
            expect(secondUrl).toContain('category_products');
            expect(firstUrl).not.toBe(secondUrl);
        });
    });
});
