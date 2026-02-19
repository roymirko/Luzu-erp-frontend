# Fix: Cancel button behavior on gasto forms

## Completed
- [x] GastoCard: AlertDialog confirmation + `onDeleteSaved` prop
- [x] CargaImportesSection: `onResetImporte` + `onDeleteSavedGasto` props
- [x] FormularioImplementacion: `deleteGasto` + reset/delete handlers
- [x] FormularioTecnica: same (uses CargaImportesSection)
- [x] FormularioProgramacion: `deleteGasto` + reset/delete + fix `isNew`
- [x] ExperienceForm: same pattern
- [x] ProductoraForm: same pattern
- [x] Build passes

## Files modified
- `src/app/components/shared/GastoCard.tsx` — AlertDialog + onDeleteSaved prop
- `src/app/components/implementacion/CargaImportesSection.tsx` — onResetImporte + onDeleteSavedGasto
- `src/app/components/FormularioImplementacion.tsx` — deleteGasto + handlers
- `src/app/components/FormularioTecnica.tsx` — deleteGasto + handlers
- `src/app/components/programacion/FormularioProgramacion.tsx` — deleteGasto + handlers + isNew fix
- `src/app/components/experience/ExperienceForm.tsx` — deleteGasto + handlers + isNew fix
- `src/app/components/productora/ProductoraForm.tsx` — deleteGasto + handlers + isNew fix
