import { test, expect } from "@playwright/test";

test.describe("首頁流程", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test("顯示在地化標題與主要操作", async ({ page }) => {
    await page.goto("/zh-TW");

    await expect(page).toHaveURL(/\/zh-TW$/);
    await expect(
      page.getByRole("button", { name: "新增作品" })
    ).toBeVisible();
    await expect(
      page.getByPlaceholder("搜尋作品標題、評論、備註或標籤...")
    ).toBeVisible();
  });

  test("可由首頁導向設定頁", async ({ page }) => {
    await page.goto("/zh-TW");

    await page.getByRole("button", { name: "設定" }).click();
    await expect(page).toHaveURL(/\/zh-TW\/settings/);
    await expect(
      page.getByRole("heading", { name: /設定/i })
    ).toBeVisible();
  });
});

