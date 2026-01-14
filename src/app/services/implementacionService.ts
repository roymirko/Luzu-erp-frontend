import * as implementacionRepo from '../repositories/implementacionRepository';
import * as ordenesRepo from '../repositories/ordenesPublicidadRepository';
import * as ordenesService from './ordenesPublicidadService';
import type {
  GastoImplementacionWithItems,
  ItemGastoImplementacionRow,
  GastoImplementacionInsert,
  ItemGastoImplementacionInsert,
} from '../repositories/types';
import type {
  GastoImplementacion,
  ItemGastoImplementacion,
  CreateGastoImplementacionInput,
  CreateItemGastoInput,
  UpdateGastoImplementacionInput,
  GastoValidationResult,
  GastoConOrdenPublicidad,
  EstadoGasto,
  EstadoPago,
} from '../types/implementacion';

const DEFAULT_IVA = 21;

function mapItemFromDB(row: ItemGastoImplementacionRow): ItemGastoImplementacion {
  return {
    id: row.id,
    empresaPgm: row.tipo_proveedor || '',
    fechaComprobante: row.fecha_factura ? String(row.fecha_factura).split('T')[0] : '',
    proveedor: row.proveedor || '',
    razonSocial: row.razon_social || '',
    condicionPago: row.condicion_pago || '',
    neto: row.neto || 0,
    iva: row.iva || DEFAULT_IVA,
    importeTotal: row.importe_total || 0,
    estadoPago: (row.estado_pago || 'pendiente-pago') as EstadoPago,
    adjuntos: row.adjuntos || undefined,
  };
}

function mapFromDB(row: GastoImplementacionWithItems): GastoImplementacion {
  return {
    id: row.id,
    fechaRegistro: row.fecha_registro ? String(row.fecha_registro).split('T')[0] : '',
    estadoGasto: (row.estado || 'pendiente') as EstadoGasto,
    idFormularioComercial: row.id_formulario_comercial || undefined,
    itemOrdenPublicidadId: row.item_orden_publicidad_id || undefined,
    facturaEmitidaA: row.factura_emitida_a || '',
    empresa: row.empresa || '',
    conceptoGasto: row.concepto_gasto || '',
    observaciones: row.observaciones || '',
    items: (row.items_gasto_implementacion || []).map(mapItemFromDB),
    createdAt: new Date(row.fecha_creacion),
    updatedAt: new Date(row.fecha_actualizacion),
    createdBy: row.creado_por || undefined,
    ordenPublicidad: row.orden_publicidad || undefined,
    responsable: row.responsable || undefined,
    unidadNegocio: row.unidad_negocio || undefined,
    categoriaNegocio: row.categoria_negocio || undefined,
    nombreCampana: row.nombre_campana || undefined,
  };
}

function mapToDBInsert(input: CreateGastoImplementacionInput): GastoImplementacionInsert {
  const fechaRegistro = new Date(input.fechaRegistro);
  return {
    fecha_registro: input.fechaRegistro,
    anio: fechaRegistro.getFullYear(),
    mes: fechaRegistro.getMonth() + 1,
    id_formulario_comercial: input.idFormularioComercial!,
    estado: 'pendiente',
    item_orden_publicidad_id: input.itemOrdenPublicidadId || null,
    acuerdo_pago: null,
    presupuesto: null,
    cantidad_programas: null,
    programas_disponibles: null,
    sector: null,
    rubro_gasto: null,
    sub_rubro: null,
    factura_emitida_a: input.facturaEmitidaA,
    empresa: input.empresa,
    concepto_gasto: input.conceptoGasto,
    observaciones: input.observaciones || null,
    creado_por: input.createdBy || null,
    actualizado_por: null,
  };
}

