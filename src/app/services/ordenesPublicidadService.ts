import * as ordenesRepo from '../repositories/ordenesPublicidadRepository';
import type {
  OrdenPublicidadWithItems,
  ItemOrdenPublicidadRow,
  OrdenPublicidadInsert,
  ItemOrdenPublicidadInsert,
} from '../repositories/types';
import type {
  OrdenPublicidad,
  ItemOrdenPublicidad,
  CreateOrdenPublicidadInput,
  CreateItemOrdenPublicidadInput,
  UpdateOrdenPublicidadInput,
  OrdenPublicidadValidationResult,
} from '../types/comercial';

function mapItemFromDB(row: ItemOrdenPublicidadRow): ItemOrdenPublicidad {
  return {
    id: row.id,
    programa: row.programa || '',
    monto: row.monto || '',
    ncPrograma: row.nc_programa || '',
    ncPorcentaje: row.nc_porcentaje || '',
    proveedorFee: row.proveedor_fee || '',
    feePrograma: row.fee_programa || '',
    feePorcentaje: row.fee_porcentaje || '',
    implementacion: row.implementacion || '',
    talentos: row.talentos || '',
    tecnica: row.tecnica || '',
  };
}

function mapFromDB(row: OrdenPublicidadWithItems): OrdenPublicidad {
  return {
    id: row.id,
    fecha: row.fecha || '',
    mesServicio: row.mes_servicio || '',
    responsable: row.responsable || '',
    ordenPublicidad: row.orden_publicidad || '',
    totalVenta: row.total_venta || '',
    unidadNegocio: row.unidad_negocio || '',
    categoriaNegocio: row.categoria_negocio || '',
    proyecto: row.proyecto || '',
    razonSocial: row.razon_social || '',
    categoria: row.categoria || '',
    empresaAgencia: row.empresa_agencia || '',
    marca: row.marca || '',
    nombreCampana: row.nombre_campana || '',
    acuerdoPago: row.acuerdo_pago || '',
    tipoImporte: row.tipo_importe || 'factura',
    observaciones: row.observaciones || '',
    estadoOp: row.estado_op || 'pendiente',
    items: (row.items_orden_publicidad || []).map(mapItemFromDB),
    createdAt: new Date(row.fecha_creacion),
    updatedAt: new Date(row.fecha_actualizacion),
    createdBy: row.creado_por || undefined,
  };
}

function mapToDBInsert(input: CreateOrdenPublicidadInput): OrdenPublicidadInsert {
  const now = new Date();
  return {
    fecha: now.toLocaleDateString('es-AR'),
    mes_servicio: input.mesServicio,
    responsable: input.responsable,
    orden_publicidad: input.ordenPublicidad,
    total_venta: input.totalVenta,
    unidad_negocio: input.unidadNegocio,
    categoria_negocio: input.categoriaNegocio,
    proyecto: input.proyecto || null,
    razon_social: input.razonSocial,
    categoria: input.categoria,
    empresa_agencia: input.empresaAgencia,
    marca: input.marca,
    nombre_campana: input.nombreCampana,
    acuerdo_pago: input.acuerdoPago,
    tipo_importe: input.tipoImporte,
    observaciones: input.observaciones || null,
    creado_por: input.createdBy || null,
  };
}

function mapItemToDBInsert(item: CreateItemOrdenPublicidadInput, ordenId: string): ItemOrdenPublicidadInsert {
  return {
    orden_publicidad_id: ordenId,
    programa: item.programa,
    monto: item.monto,
    nc_programa: item.ncPrograma || null,
    nc_porcentaje: item.ncPorcentaje || null,
    proveedor_fee: item.proveedorFee || null,
    fee_programa: item.feePrograma || null,
    fee_porcentaje: item.feePorcentaje || null,
    implementacion: item.implementacion || null,
    talentos: item.talentos || null,
    tecnica: item.tecnica || null,
  };
}

function mapItemToDBUpdate(item: CreateItemOrdenPublicidadInput): Partial<ItemOrdenPublicidadRow> {
  return {
    programa: item.programa,
    monto: item.monto,
    nc_programa: item.ncPrograma || null,
    nc_porcentaje: item.ncPorcentaje || null,
    proveedor_fee: item.proveedorFee || null,
    fee_programa: item.feePrograma || null,
    fee_porcentaje: item.feePorcentaje || null,
    implementacion: item.implementacion || null,
    talentos: item.talentos || null,
    tecnica: item.tecnica || null,
  };
}

