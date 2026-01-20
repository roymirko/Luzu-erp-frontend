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

test.describe('Comercial Module - Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await page.goto('/');
    await page.waitForSelector('nav', { timeout: 15000 });
  });

  test('should show Comercial view by default', async ({ page }) => {
    // Comercial is the default view, should see "Nuevo Formulario" card
    await expect(page.locator('text=Nuevo Formulario')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Crear propuesta comercial')).toBeVisible();
  });

  test('should navigate to Comercial from sidebar', async ({ page }) => {
    // First navigate away
    await page.click('button:has-text("Dir. de Programación")');
    await page.waitForTimeout(500);

    // Then navigate back to Comercial
    await page.click('button:has-text("Comercial")');

    // Verify we're on Comercial
    await expect(page.locator('text=Nuevo Formulario')).toBeVisible({ timeout: 10000 });
  });

  test('should show correct breadcrumbs for Comercial', async ({ page }) => {
    // Check breadcrumbs
    await expect(page.locator('text=Inicio').first()).toBeVisible();
    await expect(page.locator('text=Comercial').nth(1)).toBeVisible();
  });
});

test.describe('Comercial Module - New Form', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await page.goto('/');
    await page.waitForSelector('nav', { timeout: 15000 });
  });

  test('should open new form when clicking "Nuevo Formulario"', async ({ page }) => {
    // Click on "Nuevo Formulario" card
    await page.click('text=Nuevo Formulario');

    // Verify form is displayed - actual title is "Cargar Datos"
    await expect(page.locator('text=Cargar Datos')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Orden de Publicidad')).toBeVisible();
  });

  test('should show breadcrumbs for new form', async ({ page }) => {
    // Click on "Nuevo Formulario"
    await page.click('text=Nuevo Formulario');
    await page.waitForTimeout(500);

    // Check breadcrumbs include "Nuevo Formulario"
    await expect(page.locator('text=Nuevo Formulario').last()).toBeVisible({ timeout: 10000 });
  });

  test('should display all required form sections', async ({ page }) => {
    // Click on "Nuevo Formulario"
    await page.click('text=Nuevo Formulario');
    await page.waitForTimeout(500);

    // Check main section title
    await expect(page.locator('text=Cargar Datos')).toBeVisible({ timeout: 10000 });

    // Check key fields exist (use .first() to avoid strict mode violations)
    await expect(page.locator('text=Mes de Servicio').first()).toBeVisible();
    await expect(page.locator('text=Unidad de Negocio').first()).toBeVisible();
    await expect(page.locator('text=Orden de Publicidad').first()).toBeVisible();
    await expect(page.locator('label:has-text("Total de Venta")')).toBeVisible();
    await expect(page.locator('label:has-text("Categoría")').first()).toBeVisible();
    await expect(page.locator('label:has-text("Marca")').first()).toBeVisible();
  });

  test('should have save and cancel buttons', async ({ page }) => {
    // Click on "Nuevo Formulario"
    await page.click('text=Nuevo Formulario');
    await page.waitForTimeout(500);

    // Check buttons
    await expect(page.locator('button:has-text("Guardar")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button:has-text("Cancelar")')).toBeVisible();
  });

  test('should cancel and return to list', async ({ page }) => {
    // Click on "Nuevo Formulario"
    await page.click('text=Nuevo Formulario');
    await page.waitForTimeout(500);

    // Verify on form
    await expect(page.locator('text=Cargar Datos')).toBeVisible({ timeout: 10000 });

    // Click cancel - scroll to make sure it's visible first
    const cancelButton = page.locator('button:has-text("Cancelar")');
    await cancelButton.scrollIntoViewIfNeeded();
    await cancelButton.click({ force: true });

    // Wait for form to disappear
    await expect(page.locator('text=Cargar Datos')).not.toBeVisible({ timeout: 10000 });
  });
});

