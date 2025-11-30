import { test, expect } from '@playwright/test';

test.describe('Backup and Restore', () => {
    test('should export backup successfully', async ({ page }) => {
        await page.goto('/zh-TW/backup');
        // await expect(page).toHaveTitle(/備份還原/);

        // Mock the download
        const downloadPromise = page.waitForEvent('download');

        // Ensure we are on the manual backup tab
        await page.getByRole('tab', { name: /手動|Manual/i }).click();

        // Click export button
        const exportBtn = page.getByRole('button').filter({ hasText: /匯出 JSON|Export JSON/i });
        await expect(exportBtn).toBeVisible();
        await exportBtn.click();

        const download = await downloadPromise;
        expect(download.suggestedFilename()).toContain('watchedit-backup');
    });

    // Note: Testing restore is trickier as it involves file upload and potentially wiping data.
    // We might want to skip it for now or implement a safe version.
});