export function validateCreate(input: CreateOrdenPublicidadInput): OrdenPublicidadValidationResult {
  const errors: { field: string; message: string }[] = [];

  if (!input.ordenPublicidad?.trim()) {
    errors.push({ field: 'ordenPublicidad', message: 'El número de orden es requerido' });
  }
  if (!input.mesServicio?.trim()) {
    errors.push({ field: 'mesServicio', message: 'El mes de servicio es requerido' });
  }
  if (!input.responsable?.trim()) {
    errors.push({ field: 'responsable', message: 'El responsable es requerido' });
  }
  if (!input.unidadNegocio?.trim()) {
    errors.push({ field: 'unidadNegocio', message: 'La unidad de negocio es requerida' });
  }
  if (!input.razonSocial?.trim()) {
    errors.push({ field: 'razonSocial', message: 'La razón social es requerida' });
  }
  if (!input.nombreCampana?.trim()) {
    errors.push({ field: 'nombreCampana', message: 'El nombre de campaña es requerido' });
  }
  if (!input.items || input.items.length === 0) {
    errors.push({ field: 'items', message: 'Debe agregar al menos un programa' });
  }

  return { valid: errors.length === 0, errors };
}

export async function checkOrdenExists(ordenPublicidad: string): Promise<boolean> {
  const result = await ordenesRepo.findByOrdenPublicidad(ordenPublicidad);
  return result.data !== null;
}

export async function getAll(): Promise<{ data: OrdenPublicidad[]; error: string | null }> {
  const result = await ordenesRepo.findAll();

  if (result.error) {
    console.error('Error fetching ordenes:', result.error);
    return { data: [], error: result.error.message };
  }

  return { data: result.data.map(mapFromDB), error: null };
}

export async function getById(id: string): Promise<{ data: OrdenPublicidad | null; error: string | null }> {
  const result = await ordenesRepo.findById(id);

  if (result.error) {
    console.error('Error fetching orden:', result.error);
    return { data: null, error: result.error.message };
  }

  return { data: result.data ? mapFromDB(result.data) : null, error: null };
}

export async function create(input: CreateOrdenPublicidadInput): Promise<{ data: OrdenPublicidad | null; error: string | null }> {
  const validation = validateCreate(input);
  if (!validation.valid) {
    return { data: null, error: validation.errors.map(e => e.message).join(', ') };
  }

  const ordenInsert = mapToDBInsert(input);
  const ordenResult = await ordenesRepo.create(ordenInsert);

  if (ordenResult.error || !ordenResult.data) {
    console.error('Error creating orden:', ordenResult.error);
    return { data: null, error: ordenResult.error?.message || 'Error al crear la orden' };
  }

  const ordenId = ordenResult.data.id;

  if (input.items.length > 0) {
    const itemsInsert = input.items.map(item => mapItemToDBInsert(item, ordenId));
    const itemsResult = await ordenesRepo.createItems(itemsInsert);

    if (itemsResult.error) {
      console.error('Error creating items:', itemsResult.error);
    }
  }

  const fullResult = await ordenesRepo.findById(ordenId);
  if (fullResult.error || !fullResult.data) {
    return { data: null, error: 'Error al recuperar la orden creada' };
  }

  return { data: mapFromDB(fullResult.data), error: null };
}

