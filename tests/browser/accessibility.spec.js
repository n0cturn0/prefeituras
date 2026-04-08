import { test, expect } from '@playwright/test';

test.describe('Accessibility Bar', () => {
    test.beforeEach(async ({ page }) => {
        // Go to the home page (or any public page where the header is visible)
        await page.goto('/prefeitura');
    });

    test('should toggle high contrast mode', async ({ page }) => {
        // Check initial state (should not have high-contrast class)
        await expect(page.locator('html')).not.toHaveClass(/high-contrast/);

        // Click the High Contrast button
        await page.getByRole('button', { name: 'Alto Contraste' }).click();

        // Check if the class was added
        await expect(page.locator('html')).toHaveClass(/high-contrast/);

        // Click again to disable
        await page.getByRole('button', { name: 'Alto Contraste' }).click();

        // Check if the class was removed
        await expect(page.locator('html')).not.toHaveClass(/high-contrast/);
    });

    test('should resize font', async ({ page }) => {
        // Get initial font size of the html element
        const html = page.locator('html');
        // We need to wait for any initial styles to apply
        await expect(html).toHaveCSS('font-size', /.*/); 
        
        // Initial check - usually 100% or 16px. 
        // Note: computed style returns pixel values (e.g. "16px")
        
        // Click A+ (Aumentar Fonte)
        await page.getByRole('button', { name: 'Aumentar Fonte' }).click();
        
        // Check if style attribute on html element changed (our component sets inline style)
        await expect(html).toHaveAttribute('style', /font-size: 110%/);

        // Click A+ again
        await page.getByRole('button', { name: 'Aumentar Fonte' }).click();
        await expect(html).toHaveAttribute('style', /font-size: 120%/);

        // Click A- (Diminuir Fonte) multiple times to go below 100%
        await page.getByRole('button', { name: 'Diminuir Fonte' }).click(); // 110%
        await page.getByRole('button', { name: 'Diminuir Fonte' }).click(); // 100%
        await page.getByRole('button', { name: 'Diminuir Fonte' }).click(); // 90%
        
        await expect(html).toHaveAttribute('style', /font-size: 90%/);

        // Click A (Tamanho Normal)
        await page.getByRole('button', { name: 'Tamanho Normal' }).click();
        await expect(html).toHaveAttribute('style', /font-size: 100%/);
    });
});
