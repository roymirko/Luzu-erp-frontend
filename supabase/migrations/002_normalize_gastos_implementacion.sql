-- Normalize gastos_implementacion: remove columns duplicated from ordenes_publicidad

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'gastos_implementacion_orden_fk'
  ) THEN
    ALTER TABLE public.gastos_implementacion
      ADD CONSTRAINT gastos_implementacion_orden_fk
      FOREIGN KEY (id_formulario_comercial)
      REFERENCES public.ordenes_publicidad(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_gastos_implementacion_formulario_comercial 
  ON public.gastos_implementacion(id_formulario_comercial);

ALTER TABLE public.gastos_implementacion 
  DROP COLUMN IF EXISTS orden_publicidad,
  DROP COLUMN IF EXISTS responsable,
  DROP COLUMN IF EXISTS unidad_negocio,
  DROP COLUMN IF EXISTS categoria_negocio,
  DROP COLUMN IF EXISTS nombre_campana;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.gastos_implementacion WHERE id_formulario_comercial IS NULL
  ) THEN
    ALTER TABLE public.gastos_implementacion 
      ALTER COLUMN id_formulario_comercial SET NOT NULL;
  END IF;
END $$;

CREATE OR REPLACE VIEW public.gastos_implementacion_full AS
SELECT 
  gi.id,
  gi.fecha_creacion,
  gi.fecha_actualizacion,
  gi.fecha_registro,
  gi.anio,
  gi.mes,
  gi.id_formulario_comercial,
  gi.estado,
  gi.item_orden_publicidad_id,
  gi.acuerdo_pago,
  gi.presupuesto,
  gi.cantidad_programas,
  gi.programas_disponibles,
  gi.sector,
  gi.rubro_gasto,
  gi.sub_rubro,
  gi.factura_emitida_a,
  gi.empresa,
  gi.concepto_gasto,
  gi.observaciones,
  gi.creado_por,
  gi.actualizado_por,
  op.orden_publicidad,
  op.responsable,
  op.unidad_negocio,
  op.categoria_negocio,
  op.nombre_campana,
  op.razon_social,
  op.marca,
  op.empresa_agencia
FROM public.gastos_implementacion gi
LEFT JOIN public.ordenes_publicidad op ON gi.id_formulario_comercial = op.id;
