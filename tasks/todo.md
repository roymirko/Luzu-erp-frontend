# Form Ingresos Admin - Implementation

## Completed

- [x] Create DB migration `006_ingresos_admin_fields.sql`
  - retencion_iva, retencion_suss (retenciones adicionales)
  - fecha_vencimiento, fecha_ingreso_cheque (fechas cobro)
  - certificacion_enviada_fecha, portal, contacto, fecha_envio (certificación)
  - orden_publicidad_id_ingreso (vinculación OP opcional)
  - Updated comprobantes_full view with OP join for ingresos
- [x] Update types
  - Added ingreso fields to Comprobante interface (comprobantes.ts)
  - Added ingreso OP context fields to ComprobanteWithContext
  - Updated ComprobanteRow + ComprobanteFullRow in repositories/types.ts
- [x] Update comprobantesService
  - mapFromDB + mapFromDBWithContext with ingreso fields
  - update() function handles ingreso fields
- [x] Create OrdenPublicidadSelector
  - Combobox for searching/selecting OPs
  - Shows OP#, campaña, cliente, marca in results
  - Clear button to unlink
- [x] Create DialogIngresoAdmin
  - Specialized dialog for ingresos (cobros)
  - OP selector + context display
  - Retenciones: IVA, IIBB, Ganancias, SUSS
  - Total a Cobrar calculated
  - Fechas: vencimiento, proyección cobro (auto), cobro real, días transcurridos
  - Certificación fields: fecha enviada, portal, contacto, fecha envío
  - Estado buttons: Aprobar, Req Info, Rechazar, Marcar Cobrado
- [x] Update Administracion.tsx
  - Opens DialogIngresoAdmin for ingresos
  - Opens DialogAdminComprobante for egresos
- [x] Update Finanzas.tsx
  - Same logic as Administracion
- [x] Update references/db.md
  - Documented ingreso fields

## Verification

1. Run migration: apply `006_ingresos_admin_fields.sql` in Supabase
2. Start dev: `npm run dev`
3. Go to `/administracion` or `/finanzas`
4. Click "Nuevo Ingreso" → create test ingreso
5. Click on ingreso row → verify DialogIngresoAdmin opens
6. Test:
   - Select OP → context data shows
   - Edit retenciones → Total a Cobrar updates
   - Set fecha vencimiento → días transcurridos shows
   - All fields save correctly
   - State transitions work (aprobar/rechazar/cobrado)
7. Click on egreso row → verify DialogAdminComprobante opens (no regression)

## Files Created

```
supabase/migrations/006_ingresos_admin_fields.sql
src/app/components/shared/OrdenPublicidadSelector.tsx
src/app/components/administracion/DialogIngresoAdmin.tsx
```

## Files Modified

- src/app/types/comprobantes.ts - ingreso fields + OP context fields
- src/app/repositories/types.ts - ingreso fields in ComprobanteRow/ComprobanteFullRow
- src/app/services/comprobantesService.ts - mappers + update
- src/app/components/administracion/Administracion.tsx - route to correct dialog
- src/app/components/finanzas/Finanzas.tsx - route to correct dialog
- references/db.md - documented ingreso fields
