# Agregar Nro Comprobante + Reordenar Acuerdo de Pago

## Completed

- [x] Step 1: Add `numeroComprobante` to GastoData + GastoCardErrors interfaces
- [x] Step 2: Reorder GastoCard layout — acuerdo pago + nro comprobante first, then factura/empresa, then programa/fecha, then proveedor, then forma pago/pais, then neto
- [x] Step 3: Add `numeroComprobante` to BloqueImporte (impl/tec shared)
- [x] Step 4: Map in CargaImportesSection (toGastoData)
- [x] Step 5: Map in gastoToBloqueImporte (load from DB) — impl + tec
- [x] Step 6: Map in bloqueToCreateInput (save to DB) — impl + tec
- [x] Step 7: Map in handleSaveGasto update path — impl + tec (individual + bulk)
- [x] Step 8: Add `numeroComprobante` to programacion GastoItem + all mappings (load, save individual, save bulk)
- [x] Step 9: Add `numeroComprobante` to experience GastoItem + all mappings (load, save individual, save bulk)
- [x] Build: `npm run build` — zero TS errors

## Files modified
- `src/app/components/shared/GastoCard.tsx` — interface + layout reorder
- `src/app/components/implementacion/index.ts` — BloqueImporte interface
- `src/app/components/implementacion/CargaImportesSection.tsx` — toGastoData mapping
- `src/app/components/FormularioImplementacion.tsx` — load/save/create mappings
- `src/app/components/FormularioTecnica.tsx` — load/save/create mappings
- `src/app/components/programacion/FormularioProgramacion.tsx` — GastoItem + all mappings
- `src/app/components/experience/ExperienceForm.tsx` — GastoItem + all mappings