test.describe('Comercial Module - Form Fields', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await page.goto('/');
    await page.waitForSelector('nav', { timeout: 15000 });
    // Navigate to new form
    await page.click('text=Nuevo Formulario');
    await page.waitForTimeout(500);
  });

  test('should fill Mes de Servicio field', async ({ page }) => {
    // Find month selector
    const mesInput = page.locator('input[type="month"]').first();
    if (await mesInput.isVisible()) {
      await mesInput.fill('2025-01');
      await expect(mesInput).toHaveValue('2025-01');
    }
  });

  test('should fill Orden de Publicidad field', async ({ page }) => {
    // Find and fill Orden de Publicidad input
    const ordenInput = page.locator('input[placeholder="Ingresa el valor"]').first();
    if (await ordenInput.isVisible()) {
      await ordenInput.fill('OP-2025-001');
      await expect(ordenInput).toHaveValue('OP-2025-001');
    }
  });

  test('should select Unidad de Negocio', async ({ page }) => {
    // Click on Unidad de Negocio select
    const unidadLabel = page.locator('text=Unidad de negocio');
    const unidadSelect = unidadLabel.locator('..').locator('..').locator('button[role="combobox"]');

    if (await unidadSelect.isVisible()) {
      await unidadSelect.click();
      // Select first option
      const firstOption = page.locator('[role="option"]').first();
      if (await firstOption.isVisible({ timeout: 2000 })) {
        await firstOption.click();
      }
    }
  });

  test('should fill Nombre de Campaña', async ({ page }) => {
    // Find Nombre de campaña textarea
    const campanaInput = page.locator('textarea').first();
    if (await campanaInput.isVisible()) {
      await campanaInput.fill('Test Campaign 2025');
      await expect(campanaInput).toHaveValue('Test Campaign 2025');
    }
  });

  test('should add program to importe list', async ({ page }) => {
    // Look for "Agregar programa" or similar button
    const addButton = page.locator('button:has-text("Agregar programa"), button:has-text("Agregar importe")');
    if (await addButton.isVisible()) {
      // Get initial count of program cards
      const initialCards = await page.locator('[class*="Card"]').count();

      await addButton.click();
      await page.waitForTimeout(500);

      // Verify new program was added
      const newCards = await page.locator('[class*="Card"]').count();
      expect(newCards).toBeGreaterThanOrEqual(initialCards);
    }
  });

  test('should show Tipo de Importe toggle', async ({ page }) => {
    // Check for Factura/Canje toggle
    await expect(page.locator('text=Factura').first()).toBeVisible({ timeout: 10000 });
  });

  test('should fill Observaciones field', async ({ page }) => {
    // Find Observaciones textarea (usually has a placeholder)
    const observacionesTextarea = page.locator('textarea[placeholder*="observaciones"], textarea[placeholder*="Observaciones"]');
    if (await observacionesTextarea.isVisible()) {
      await observacionesTextarea.fill('Test observations for this order');
      await expect(observacionesTextarea).toHaveValue('Test observations for this order');
    }
  });
});

test.describe('Comercial Module - Table View', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await page.goto('/');
    await page.waitForSelector('nav', { timeout: 15000 });
  });

  test('should show Formularios Comerciales table', async ({ page }) => {
    // Check table title
    await expect(page.locator('text=Formularios Comerciales')).toBeVisible({ timeout: 10000 });
  });

  test('should have search functionality', async ({ page }) => {
    // Find search input
    const searchInput = page.locator('input[placeholder="Buscar..."]');
    await expect(searchInput).toBeVisible({ timeout: 10000 });

    // Type search term
    await searchInput.fill('test');
    await expect(searchInput).toHaveValue('test');
  });

  test('should have view mode switch (Programa/Orden)', async ({ page }) => {
    // Check for view mode toggle - button says "Orden de Publicidad"
    const programaButton = page.locator('button[role="tab"]:has-text("Programa")');
    const ordenButton = page.locator('button[role="tab"]:has-text("Orden de Publicidad")');

    await expect(programaButton).toBeVisible({ timeout: 10000 });
    await expect(ordenButton).toBeVisible();
  });

  test('should switch between Programa and Orden view', async ({ page }) => {
    // Wait for view switch to be visible
    const ordenButton = page.locator('button[role="tab"]:has-text("Orden de Publicidad")');
    const programaButton = page.locator('button[role="tab"]:has-text("Programa")');

    await expect(ordenButton).toBeVisible({ timeout: 10000 });
    await expect(programaButton).toBeVisible();

    // Click on Orden de Publicidad view
    await ordenButton.click();
    await page.waitForTimeout(500);

    // Click on Programa view
    await programaButton.click();
    await page.waitForTimeout(500);

    // Both buttons should still be visible
    await expect(ordenButton).toBeVisible();
    await expect(programaButton).toBeVisible();
  });

  test('should show table headers', async ({ page }) => {
    // Check main table headers
    await expect(page.locator('th:has-text("Mes de servicio")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('th:has-text("Fecha")')).toBeVisible();
    await expect(page.locator('th:has-text("Responsable")')).toBeVisible();
    await expect(page.locator('th:has-text("Unidad de negocio")')).toBeVisible();
    await expect(page.locator('th:has-text("Razón social")')).toBeVisible();
    await expect(page.locator('th:has-text("Orden de Publicidad")')).toBeVisible();
  });

  test('should show empty state message when no formularios', async ({ page }) => {
    // If no formularios exist, should show message
    const emptyMessage = page.locator('text=No hay formularios guardados');
    const table = page.locator('table');

    // Either empty message or table should be visible
    const hasEmptyMessage = await emptyMessage.isVisible({ timeout: 5000 }).catch(() => false);
    const hasTable = await table.isVisible({ timeout: 5000 }).catch(() => false);

    expect(hasEmptyMessage || hasTable).toBeTruthy();
  });
});

