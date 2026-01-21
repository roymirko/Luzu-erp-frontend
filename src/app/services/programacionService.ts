import * as programacionRepo from '../repositories/programacionRepository';
import type {
  ProgramacionGastoFullRow,
  GastoInsert,
  ProgramacionFormularioInsert,
  ProgramacionGastoInsert,
} from '../repositories/types';
import type {
  GastoProgramacion,
  CreateGastoProgramacionInput,
  UpdateGastoProgramacionInput,
  GastoProgramacionValidationResult,
  EstadoGastoProgramacion,
} from '../types/programacion';
import type { EstadoPago, Moneda } from '../types/gastos';

const DEFAULT_IVA = 21;
const DEFAULT_MONEDA: Moneda = 'ARS';

/**
 * Mapea una fila de la vista a modelo de dominio
 */
function mapFromDB(row: ProgramacionGastoFullRow): GastoProgramacion {
  return {
    // Gasto base
    id: row.id,
    proveedor: row.proveedor || '',
    razonSocial: row.razon_social || undefined,
    tipoFactura: row.tipo_factura || undefined,
    numeroFactura: row.numero_factura || undefined,
    fechaFactura: row.fecha_factura ? new Date(row.fecha_factura) : undefined,
    moneda: (row.moneda || DEFAULT_MONEDA) as Moneda,
    neto: row.neto || 0,
    iva: row.iva || DEFAULT_IVA,
    importeTotal: row.importe_total || 0,
    empresa: row.empresa || undefined,
    conceptoGasto: row.concepto_gasto || undefined,
    observaciones: row.observaciones || undefined,
    estado: (row.estado || 'pendiente') as EstadoGastoProgramacion,
    estadoPago: (row.estado_pago || 'pendiente') as EstadoPago,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    createdBy: row.created_by || undefined,
    // Formulario (header)
    formularioId: row.formulario_id,
    mesGestion: row.mes_gestion || '',
    mesVenta: row.mes_venta || '',
    mesInicio: row.mes_inicio || '',
    unidadNegocio: row.unidad_negocio || '',
    categoriaNegocio: row.categoria_negocio || '',
    programa: row.programa || '',
    ejecutivo: row.ejecutivo || '',
    subRubroEmpresa: row.sub_rubro_empresa || '',
    detalleCampana: row.detalle_campana || undefined,
    formularioEstado: row.formulario_estado || undefined,
    formularioCreatedAt: row.formulario_created_at ? new Date(row.formulario_created_at) : undefined,
    // Context
    programacionGastoId: row.programacion_gasto_id,
    categoria: row.categoria || '',
    acuerdoPago: row.acuerdo_pago || '',
    cliente: row.cliente || '',
    monto: row.monto || 0,
    valorImponible: row.valor_imponible || 0,
    bonificacion: row.bonificacion || 0,
    facturaEmitidaA: row.factura_emitida_a || undefined,
  };
}

/**
 * Mapea input de creación a los formatos de las 3 tablas
 */
function mapToDBInserts(input: CreateGastoProgramacionInput): {
  gasto: GastoInsert;
  formulario: ProgramacionFormularioInsert;
  context: Omit<ProgramacionGastoInsert, 'gasto_id' | 'formulario_id'>;
} {
  const neto = input.neto || 0;
  const iva = input.iva ?? DEFAULT_IVA;
  const importeTotal = neto * (1 + iva / 100);

  return {
    gasto: {
      proveedor: input.proveedor,
      razon_social: input.razonSocial || null,
      tipo_factura: input.tipoFactura || null,
      numero_factura: input.numeroFactura || null,
      fecha_factura: input.fechaFactura?.toISOString().split('T')[0] || null,
      moneda: input.moneda || DEFAULT_MONEDA,
      neto,
      iva,
      importe_total: importeTotal,
      empresa: input.empresa || null,
      concepto_gasto: input.conceptoGasto || null,
      observaciones: input.observaciones || null,
      estado: 'pendiente',
      estado_pago: 'pendiente',
      created_by: input.createdBy || null,
    },
    formulario: {
      mes_gestion: input.mesGestion || null,
      mes_venta: input.mesVenta || null,
      mes_inicio: input.mesInicio || null,
      unidad_negocio: input.unidadNegocio || null,
      categoria_negocio: input.categoriaNegocio || null,
      programa: input.programa || null,
      ejecutivo: input.ejecutivo || null,
      sub_rubro_empresa: input.subRubroEmpresa || null,
      detalle_campana: input.detalleCampana || null,
      estado: 'pendiente',
      created_by: input.createdBy || null,
    },
    context: {
      categoria: input.categoria || null,
      acuerdo_pago: input.acuerdoPago || null,
      cliente: input.cliente || null,
      monto: input.monto || null,
      valor_imponible: input.valorImponible || null,
      bonificacion: input.bonificacion || 0,
      factura_emitida_a: input.facturaEmitidaA || null,
    },
  };
}

