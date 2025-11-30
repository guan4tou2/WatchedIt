import { test, expect } from '@playwright/test';

test.describe('Work Management', () => {
    test('should add a new work successfully', async ({ page }) => {
        // Navigate to home page with locale
        await page.goto('/zh-TW');

        // Click on "New Work" button (it matches home.spec.ts)
        await page.getByRole('button', { name: /新增作品|New Work/i }).click();

        // Verify we are on the new work page
        await expect(page).toHaveURL(/.*\/works\/new/);

        // Fill in the form
        await page.getByLabel(/標題|Title/i).fill('E2E Test Anime');

        // Select type
        // Assuming the label is "作品類型" or "Type"
        await page.getByLabel(/作品類型|Type/i).selectOption({ label: '動畫' });

        // Select status
        // Assuming the label is "觀看狀態" or "Status"
        await page.getByLabel(/觀看狀態|Status/i).selectOption({ label: '進行中' });

        // Fill in year
        // Assuming the label is "發行年份" or "Year"
        await page.getByLabel(/發行年份|Year/i).fill('2024');

        // Submit the form
        await page.getByRole('button').filter({ hasText: /創建|Create|Save|新增/i }).click();

        // Verify redirection to home or detail page
        // And verify success message if applicable
        // It might redirect to the detail page of the new work
        // Let's just check if the title is visible on the page we land on
        await expect(page.getByText('E2E Test Anime')).toBeVisible();
    });
});