export async function update(input: UpdateOrdenPublicidadInput): Promise<{ data: OrdenPublicidad | null; error: string | null }> {
  const { id, items, ...ordenFields } = input;

  const updateData: Record<string, unknown> = {};
  if (ordenFields.mesServicio !== undefined) updateData.mes_servicio = ordenFields.mesServicio;
  if (ordenFields.responsable !== undefined) updateData.responsable = ordenFields.responsable;
  if (ordenFields.ordenPublicidad !== undefined) updateData.orden_publicidad = ordenFields.ordenPublicidad;
  if (ordenFields.totalVenta !== undefined) updateData.total_venta = ordenFields.totalVenta;
  if (ordenFields.unidadNegocio !== undefined) updateData.unidad_negocio = ordenFields.unidadNegocio;
  if (ordenFields.categoriaNegocio !== undefined) updateData.categoria_negocio = ordenFields.categoriaNegocio;
  if (ordenFields.proyecto !== undefined) updateData.proyecto = ordenFields.proyecto;
  if (ordenFields.razonSocial !== undefined) updateData.razon_social = ordenFields.razonSocial;
  if (ordenFields.categoria !== undefined) updateData.categoria = ordenFields.categoria;
  if (ordenFields.empresaAgencia !== undefined) updateData.empresa_agencia = ordenFields.empresaAgencia;
  if (ordenFields.marca !== undefined) updateData.marca = ordenFields.marca;
  if (ordenFields.nombreCampana !== undefined) updateData.nombre_campana = ordenFields.nombreCampana;
  if (ordenFields.acuerdoPago !== undefined) updateData.acuerdo_pago = ordenFields.acuerdoPago;
  if (ordenFields.tipoImporte !== undefined) updateData.tipo_importe = ordenFields.tipoImporte;
  if (ordenFields.observaciones !== undefined) updateData.observaciones = ordenFields.observaciones;

  const ordenResult = await ordenesRepo.update(id, updateData);
  if (ordenResult.error) {
    console.error('Error updating orden:', ordenResult.error);
    return { data: null, error: ordenResult.error.message };
  }

  if (items !== undefined) {
    const existingResult = await ordenesRepo.getItemsByOrdenId(id);
    const existingItems = existingResult.data || [];
    const existingIds = new Set(existingItems.map(i => i.id));
    const incomingIds = new Set(items.filter(i => i.id).map(i => i.id!));

    // Crear mapa de programas existentes para lookup rápido (prevenir duplicación)
    const programaToIdMap = new Map(
      existingItems.map(item => [item.programa, item.id])
    );

    // Validar no duplicados en items entrantes
    const programasEntrantes = items.map(i => i.programa);
    const programasDuplicados = programasEntrantes.filter(
      (prog, idx) => programasEntrantes.indexOf(prog) !== idx
    );
    
    if (programasDuplicados.length > 0) {
      return {
        data: null,
        error: `Programas duplicados detectados: ${programasDuplicados.join(', ')}`
      };
    }

    // Update existing items or create new ones
    for (const item of items) {
      let itemId = item.id;
      
      // Si NO tiene ID pero el programa ya existe → reutilizar ID existente
      if (!itemId && programaToIdMap.has(item.programa)) {
        itemId = programaToIdMap.get(item.programa)!;
        console.log(`[OrdenesPublicidadService] Reutilizando ID existente para programa: ${item.programa}`);
      }
      
      if (itemId && existingIds.has(itemId)) {
        // UPDATE item existente
        await ordenesRepo.updateItem(itemId, mapItemToDBUpdate(item));
      } else {
        // Validación adicional: NO permitir INSERT si el programa ya existe
        const existePrograma = existingItems.some(e => e.programa === item.programa);
        if (existePrograma) {
          console.error(`[OrdenesPublicidadService] Intento de duplicar programa: ${item.programa}. Operación bloqueada.`);
          continue; // Skip este item
        }
        
        // CREATE nuevo item
        const itemsResult = await ordenesRepo.createItems([mapItemToDBInsert(item, id)]);
        if (itemsResult.error) console.error('Error creating item:', itemsResult.error);
      }
    }

    // Delete removed items (not in incoming set and not in incoming programs)
    for (const existing of existingItems) {
      const programasEntrantes = items.map(i => i.programa);
      // Solo eliminar si NO está en el set de IDs entrantes Y NO está en programas entrantes
      if (!incomingIds.has(existing.id) && !programasEntrantes.includes(existing.programa)) {
        const delResult = await ordenesRepo.deleteItemById(existing.id);
        if (delResult.error) {
          console.warn('Could not delete item (may have gastos):', existing.id);
        }
      }
    }
  }

  const fullResult = await ordenesRepo.findById(id);
  if (fullResult.error || !fullResult.data) {
    return { data: null, error: 'Error al recuperar la orden actualizada' };
  }

  return { data: mapFromDB(fullResult.data), error: null };
}

export async function remove(id: string): Promise<{ success: boolean; error: string | null }> {
  const result = await ordenesRepo.remove(id);

  if (result.error) {
    console.error('Error deleting orden:', result.error);
    return { success: false, error: result.error.message };
  }

  return { success: true, error: null };
}

export async function updateEstadoOp(id: string, estado: 'pendiente' | 'aprobado' | 'rechazado'): Promise<{ success: boolean; error: string | null }> {
  const result = await ordenesRepo.updateEstadoOp(id, estado);
  if (result.error) {
    return { success: false, error: result.error.message };
  }
  return { success: true, error: null };
}

export function getItemImplementacionBudget(item: ItemOrdenPublicidad): number {
  const value = parseFloat(String(item.implementacion || '0').replace(/[^0-9.-]/g, ''));
  return isNaN(value) ? 0 : value;
}

export function hasImplementacionBudget(item: ItemOrdenPublicidad): boolean {
  return getItemImplementacionBudget(item) > 0;
}

export function getOrdenTotalImplementacion(orden: OrdenPublicidad): number {
  return orden.items.reduce((sum, item) => sum + getItemImplementacionBudget(item), 0);
}

export function getProgramasDisponibles(orden: OrdenPublicidad): string[] {
  return orden.items
    .filter(item => item.programa)
    .map(item => item.programa);
}
