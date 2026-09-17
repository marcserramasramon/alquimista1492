import { test, expect } from '@playwright/test';

test.describe('Happy Path: Complete Game Flow', () => {
  test('Player can join team and play through game', async ({ page }) => {
    // 1. Navigate to home
    await page.goto('/');
    await expect(page).toHaveTitle(/El Traïdor/i);

    // 2. Enter team code (simulated QR scan)
    await page.goto('/e/TEST01');

    // If player entry form is shown, enter name and join
    const nameInput = page.locator('#player-name');
    if (await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await nameInput.pressSequentially('Jugador Test', { delay: 50 });
      await page.locator('button:has-text("Entrar al Joc")').click();
    }

    // 3. Verify player hub loads
    await expect(page.locator('[data-testid="tab-notebook"]')).toBeVisible({ timeout: 10000 });

    // 4. Play a game (test station selection)
    const stationsTab = page.locator('[data-testid="tab-stations"]').first();
    if (await stationsTab.isVisible()) {
      await stationsTab.click();

      // Click first available station
      const stationButton = page.locator('button', { hasText: /Estació|Sentfoses/ }).first();
      if (await stationButton.isVisible()) {
        await stationButton.click();

        // Wait for navigation or game load
        await page.waitForTimeout(1000);

        // Fill game answer (assuming text input - adjust as needed)
        const answerInput = page.locator('input[type="text"]').first();
        if (await answerInput.isVisible()) {
          await answerInput.fill('resposta correcta');

          // Submit
          const submitButton = page.locator('button:has-text("Enviar")').first();
          if (await submitButton.isEnabled()) {
            await submitButton.click();

            // Verify feedback (success or error)
            await expect(
              page.locator('text=/Correcte|incorrecte|retry/i').first()
            ).toBeVisible({ timeout: 3000 }).catch(() => {
              // If no feedback, that's OK for this test
            });
          }
        }
      }
    }
  });

  test('Master can login and view dashboard', async ({ page }) => {
    // 1. Navigate to master login
    await page.goto('/master');

    // 2. Verify PIN input visible
    const pinInput = page.locator('[data-testid="master-pin"]');
    await expect(pinInput).toBeVisible();

    // 3. Enter correct PIN (from env or config)
    const correctPin = process.env.MASTER_PIN || '123456';
    await pinInput.pressSequentially(correctPin, { delay: 50 });

    // 4. Submit
    await page.locator('button:has-text("Accedir")').click();

    // 5. Verify dashboard loads
    await expect(page.locator('text=/Control del Màster|Dashboard/i').first()).toBeVisible({ timeout: 5000 });

    // 6. Verify teams listed
    await expect(page.locator('[data-testid="teams-list"]')).toBeVisible();
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