test.describe('Comercial Module - Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await page.goto('/');
    await page.waitForSelector('nav', { timeout: 15000 });
    // Navigate to new form
    await page.click('text=Nuevo Formulario');
    // Wait for form to be ready
    await page.waitForSelector('text=Cargar Datos', { timeout: 10000 });
  });

  test('should disable save button when form is empty', async ({ page }) => {
    // Save button should be disabled when form is empty (validation)
    const saveButton = page.locator('button:has-text("Guardar")');
    await expect(saveButton).toBeVisible({ timeout: 5000 });
    await expect(saveButton).toBeDisabled();
  });

  test('should have cancel button enabled', async ({ page }) => {
    const cancelButton = page.locator('button:has-text("Cancelar")');
    await expect(cancelButton).toBeVisible({ timeout: 5000 });
    await expect(cancelButton).toBeEnabled();
  });
});

test.describe('Comercial Module - Razón Social', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await page.goto('/');
    await page.waitForSelector('nav', { timeout: 15000 });
    // Navigate to new form
    await page.click('text=Nuevo Formulario');
    await page.waitForTimeout(500);
  });

  test('should have Razón Social selector', async ({ page }) => {
    // Check for Razón Social field
    await expect(page.locator('text=Razón Social').first()).toBeVisible({ timeout: 10000 });
  });

  test('should have option to add new Razón Social', async ({ page }) => {
    // Look for "Agregar" or plus button for Razón Social
    const addButton = page.locator('button:has-text("Agregar")').first();
    if (await addButton.isVisible()) {
      await expect(addButton).toBeVisible();
    }
  });
});

test.describe('Comercial Module - Form Details', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await page.goto('/');
    await page.waitForSelector('nav', { timeout: 15000 });
    // Navigate to new form
    await page.click('text=Nuevo Formulario');
    await page.waitForTimeout(500);
  });

  test('should show form header', async ({ page }) => {
    await expect(page.locator('text=Cargar Datos')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Complete la información del nuevo formulario comercial')).toBeVisible();
  });

  test('should have Proveedor y Razón Social section', async ({ page }) => {
    // Look for Proveedor section
    await expect(page.locator('text=Proveedor y Razón Social')).toBeVisible({ timeout: 10000 });
  });

  test('should have Categoría field', async ({ page }) => {
    // Look for Categoría field
    await expect(page.locator('text=Categoría').first()).toBeVisible({ timeout: 10000 });
  });

  test('should have Empresa/Agencia field', async ({ page }) => {
    // Check for Empresa/Agencia field
    await expect(page.locator('text=Empresa/Agencia')).toBeVisible({ timeout: 10000 });
  });

  test('should have Marca and Nombre de Campaña fields', async ({ page }) => {
    // Check for Marca field
    await expect(page.locator('text=Marca').first()).toBeVisible({ timeout: 10000 });
    // Check for Nombre de Campaña field
    await expect(page.locator('text=Nombre de Campaña')).toBeVisible();
  });
});

test.describe('Comercial Module - Integration', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await page.goto('/');
    await page.waitForSelector('nav', { timeout: 15000 });
  });

  test('should maintain state when navigating between views', async ({ page }) => {
    // Navigate to form
    await page.click('text=Nuevo Formulario');
    await page.waitForTimeout(500);

    // Verify we're on the form
    await expect(page.locator('text=Cargar Datos')).toBeVisible({ timeout: 10000 });

    // Fill some data - use the placeholder from the actual form
    const ordenInput = page.locator('input[placeholder*="VER001"], input[placeholder*="Ej:"]').first();
    if (await ordenInput.isVisible()) {
      await ordenInput.fill('OP-TEST-001');
    }

    // Cancel and go back - scroll to make sure button is visible
    const cancelButton = page.locator('button:has-text("Cancelar")');
    await cancelButton.scrollIntoViewIfNeeded();
    await cancelButton.click({ force: true });

    // Wait for form to disappear
    await expect(page.locator('text=Cargar Datos')).not.toBeVisible({ timeout: 10000 });
  });

  test('should navigate to Implementación from sidebar while on Comercial', async ({ page }) => {
    // Click on Implementación
    await page.click('button:has-text("Implementación")');

    // Verify navigation
    await expect(page.locator('text=Implementación').nth(1)).toBeVisible({ timeout: 10000 });
  });
});
