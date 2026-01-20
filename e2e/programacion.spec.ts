import { test, expect, Page } from '@playwright/test';

// Mock user data to bypass authentication
const mockUser = {
  id: 'test-user-id',
  email: 'test@luzutv.com.ar',
  firstName: 'Test',
  lastName: 'User',
  active: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'system',
  metadata: { position: 'Tester' }
};

async function setupAuth(page: Page) {
  // Set up localStorage before navigating to bypass login
  // The app uses 'erp_current_user' as the key
  await page.addInitScript((user) => {
    localStorage.setItem('erp_current_user', JSON.stringify(user));
  }, mockUser);
}

test.describe('Programación Module', () => {
  test.beforeEach(async ({ page }) => {
    // Setup auth before navigation
    await setupAuth(page);

    // Navigate to the app
    await page.goto('/');

    // Wait for the main app to load (should bypass login now)
    await page.waitForSelector('nav', { timeout: 15000 });
  });

  test('should navigate to Programación view', async ({ page }) => {
    // Click on "Dir. de Programación" in sidebar
    await page.click('button:has-text("Dir. de Programación")');

    // Verify we're on the Programación page
    await expect(page.locator('text=Detalle de gastos')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button:has-text("Nuevo Formulario")')).toBeVisible();
  });

  test('should open new Programación form', async ({ page }) => {
    // Navigate to Programación
    await page.click('button:has-text("Dir. de Programación")');
    await page.waitForTimeout(500);

    // Click "Nuevo Formulario" button
    await page.click('button:has-text("Nuevo Formulario")');

    // Verify form is displayed
    await expect(page.locator('h1:has-text("Cargar Datos")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Unidad de Negocio')).toBeVisible();
    await expect(page.locator('text=Rubro del gasto')).toBeVisible();
  });

  test('should show validation errors on empty form submit', async ({ page }) => {
    // Navigate to Programación
    await page.click('button:has-text("Dir. de Programación")');
    await page.waitForTimeout(500);

    // Click "Nuevo Formulario" button
    await page.click('button:has-text("Nuevo Formulario")');
    await page.waitForTimeout(500);

    // Click save without filling required fields
    await page.click('button:has-text("Guardar")');

    // Verify validation error toast appears
    await expect(page.locator('text=Por favor, complete todos los campos requeridos')).toBeVisible({ timeout: 5000 });
  });

  test('should show table with gastos list', async ({ page }) => {
    // Navigate to Programación
    await page.click('button:has-text("Dir. de Programación")');

    // Wait for table to load
    await page.waitForTimeout(1000);

    // Verify table headers are present
    await expect(page.locator('th:has-text("Estado")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('th:has-text("Mes gestión")')).toBeVisible();
    await expect(page.locator('th:has-text("Fecha")')).toBeVisible();
    await expect(page.locator('th:has-text("Responsable")')).toBeVisible();
    await expect(page.locator('th:has-text("Unidad de negocio")')).toBeVisible();
    await expect(page.locator('th:has-text("Programa")')).toBeVisible();
    await expect(page.locator('th:has-text("Importe")')).toBeVisible();
  });

  test('should search in gastos table', async ({ page }) => {
    // Navigate to Programación
    await page.click('button:has-text("Dir. de Programación")');
    await page.waitForTimeout(500);

    // Find search input and type
    const searchInput = page.locator('input[placeholder="Buscar..."]');
    await expect(searchInput).toBeVisible({ timeout: 10000 });

    // Type search term
    await searchInput.fill('test');

    // Verify search is active (input has value)
    await expect(searchInput).toHaveValue('test');
  });

  test('should cancel form and return to list', async ({ page }) => {
    // Navigate to Programación
    await page.click('button:has-text("Dir. de Programación")');
    await page.waitForTimeout(500);

    // Click "Nuevo Formulario" button
    await page.click('button:has-text("Nuevo Formulario")');

    // Verify we're on the form
    await expect(page.locator('h1:has-text("Cargar Datos")')).toBeVisible({ timeout: 10000 });

    // Click cancel button
    await page.click('button:has-text("Cancelar")');

    // Verify we're back to the list
    await expect(page.locator('text=Detalle de gastos')).toBeVisible({ timeout: 10000 });
  });

  test('should add multiple gasto items', async ({ page }) => {
    // Navigate to Programación
    await page.click('button:has-text("Dir. de Programación")');
    await page.waitForTimeout(500);

    // Click "Nuevo Formulario" button
    await page.click('button:has-text("Nuevo Formulario")');
    await page.waitForTimeout(500);

    // Verify first gasto item is present
    await expect(page.locator('h4:has-text("Gasto #1")')).toBeVisible({ timeout: 10000 });

    // Click "Agregar importe" button
    await page.click('button:has-text("Agregar importe")');

    // Verify second gasto item appears
    await expect(page.locator('h4:has-text("Gasto #2")')).toBeVisible({ timeout: 5000 });
  });

  test('should display total in resumen section', async ({ page }) => {
    // Navigate to Programación
    await page.click('button:has-text("Dir. de Programación")');
    await page.waitForTimeout(500);

    // Click "Nuevo Formulario" button
    await page.click('button:has-text("Nuevo Formulario")');
    await page.waitForTimeout(500);

    // Verify Resumen section exists
    await expect(page.locator('h2:has-text("Resumen"), div:has-text("Resumen")').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Total del gasto')).toBeVisible();

    // Fill in a neto value
    const netoInput = page.locator('input[placeholder="$0"]').first();
    await netoInput.fill('10000');

    // Wait for total to update
    await page.waitForTimeout(500);

    // Verify total updates (should show ARS format: $ 10.000)
    await expect(page.locator('text=/\\$\\s*10[.,]000/')).toBeVisible({ timeout: 2000 });
  });

  test('should fill form fields', async ({ page }) => {
    // Navigate to Programación
    await page.click('button:has-text("Dir. de Programación")');
    await page.waitForTimeout(500);

    // Click "Nuevo Formulario" button
    await page.click('button:has-text("Nuevo Formulario")');
    await page.waitForTimeout(500);

    // Fill Nombre de Campaña
    const campaignInput = page.locator('input[placeholder="Buscar"]');
    await campaignInput.fill('Test Campaign');
    await expect(campaignInput).toHaveValue('Test Campaign');

    // Fill Detalle/campaña
    const detalleTextarea = page.locator('textarea[placeholder="Concepto del gasto"]');
    await detalleTextarea.fill('Test campaign description');
    await expect(detalleTextarea).toHaveValue('Test campaign description');

    // Fill Observaciones
    const observacionesTextarea = page.locator('textarea[placeholder="Escribe aquí"]').first();
    if (await observacionesTextarea.isVisible()) {
      await observacionesTextarea.fill('Test observations');
      await expect(observacionesTextarea).toHaveValue('Test observations');
    }
  });
});

test.describe('Programación Breadcrumbs', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await page.goto('/');
    await page.waitForSelector('nav', { timeout: 15000 });
  });

  test('should show correct breadcrumbs for Programación', async ({ page }) => {
    // Navigate to Programación
    await page.click('button:has-text("Dir. de Programación")');

    // Check breadcrumbs - use more specific selector to avoid matching sidebar
    await expect(page.locator('text=Inicio').first()).toBeVisible();
    // The breadcrumb area contains the path, check it exists
    await expect(page.locator('text=Dir. de Programación').nth(1)).toBeVisible();
  });

  test('should show correct breadcrumbs for new form', async ({ page }) => {
    // Navigate to Programación
    await page.click('button:has-text("Dir. de Programación")');
    await page.waitForTimeout(500);

    // Click "Nuevo Formulario"
    await page.click('button:has-text("Nuevo Formulario")');

    // Check breadcrumbs include "Nuevo Gasto"
    await expect(page.locator('text=Nuevo Gasto')).toBeVisible({ timeout: 10000 });
  });

  test('should navigate back via breadcrumb', async ({ page }) => {
    // Navigate to Programación
    await page.click('button:has-text("Dir. de Programación")');
    await page.waitForTimeout(500);

    // Click "Nuevo Formulario"
    await page.click('button:has-text("Nuevo Formulario")');
    await page.waitForTimeout(500);

    // Verify on form page
    await expect(page.locator('h1:has-text("Cargar Datos")')).toBeVisible({ timeout: 10000 });

    // Click on breadcrumb to go back
    const breadcrumb = page.locator('span:has-text("Dir. de Programación")').last();
    await breadcrumb.click();

    // Verify we're back on list page
    await expect(page.locator('text=Detalle de gastos')).toBeVisible({ timeout: 10000 });
  });
});