function mapItemToDBInsert(item: CreateItemGastoInput, gastoId: string): ItemGastoImplementacionInsert {
  const neto = item.neto || 0;
  const iva = DEFAULT_IVA;
  const importeTotal = neto * (1 + iva / 100);

  return {
    gasto_id: gastoId,
    tipo_proveedor: item.empresaPgm || 'Directo',
    proveedor: item.proveedor,
    razon_social: item.razonSocial || null,
    descripcion: null,
    rubro_gasto: 'Gasto de venta',
    sub_rubro: null,
    sector: 'Implementación',
    moneda: 'ARS',
    neto,
    iva,
    importe_total: importeTotal,
    tipo_factura: null,
    numero_factura: null,
    fecha_factura: item.fechaComprobante || null,
    condicion_pago: item.condicionPago || null,
    fecha_pago: null,
    estado_pago: 'pendiente',
    adjuntos: null,
  };
}

export function validateCreate(input: CreateGastoImplementacionInput): GastoValidationResult {
  const errors: { field: string; message: string }[] = [];

  if (!input.facturaEmitidaA?.trim()) {
    errors.push({ field: 'facturaEmitidaA', message: 'Debe seleccionar a quién se emite la factura' });
  }
  if (!input.empresa?.trim()) {
    errors.push({ field: 'empresa', message: 'Debe seleccionar una empresa' });
  }
  if (!input.conceptoGasto?.trim()) {
    errors.push({ field: 'conceptoGasto', message: 'Debe ingresar un concepto de gasto' });
  }
  if (!input.items || input.items.length === 0) {
    errors.push({ field: 'items', message: 'Debe agregar al menos un importe' });
  }

  for (let i = 0; i < (input.items || []).length; i++) {
    const item = input.items[i];
    if (!item.empresaPgm) {
      errors.push({ field: `items[${i}].empresaPgm`, message: 'Empresa/PGM es requerido' });
    }
    if (!item.proveedor || !item.razonSocial) {
      errors.push({ field: `items[${i}].proveedor`, message: 'Proveedor y razón social son requeridos' });
    }
    if (!item.neto || item.neto <= 0) {
      errors.push({ field: `items[${i}].neto`, message: 'El importe neto es requerido' });
    }
  }

  return { valid: errors.length === 0, errors };
}

export async function getAll(): Promise<{ data: GastoImplementacion[]; error: string | null }> {
  const result = await implementacionRepo.findAll();

  if (result.error) {
    console.error('Error fetching gastos:', result.error);
    return { data: [], error: result.error.message };
  }

  return { data: result.data.map(mapFromDB), error: null };
}

export async function getById(id: string): Promise<{ data: GastoImplementacion | null; error: string | null }> {
  const result = await implementacionRepo.findById(id);

  if (result.error) {
    console.error('Error fetching gasto:', result.error);
    return { data: null, error: result.error.message };
  }

  return { data: result.data ? mapFromDB(result.data) : null, error: null };
}

export async function getByFormItemId(
  formId: string,
  itemId: string
): Promise<{ data: GastoImplementacion | null; error: string | null }> {
  const result = await implementacionRepo.findByFormItemId(formId, itemId);

  if (result.error) {
    console.error('Error fetching gasto by form item:', result.error);
    return { data: null, error: result.error.message };
  }

  return { data: result.data ? mapFromDB(result.data) : null, error: null };
}

export async function create(input: CreateGastoImplementacionInput): Promise<{ data: GastoImplementacion | null; error: string | null }> {
  const validation = validateCreate(input);
  if (!validation.valid) {
    return { data: null, error: validation.errors.map(e => e.message).join(', ') };
  }

  const gastoInsert = mapToDBInsert(input);
  const gastoResult = await implementacionRepo.create(gastoInsert);

  if (gastoResult.error || !gastoResult.data) {
    console.error('Error creating gasto:', gastoResult.error);
    return { data: null, error: gastoResult.error?.message || 'Error al crear el gasto' };
  }

  const gastoId = gastoResult.data.id;

  if (input.items.length > 0) {
    const itemsInsert = input.items.map(item => mapItemToDBInsert(item, gastoId));
    const itemsResult = await implementacionRepo.createItems(itemsInsert);

    if (itemsResult.error) {
      console.error('Error creating items:', itemsResult.error);
    }
  }

  const fullResult = await implementacionRepo.findById(gastoId);
  if (fullResult.error || !fullResult.data) {
    return { data: null, error: 'Error al recuperar el gasto creado' };
  }

  return { data: mapFromDB(fullResult.data), error: null };
}

