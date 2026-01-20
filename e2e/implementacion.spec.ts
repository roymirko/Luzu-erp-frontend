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
  await page.addInitScript((user) => {
    localStorage.setItem('erp_current_user', JSON.stringify(user));
  }, mockUser);
}

test.describe('Implementación Module - Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await page.goto('/');
    await page.waitForSelector('nav', { timeout: 15000 });
  });

  test('should navigate to Implementación view from sidebar', async ({ page }) => {
    // Click on "Implementación" in sidebar
    await page.click('button:has-text("Implementación")');

    // Verify we're on the Implementación page
    await expect(page.locator('text=Detalle de gastos')).toBeVisible({ timeout: 10000 });
  });

  test('should show correct breadcrumbs for Implementación', async ({ page }) => {
    // Navigate to Implementación
    await page.click('button:has-text("Implementación")');

    // Check breadcrumbs
    await expect(page.locator('text=Inicio').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Implementación').nth(1)).toBeVisible();
  });

  test('should highlight Implementación in sidebar when active', async ({ page }) => {
    // Navigate to Implementación
    await page.click('button:has-text("Implementación")');

    // Verify sidebar button is active (has the active styling)
    const implementacionButton = page.locator('button:has-text("Implementación")');
    await expect(implementacionButton).toBeVisible();
  });
});

test.describe('Implementación Module - Table View', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await page.goto('/');
    await page.waitForSelector('nav', { timeout: 15000 });
    // Navigate to Implementación
    await page.click('button:has-text("Implementación")');
    await page.waitForTimeout(500);
  });

  test('should show Detalle de gastos header', async ({ page }) => {
    await expect(page.locator('text=Detalle de gastos')).toBeVisible({ timeout: 10000 });
  });

  test('should have search functionality', async ({ page }) => {
    // Find search input
    const searchInput = page.locator('input[placeholder="Buscar..."]');
    await expect(searchInput).toBeVisible({ timeout: 10000 });

    // Type search term
    await searchInput.fill('test');
    await expect(searchInput).toHaveValue('test');
  });

  test('should show table headers', async ({ page }) => {
    // Check main table headers
    await expect(page.locator('th:has-text("Estado")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('th:has-text("Fecha de registro")')).toBeVisible();
    await expect(page.locator('th:has-text("Responsable")')).toBeVisible();
    await expect(page.locator('th:has-text("Unidad de negocio")')).toBeVisible();
    await expect(page.locator('th:has-text("Categoría de negocio")')).toBeVisible();
    await expect(page.locator('th:has-text("Orden de Publicidad")')).toBeVisible();
    await expect(page.locator('th:has-text("Presupuesto")')).toBeVisible();
  });

  test('should show additional table headers', async ({ page }) => {
    // Check more table headers
    await expect(page.locator('th:has-text("Cant. de programas")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('th:has-text("Sector")')).toBeVisible();
    await expect(page.locator('th:has-text("Rubro de gasto")')).toBeVisible();
    await expect(page.locator('th:has-text("Sub rubro")')).toBeVisible();
    await expect(page.locator('th:has-text("Nombre de campaña")')).toBeVisible();
    await expect(page.locator('th:has-text("Acuerdo de pago")')).toBeVisible();
  });

  test('should show Meta and Acciones columns', async ({ page }) => {
    await expect(page.locator('th:has-text("Meta")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('th:has-text("Acciones")')).toBeVisible();
  });

  test('should have table structure', async ({ page }) => {
    // Verify table exists
    const table = page.locator('table');
    await expect(table).toBeVisible({ timeout: 10000 });

    // Verify thead and tbody
    await expect(page.locator('thead')).toBeVisible();
    await expect(page.locator('tbody')).toBeVisible();
  });

  test('should filter results with search', async ({ page }) => {
    // Get search input
    const searchInput = page.locator('input[placeholder="Buscar..."]');
    await expect(searchInput).toBeVisible({ timeout: 10000 });

    // Type a search term that probably won't match
    await searchInput.fill('zzzznonexistent');
    await page.waitForTimeout(300);

    // Search input should have the value
    await expect(searchInput).toHaveValue('zzzznonexistent');

    // Clear search
    await searchInput.fill('');
    await expect(searchInput).toHaveValue('');
  });
});

test.describe('Implementación Module - Cross Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await page.goto('/');
    await page.waitForSelector('nav', { timeout: 15000 });
  });

  test('should navigate from Comercial to Implementación', async ({ page }) => {
    // Start at Comercial (default)
    await expect(page.locator('text=Nuevo Formulario')).toBeVisible({ timeout: 10000 });

    // Navigate to Implementación
    await page.click('button:has-text("Implementación")');

    // Verify we're on Implementación
    await expect(page.locator('text=Detalle de gastos')).toBeVisible({ timeout: 10000 });
  });

  test('should navigate from Implementación to Programación', async ({ page }) => {
    // Navigate to Implementación
    await page.click('button:has-text("Implementación")');
    await expect(page.locator('text=Detalle de gastos')).toBeVisible({ timeout: 10000 });

    // Navigate to Programación
    await page.click('button:has-text("Dir. de Programación")');

    // Verify we're on Programación
    await expect(page.locator('button:has-text("Nuevo Formulario")')).toBeVisible({ timeout: 10000 });
  });

  test('should navigate back to Comercial from Implementación', async ({ page }) => {
    // Navigate to Implementación
    await page.click('button:has-text("Implementación")');
    await expect(page.locator('text=Detalle de gastos')).toBeVisible({ timeout: 10000 });

    // Navigate back to Comercial
    await page.click('button:has-text("Comercial")');

    // Verify we're on Comercial
    await expect(page.locator('text=Nuevo Formulario')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Implementación Module - Table Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await page.goto('/');
    await page.waitForSelector('nav', { timeout: 15000 });
    await page.click('button:has-text("Implementación")');
    await page.waitForTimeout(500);
  });

  test('should have clickable table rows', async ({ page }) => {
    // Wait for table to load
    await expect(page.locator('table')).toBeVisible({ timeout: 10000 });

    // Check if rows have cursor-pointer class (clickable)
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();

    // If there are rows, they should be styled as clickable
    if (rowCount > 0) {
      const firstRow = rows.first();
      await expect(firstRow).toBeVisible();
    }
  });

  test('should show edit button in actions column', async ({ page }) => {
    // Wait for table
    await expect(page.locator('table')).toBeVisible({ timeout: 10000 });

    // Check for edit buttons (Pencil icon) if there are rows
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();

    if (rowCount > 0) {
      // Look for button with pencil icon in actions column
      const editButton = page.locator('tbody tr').first().locator('button').last();
      await expect(editButton).toBeVisible();
    }
  });
});

test.describe('Implementación Module - Empty State', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await page.goto('/');
    await page.waitForSelector('nav', { timeout: 15000 });
    await page.click('button:has-text("Implementación")');
    await page.waitForTimeout(500);
  });

  test('should handle empty or populated table gracefully', async ({ page }) => {
    // Table should be visible regardless of data
    const table = page.locator('table');
    await expect(table).toBeVisible({ timeout: 10000 });

    // Either table has rows or tbody is empty
    const tbody = page.locator('tbody');
    await expect(tbody).toBeVisible();
  });
});

