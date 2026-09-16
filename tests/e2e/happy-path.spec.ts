import { test, expect } from '@playwright/test';

test.describe('Happy Path: Complete Game Flow', () => {
  test('Player can join team and play through game', async ({ page }) => {
    // 1. Navigate to home
    await page.goto('/');
    await expect(page).toHaveTitle(/El Traïdor/i);

    // 2. Enter team code (simulated QR scan)
    // NOTE: This assumes there's a player login page at /e/[code]
    // Placeholder code - adjust to your actual setup
    await page.goto('/e/TEST001');

    // 3. Verify player hub loads
    await expect(page.locator('text=Quadern')).toBeVisible({ timeout: 5000 });

    // 4. Play a game (test first game submission)
    const gameButton = page.locator('button:has-text("Estació 1")').first();
    if (await gameButton.isVisible()) {
      await gameButton.click();

      // Wait for game to load
      await page.waitForNavigation();

      // Fill game answer (assuming text input - adjust as needed)
      const answerInput = page.locator('input[type="text"]').first();
      if (await answerInput.isVisible()) {
        await answerInput.fill('resposta correcta');

        // Submit
        const submitButton = page.locator('button:has-text("Enviar")', {
          hasNot: page.locator('span:has-text("Desactivat")')
        });
        await submitButton.click();

        // Verify success feedback
        await expect(page.locator('text=Correcte')).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('Master can login and view dashboard', async ({ page }) => {
    // 1. Navigate to master login
    await page.goto('/master');

    // 2. Verify PIN input visible
    const pinInput = page.locator('input[type="password"]');
    await expect(pinInput).toBeVisible();

    // 3. Enter correct PIN (from env or config)
    const correctPin = process.env.MASTER_PIN || '1234';
    await pinInput.fill(correctPin);

    // 4. Submit
    await page.locator('button:has-text("Accedir")').click();

    // 5. Verify dashboard loads
    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 5000 });

    // 6. Verify teams listed
    await expect(page.locator('table, div:has-text("Equip")')).toBeVisible();
  });

  test('Accessibility: Page is keyboard navigable', async ({ page }) => {
    await page.goto('/');

    // Tab to first interactive element
    await page.keyboard.press('Tab');

    // Verify focus is on an interactive element
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      return el?.tagName.toLowerCase();
    });

    expect(['button', 'a', 'input', 'select']).toContain(focusedElement);
  });

  test('Performance: Page loads within 3 seconds', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/', { waitUntil: 'networkidle' });

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });
});
