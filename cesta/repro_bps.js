import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false }); // Headless false for visibility
  const page = await browser.newPage();
  
  console.log('Navigating to app...');
  await page.goto('http://localhost:5173/pesquisa-precos', { waitUntil: 'networkidle' });

  // 1. Type "TEZEPELUMABE"
  console.log('Searching for TEZEPELUMABE...');
  await page.getByPlaceholder('Busque por item ou serviço...').fill('TEZEPELUMABE');
  await page.waitForTimeout(2000); // Wait for suggestions

  // 2. Select the first PDM item
  console.log('Selecting item...');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  
  // Wait for results
  await page.waitForTimeout(2000);
  
  // 3. Find the table row and click "Buscar Preços"
  // Assuming the first row has the button
  console.log('Clicking "Buscar Preços"...');
  
  // Activate BPS Toggle first
  const bpsToggle = page.locator('#bps-toggle');
  if (await bpsToggle.isVisible()) {
      console.log('Activating BPS Toggle...');
      await bpsToggle.check();
  } else {
      console.log('BPS Toggle not found implies we are not in item view or incorrect selector');
  }

  // Find "Buscar Preços" buttons
  const buttons = page.getByRole('button', { name: 'Buscar Preços' });
  if (await buttons.count() > 0) {
      await buttons.first().click();
      console.log('Clicked Search Price.');
  } else {
      console.log('Button "Buscar Preços" not found.');
  }

  // 4. Check for Error Toast
  console.log('Checking for validation error...');
  const toast = page.locator('text=Por favor, preencha as datas');
  try {
      await toast.waitFor({ state: 'visible', timeout: 5000 });
      console.log('TEST PASSED: Error toast visible (Validation persists).');
  } catch (e) {
      console.log('TEST FAILED: Error toast NOT visible (Validation fixed? Or different error).');
  }

  await browser.close();
})();