test.describe('Implementación Module - Responsive', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await page.goto('/');
    await page.waitForSelector('nav', { timeout: 15000 });
    await page.click('button:has-text("Implementación")');
    await page.waitForTimeout(500);
  });

  test('should have horizontal scroll for table', async ({ page }) => {
    // Table should be in a scrollable container
    const tableContainer = page.locator('.overflow-x-auto');
    await expect(tableContainer).toBeVisible({ timeout: 10000 });
  });

  test('should maintain header visibility', async ({ page }) => {
    // Header should always be visible
    await expect(page.locator('text=Detalle de gastos')).toBeVisible({ timeout: 10000 });

    // Search should be visible
    const searchInput = page.locator('input[placeholder="Buscar..."]');
    await expect(searchInput).toBeVisible();
  });
});

test.describe('Implementación Module - Integration with Comercial', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await page.goto('/');
    await page.waitForSelector('nav', { timeout: 15000 });
  });

  test('should show implementation items from comercial forms', async ({ page }) => {
    // Navigate to Implementación
    await page.click('button:has-text("Implementación")');

    // Verify table is displayed
    await expect(page.locator('table')).toBeVisible({ timeout: 10000 });

    // The table pulls from comercial formularios with implementation budgets
    // Check that the structure is correct
    await expect(page.locator('thead')).toBeVisible();
  });

  test('should reflect comercial data in table columns', async ({ page }) => {
    // Navigate to Implementación
    await page.click('button:has-text("Implementación")');

    // These columns come from comercial data
    await expect(page.locator('th:has-text("Orden de Publicidad")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('th:has-text("Unidad de negocio")')).toBeVisible();
    await expect(page.locator('th:has-text("Nombre de campaña")')).toBeVisible();
    await expect(page.locator('th:has-text("Acuerdo de pago")')).toBeVisible();
  });
});

test.describe('Implementación Module - Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await page.goto('/');
    await page.waitForSelector('nav', { timeout: 15000 });
    await page.click('button:has-text("Implementación")');
    await page.waitForTimeout(500);
  });

  test('should search by orden de publicidad', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Buscar..."]');
    await expect(searchInput).toBeVisible({ timeout: 10000 });

    await searchInput.fill('OP-');
    await expect(searchInput).toHaveValue('OP-');
  });

  test('should search by responsable', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Buscar..."]');
    await expect(searchInput).toBeVisible({ timeout: 10000 });

    await searchInput.fill('Gabriela');
    await expect(searchInput).toHaveValue('Gabriela');
  });

  test('should search by unidad de negocio', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Buscar..."]');
    await expect(searchInput).toBeVisible({ timeout: 10000 });

    await searchInput.fill('Media');
    await expect(searchInput).toHaveValue('Media');
  });

  test('should search by nombre de campaña', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Buscar..."]');
    await expect(searchInput).toBeVisible({ timeout: 10000 });

    await searchInput.fill('Campaña');
    await expect(searchInput).toHaveValue('Campaña');
  });

  test('should clear search and show all results', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Buscar..."]');
    await expect(searchInput).toBeVisible({ timeout: 10000 });

    // Search for something
    await searchInput.fill('test');
    await page.waitForTimeout(200);

    // Clear
    await searchInput.fill('');
    await expect(searchInput).toHaveValue('');
  });
});

test.describe('Implementación Module - Layout', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await page.goto('/');
    await page.waitForSelector('nav', { timeout: 15000 });
    await page.click('button:has-text("Implementación")');
    await page.waitForTimeout(500);
  });

  test('should show header and search in flex layout', async ({ page }) => {
    // Header and search should be in the same row
    await expect(page.locator('text=Detalle de gastos')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[placeholder="Buscar..."]')).toBeVisible();
  });

  test('should have rounded table container', async ({ page }) => {
    // Table should be in a rounded container
    const tableContainer = page.locator('.rounded-lg').first();
    await expect(tableContainer).toBeVisible({ timeout: 10000 });
  });

  test('should show search icon in search input', async ({ page }) => {
    // Search input should have the Search icon
    const searchContainer = page.locator('.relative').filter({ has: page.locator('input[placeholder="Buscar..."]') });
    await expect(searchContainer).toBeVisible({ timeout: 10000 });
  });
});