/**
 * Valida los campos requeridos para crear un gasto de programación
 */
export function validateCreate(input: CreateGastoProgramacionInput): GastoProgramacionValidationResult {
  const errors: { field: string; message: string }[] = [];

  if (!input.mesGestion?.trim()) {
    errors.push({ field: 'mesGestion', message: 'Debe seleccionar un mes de gestión' });
  }
  if (!input.unidadNegocio?.trim()) {
    errors.push({ field: 'unidadNegocio', message: 'Debe seleccionar una unidad de negocio' });
  }
  if (!input.programa?.trim()) {
    errors.push({ field: 'programa', message: 'Debe seleccionar un programa' });
  }
  if (!input.proveedor?.trim()) {
    errors.push({ field: 'proveedor', message: 'Debe seleccionar un proveedor' });
  }
  if (!input.razonSocial?.trim()) {
    errors.push({ field: 'razonSocial', message: 'Debe ingresar una razón social' });
  }
  if (!input.neto || input.neto <= 0) {
    errors.push({ field: 'neto', message: 'Debe ingresar un importe neto válido' });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Obtiene todos los gastos de programación
 */
export async function getAll(): Promise<{ data: GastoProgramacion[]; error: string | null }> {
  const result = await programacionRepo.findAll();

  if (result.error) {
    console.error('Error fetching gastos programacion:', result.error);
    return { data: [], error: result.error.message };
  }

  console.log('[getAll] Fetched gastos count:', result.data.length);
  console.log('[getAll] Formulario IDs:', [...new Set(result.data.map(g => g.formulario_id))]);

  return { data: result.data.map(mapFromDB), error: null };
}

/**
 * Obtiene un gasto de programación por ID
 */
export async function getById(id: string): Promise<{ data: GastoProgramacion | null; error: string | null }> {
  const result = await programacionRepo.findById(id);

  if (result.error) {
    console.error('Error fetching gasto programacion:', result.error);
    return { data: null, error: result.error.message };
  }

  return { data: result.data ? mapFromDB(result.data) : null, error: null };
}

/**
 * Crea un nuevo gasto de programación
 */
export async function create(input: CreateGastoProgramacionInput): Promise<{ data: GastoProgramacion | null; error: string | null }> {
  const validation = validateCreate(input);
  if (!validation.valid) {
    return { data: null, error: validation.errors.map(e => e.message).join(', ') };
  }

  const dbInserts = mapToDBInserts(input);
  const result = await programacionRepo.create(dbInserts);

  if (result.error || !result.data) {
    console.error('Error creating gasto programacion:', result.error);
    return { data: null, error: result.error?.message || 'Error al crear el gasto' };
  }

  return { data: mapFromDB(result.data), error: null };
}

/**
 * Input for each gasto in a multi-gasto create
 */
export interface GastoItemInput {
  proveedor: string;
  razonSocial: string;
  neto: number;
  iva?: number;
  empresa?: string;
  observaciones?: string;
  facturaEmitidaA?: string;
  acuerdoPago?: string;
  categoria?: string;
}

/**
 * Input for creating multiple gastos under one formulario
 */
export interface CreateMultipleGastosInput {
  // Formulario (header) fields - shared across all gastos
  mesGestion: string;
  mesVenta?: string;
  mesInicio?: string;
  unidadNegocio: string;
  categoriaNegocio?: string;
  programa: string;
  ejecutivo?: string;
  subRubroEmpresa?: string;
  detalleCampana?: string;
  createdBy?: string;
  // Individual gastos
  gastos: GastoItemInput[];
}

/**
 * Crea múltiples gastos de programación bajo un mismo formulario
 */
export async function createMultiple(input: CreateMultipleGastosInput): Promise<{ data: GastoProgramacion[]; error: string | null }> {
  console.log('[createMultiple] Input gastos count:', input.gastos?.length);
  console.log('[createMultiple] Input gastos:', JSON.stringify(input.gastos, null, 2));

  // Validate at least one gasto
  if (!input.gastos || input.gastos.length === 0) {
    return { data: [], error: 'Debe proporcionar al menos un gasto' };
  }

  // Validate required fields
  if (!input.mesGestion?.trim()) {
    return { data: [], error: 'Debe seleccionar un mes de gestión' };
  }
  if (!input.unidadNegocio?.trim()) {
    return { data: [], error: 'Debe seleccionar una unidad de negocio' };
  }
  if (!input.programa?.trim()) {
    return { data: [], error: 'Debe seleccionar un programa' };
  }

  // Validate each gasto
  for (let i = 0; i < input.gastos.length; i++) {
    const g = input.gastos[i];
    if (!g.proveedor?.trim()) {
      return { data: [], error: `Gasto #${i + 1}: Debe seleccionar un proveedor` };
    }
    if (!g.razonSocial?.trim()) {
      return { data: [], error: `Gasto #${i + 1}: Debe ingresar una razón social` };
    }
    if (!g.neto || g.neto <= 0) {
      return { data: [], error: `Gasto #${i + 1}: Debe ingresar un importe neto válido` };
    }
  }

  // Build formulario insert
  const formulario = {
    mes_gestion: input.mesGestion || null,
    mes_venta: input.mesVenta || null,
    mes_inicio: input.mesInicio || null,
    unidad_negocio: input.unidadNegocio || null,
    categoria_negocio: input.categoriaNegocio || null,
    programa: input.programa || null,
    ejecutivo: input.ejecutivo || null,
    sub_rubro_empresa: input.subRubroEmpresa || null,
    detalle_campana: input.detalleCampana || null,
    estado: 'pendiente',
    created_by: input.createdBy || null,
  };

  // Build gastos inserts
  const gastosData = input.gastos.map(g => {
    const neto = g.neto || 0;
    const iva = g.iva ?? DEFAULT_IVA;
    const importeTotal = neto * (1 + iva / 100);

    return {
      gasto: {
        proveedor: g.proveedor,
        razon_social: g.razonSocial || null,
        tipo_factura: null,
        numero_factura: null,
        fecha_factura: null,
        moneda: DEFAULT_MONEDA,
        neto,
        iva,
        importe_total: importeTotal,
        empresa: g.empresa || null,
        concepto_gasto: null,
        observaciones: g.observaciones || null,
        estado: 'pendiente',
        estado_pago: 'pendiente',
        created_by: input.createdBy || null,
      },
      context: {
        categoria: g.categoria || null,
        acuerdo_pago: g.acuerdoPago || null,
        cliente: null,
        monto: null,
        valor_imponible: null,
        bonificacion: 0,
        factura_emitida_a: g.facturaEmitidaA || null,
      },
    };
  });

  console.log('[createMultiple] gastosData count:', gastosData.length);

  const result = await programacionRepo.createWithMultipleGastos({
    formulario,
    gastos: gastosData,
  });

  console.log('[createMultiple] Repository result:', {
    dataCount: result.data?.length,
    error: result.error,
  });

  if (result.error) {
    console.error('Error creating multiple gastos:', result.error);
    return { data: [], error: result.error.message };
  }

  return { data: result.data.map(mapFromDB), error: null };
}

/**
 * Actualiza un gasto de programación
 */
export async function update(input: UpdateGastoProgramacionInput): Promise<{ data: GastoProgramacion | null; error: string | null }> {
  const { id, ...fields } = input;

  // Separar campos por tabla
  const gastoUpdate: Record<string, unknown> = {};
  const formularioUpdate: Record<string, unknown> = {};
  const contextUpdate: Record<string, unknown> = {};

  // Gasto base
  if (fields.proveedor !== undefined) gastoUpdate.proveedor = fields.proveedor;
  if (fields.razonSocial !== undefined) gastoUpdate.razon_social = fields.razonSocial;
  if (fields.tipoFactura !== undefined) gastoUpdate.tipo_factura = fields.tipoFactura;
  if (fields.numeroFactura !== undefined) gastoUpdate.numero_factura = fields.numeroFactura;
  if (fields.fechaFactura !== undefined) {
    gastoUpdate.fecha_factura = fields.fechaFactura?.toISOString().split('T')[0] || null;
  }
  if (fields.moneda !== undefined) gastoUpdate.moneda = fields.moneda;
  if (fields.neto !== undefined) gastoUpdate.neto = fields.neto;
  if (fields.iva !== undefined) gastoUpdate.iva = fields.iva;
  if (fields.empresa !== undefined) gastoUpdate.empresa = fields.empresa;
  if (fields.conceptoGasto !== undefined) gastoUpdate.concepto_gasto = fields.conceptoGasto;
  if (fields.observaciones !== undefined) gastoUpdate.observaciones = fields.observaciones;
  if (fields.estado !== undefined) gastoUpdate.estado = fields.estado;

  // Recalcular importe total si cambió neto o iva
  if (fields.neto !== undefined || fields.iva !== undefined) {
    const currentResult = await programacionRepo.findById(id);
    if (currentResult.data) {
      const neto = fields.neto ?? currentResult.data.neto;
      const iva = fields.iva ?? currentResult.data.iva;
      gastoUpdate.importe_total = neto * (1 + iva / 100);
    }
  }

  // Formulario (header)
  if (fields.mesGestion !== undefined) formularioUpdate.mes_gestion = fields.mesGestion;
  if (fields.mesVenta !== undefined) formularioUpdate.mes_venta = fields.mesVenta;
  if (fields.mesInicio !== undefined) formularioUpdate.mes_inicio = fields.mesInicio;
  if (fields.unidadNegocio !== undefined) formularioUpdate.unidad_negocio = fields.unidadNegocio;
  if (fields.categoriaNegocio !== undefined) formularioUpdate.categoria_negocio = fields.categoriaNegocio;
  if (fields.programa !== undefined) formularioUpdate.programa = fields.programa;
  if (fields.ejecutivo !== undefined) formularioUpdate.ejecutivo = fields.ejecutivo;
  if (fields.subRubroEmpresa !== undefined) formularioUpdate.sub_rubro_empresa = fields.subRubroEmpresa;
  if (fields.detalleCampana !== undefined) formularioUpdate.detalle_campana = fields.detalleCampana;

  // Context
  if (fields.categoria !== undefined) contextUpdate.categoria = fields.categoria;
  if (fields.acuerdoPago !== undefined) contextUpdate.acuerdo_pago = fields.acuerdoPago;
  if (fields.cliente !== undefined) contextUpdate.cliente = fields.cliente;
  if (fields.monto !== undefined) contextUpdate.monto = fields.monto;
  if (fields.valorImponible !== undefined) contextUpdate.valor_imponible = fields.valorImponible;
  if (fields.bonificacion !== undefined) contextUpdate.bonificacion = fields.bonificacion;
  if (fields.facturaEmitidaA !== undefined) contextUpdate.factura_emitida_a = fields.facturaEmitidaA;

  const result = await programacionRepo.update(id, {
    gasto: Object.keys(gastoUpdate).length > 0 ? gastoUpdate : undefined,
    formulario: Object.keys(formularioUpdate).length > 0 ? formularioUpdate : undefined,
    context: Object.keys(contextUpdate).length > 0 ? contextUpdate : undefined,
  });

  if (result.error) {
    console.error('Error updating gasto programacion:', result.error);
    return { data: null, error: result.error.message };
  }

  return { data: result.data ? mapFromDB(result.data) : null, error: null };
}

/**
 * Elimina un gasto de programación
 */
export async function remove(id: string): Promise<{ success: boolean; error: string | null }> {
  const result = await programacionRepo.remove(id);

  if (result.error) {
    console.error('Error deleting gasto programacion:', result.error);
    return { success: false, error: result.error.message };
  }

  return { success: true, error: null };
}

/**
 * Calcula el importe total a partir del neto e IVA
 */
export function calculateTotalImporte(gasto: GastoProgramacion): number {
  const neto = gasto.neto || 0;
  const iva = gasto.iva || DEFAULT_IVA;
  return neto * (1 + iva / 100);
}