export async function update(input: UpdateGastoImplementacionInput): Promise<{ data: GastoImplementacion | null; error: string | null }> {
  const { id, items, ...gastoFields } = input;

  const updateData: Record<string, unknown> = {};
  if (gastoFields.facturaEmitidaA !== undefined) updateData.factura_emitida_a = gastoFields.facturaEmitidaA;
  if (gastoFields.empresa !== undefined) updateData.empresa = gastoFields.empresa;
  if (gastoFields.conceptoGasto !== undefined) updateData.concepto_gasto = gastoFields.conceptoGasto;
  if (gastoFields.observaciones !== undefined) updateData.observaciones = gastoFields.observaciones;
  if (gastoFields.estadoGasto !== undefined) updateData.estado = gastoFields.estadoGasto;

  const gastoResult = await implementacionRepo.update(id, updateData);
  if (gastoResult.error) {
    console.error('Error updating gasto:', gastoResult.error);
    return { data: null, error: gastoResult.error.message };
  }

  if (items !== undefined) {
    await implementacionRepo.deleteItemsByGastoId(id);

    if (items.length > 0) {
      const itemsInsert = items.map(item => mapItemToDBInsert(item, id));
      const itemsResult = await implementacionRepo.createItems(itemsInsert);

      if (itemsResult.error) {
        console.error('Error creating items:', itemsResult.error);
      }
    }
  }

  const fullResult = await implementacionRepo.findById(id);
  if (fullResult.error || !fullResult.data) {
    return { data: null, error: 'Error al recuperar el gasto actualizado' };
  }

  return { data: mapFromDB(fullResult.data), error: null };
}

export async function remove(id: string): Promise<{ success: boolean; error: string | null }> {
  const result = await implementacionRepo.remove(id);

  if (result.error) {
    console.error('Error deleting gasto:', result.error);
    return { success: false, error: result.error.message };
  }

  return { success: true, error: null };
}

export async function getWithOrdenPublicidad(
  gastoId: string
): Promise<{ data: GastoConOrdenPublicidad | null; error: string | null }> {
  const gastoResult = await getById(gastoId);
  if (gastoResult.error || !gastoResult.data) {
    return { data: null, error: gastoResult.error };
  }

  const gasto = gastoResult.data;

  let presupuesto = 0;
  let programasDisponibles: string[] = [];
  let acuerdoPago = '';

  if (gasto.idFormularioComercial) {
    const ordenResult = await ordenesRepo.findById(gasto.idFormularioComercial);
    if (ordenResult.data) {
      const orden = ordenResult.data;
      acuerdoPago = orden.acuerdo_pago || '';

      const item = gasto.itemOrdenPublicidadId
        ? orden.items_orden_publicidad?.find(i => i.id === gasto.itemOrdenPublicidadId)
        : null;

      presupuesto = item
        ? parseFloat(String(item.implementacion || '0').replace(/[^0-9.-]/g, ''))
        : 0;

      programasDisponibles = orden.items_orden_publicidad
        ?.filter(i => i.programa)
        .map(i => i.programa!) || [];
    }
  }

  return {
    data: {
      ...gasto,
      ordenPublicidad: gasto.ordenPublicidad || '',
      unidadNegocio: gasto.unidadNegocio || '',
      categoriaNegocio: gasto.categoriaNegocio || '',
      nombreCampana: gasto.nombreCampana || '',
      responsable: gasto.responsable || '',
      acuerdoPago,
      presupuesto,
      programasDisponibles,
    },
    error: null,
  };
}

export function calculateTotalEjecutado(gasto: GastoImplementacion): number {
  return gasto.items.reduce((sum, item) => sum + (item.neto || 0), 0);
}

export function calculateDisponible(presupuesto: number, gasto: GastoImplementacion): number {
  return presupuesto - calculateTotalEjecutado(gasto);
}

export function isOverBudget(presupuesto: number, gasto: GastoImplementacion): boolean {
  return calculateTotalEjecutado(gasto) > presupuesto;
}
