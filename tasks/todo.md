# Extract shared form components

## Completed

- [x] Step 1: `formatCurrency` → `src/app/utils/format.ts`
  - Created unified function (handles string|number, optional moneda, NaN fallback)
  - Replaced 8 local definitions across 11 files
  - Removed `formatCurrency` prop from CampaignInfoCard, ResumenPresupuestario, ExperienceResumen
- [x] Step 2: formStyles → `src/app/components/shared/formStyles.ts`
  - `formStyles(isDark)` — form group (h-32, 5 classes: label, input, selectTrigger, disabledSelect, textarea)
  - `dialogFormStyles(isDark)` — dialog group (h-9, 2 classes: label, input)
  - Replaced in 8 files: Prog, Exp, GastoCard, DialogAdmin, DialogIngreso, DialogNuevo, DialogDetalle, ProveedorSelector
- [x] Step 3: FormHeader + FormFooter → `src/app/components/shared/`
  - FormHeader: configurable badge (gray/colored), warning (red/yellow), estadoLabel
  - FormFooter: configurable hideSave/disableSave when cerrado, cancelLabelCerrado, paddingTop
  - Replaced in 4 formularios: Impl, Tec, Prog, Exp

## New files
- `src/app/utils/format.ts`
- `src/app/components/shared/formStyles.ts`
- `src/app/components/shared/FormHeader.tsx`
- `src/app/components/shared/FormFooter.tsx`

## Files modified
- FormularioImplementacion, FormularioTecnica, FormularioProgramacion, ExperienceForm
- TablaImplementacion, TablaComprobantes
- DialogAdminComprobante, DialogIngresoAdmin, DialogNuevoComprobante, DialogDetalleComprobante
- CampaignInfoCard, ResumenPresupuestario, ExperienceResumen
- GastoCard, ProveedorSelector

## Build
`npm run build` — zero TS errors, bundle ~940KB (down from ~944KB)
