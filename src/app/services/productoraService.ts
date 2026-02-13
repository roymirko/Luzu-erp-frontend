import * as productoraRepo from '../repositories/productoraRepository';
import type {
  ProductoraGastoFullRow,
  GastoInsert,
  ProductoraFormularioInsert,
  ProductoraComprobanteInsert,
} from '../repositories/types';
import type {
  GastoProductora,
  CreateGastoProductoraInput,
  UpdateGastoProductoraInput,
  GastoProductoraValidationResult,
  EstadoGastoProductora,
  EstadoFormularioProductora,
  CreateMultipleGastosProductoraInput,
} from '../types/productora';
import type { EstadoPago, Moneda } from '../types/gastos';

const DEFAULT_IVA = 21;
const DEFAULT_MONEDA: Moneda = 'ARS';

function mapFromDB(row: ProductoraGastoFullRow): GastoProductora {
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
    empresa: row.gasto_empresa || undefined,
    conceptoGasto: row.concepto_gasto || undefined,
    observaciones: row.observaciones || undefined,
    estado: (row.estado || 'pendiente') as EstadoGastoProductora,
    estadoPago: (row.estado_pago || 'creado') as EstadoPago,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    createdBy: row.created_by || undefined,
    // Formulario (header)
    formularioId: row.formulario_id,
    mesGestion: row.mes_gestion || '',
    unidadNegocio: row.unidad_negocio || '',
    categoriaNegocio: row.categoria_negocio || '',
    formularioRubro: row.formulario_rubro || '',
    formularioSubRubro: row.formulario_sub_rubro || '',
    nombreCampana: row.nombre_campana || '',
    detalleCampana: row.detalle_campana || undefined,
    formularioEstado: (row.formulario_estado || 'activo') as EstadoFormularioProductora,
    formularioCreatedAt: row.formulario_created_at ? new Date(row.formulario_created_at) : undefined,
    formularioCreatedBy: row.formulario_created_by || undefined,
    // Context
    productoraGastoId: row.productora_gasto_id,
    facturaEmitidaA: row.comprobante_factura_emitida_a || undefined,
    empresaContext: row.empresa || undefined,
    empresaPrograma: row.empresa_programa || undefined,
    fechaComprobante: row.fecha_comprobante || undefined,
    acuerdoPago: row.comprobante_acuerdo_pago || undefined,
    formaPago: row.comprobante_forma_pago || undefined,
    pais: row.pais || 'argentina',
    contextRubro: row.context_rubro || undefined,
    contextSubRubro: row.context_sub_rubro || undefined,
  };
}

export function validateCreate(input: CreateGastoProductoraInput): GastoProductoraValidationResult {
  const errors: { field: string; message: string }[] = [];

  if (!input.nombreCampana?.trim()) {
    errors.push({ field: 'nombreCampana', message: 'Debe ingresar un nombre de campaña' });
  }
  if (!input.rubro?.trim()) {
    errors.push({ field: 'rubro', message: 'Debe seleccionar un rubro' });
  }
  if (!input.subRubro?.trim()) {
    errors.push({ field: 'subRubro', message: 'Debe seleccionar un subrubro' });
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

export async function getAll(): Promise<{ data: GastoProductora[]; error: string | null }> {
  const result = await productoraRepo.findAll();

  if (result.error) {
    console.error('Error fetching gastos productora:', result.error);
    return { data: [], error: result.error.message };
  }

  return { data: result.data.map(mapFromDB), error: null };
}

export async function getById(id: string): Promise<{ data: GastoProductora | null; error: string | null }> {
  const result = await productoraRepo.findById(id);

  if (result.error) {
    console.error('Error fetching gasto productora:', result.error);
    return { data: null, error: result.error.message };
  }

  return { data: result.data ? mapFromDB(result.data) : null, error: null };
}

export async function createMultiple(input: CreateMultipleGastosProductoraInput): Promise<{ data: GastoProductora[]; error: string | null }> {
  if (!input.gastos || input.gastos.length === 0) {
    return { data: [], error: 'Debe proporcionar al menos un gasto' };
  }

  if (!input.nombreCampana?.trim()) {
    return { data: [], error: 'Debe ingresar un nombre de campaña' };
  }
  if (!input.rubro?.trim()) {
    return { data: [], error: 'Debe seleccionar un rubro' };
  }
  if (!input.subRubro?.trim()) {
    return { data: [], error: 'Debe seleccionar un subrubro' };
  }

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
    if (!g.facturaEmitidaA?.trim()) {
      return { data: [], error: `Gasto #${i + 1}: Debe seleccionar "Factura emitida a"` };
    }
    if (!g.empresaContext?.trim()) {
      return { data: [], error: `Gasto #${i + 1}: Debe seleccionar una empresa` };
    }
    if (!g.empresaPrograma?.trim()) {
      return { data: [], error: `Gasto #${i + 1}: Debe seleccionar Empresa/Programa` };
    }
    if (!g.formaPago?.trim()) {
      return { data: [], error: `Gasto #${i + 1}: Debe seleccionar una forma de pago` };
    }
    if (g.formaPago === 'cheque' && !g.acuerdoPago?.trim()) {
      return { data: [], error: `Gasto #${i + 1}: Debe seleccionar un acuerdo de pago` };
    }
  }

  const formulario: ProductoraFormularioInsert = {
    mes_gestion: input.mesGestion || new Date().toISOString().slice(0, 7),
    unidad_negocio: input.unidadNegocio || null,
    categoria_negocio: input.categoriaNegocio || null,
    rubro: input.rubro || null,
    sub_rubro: input.subRubro || null,
    nombre_campana: input.nombreCampana || null,
    detalle_campana: input.detalleCampana || null,
    estado: 'activo',
    created_by: input.createdBy || null,
  };

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
        estado_pago: 'creado',
        created_by: input.createdBy || null,
      },
      context: {
        factura_emitida_a: g.facturaEmitidaA || null,
        empresa: g.empresaContext || null,
        empresa_programa: g.empresaPrograma || null,
        fecha_comprobante: g.fechaComprobante || null,
        acuerdo_pago: g.acuerdoPago || null,
        forma_pago: g.formaPago || null,
        pais: g.pais || 'argentina',
        rubro: input.rubro || null,
        sub_rubro: input.subRubro || null,
      },
    };
  });

  const result = await productoraRepo.createWithMultipleGastos({
    formulario,
    gastos: gastosData,
  });

  if (result.error) {
    console.error('Error creating multiple gastos:', result.error);
    return { data: [], error: result.error.message };
  }

  return { data: result.data.map(mapFromDB), error: null };
}

export async function addGastoToFormulario(
  formularioId: string,
  input: {
    proveedor: string;
    razonSocial: string;
    neto: number;
    iva?: number;
    empresa?: string;
    observaciones?: string;
    facturaEmitidaA?: string;
    empresaContext?: string;
    empresaPrograma?: string;
    fechaComprobante?: string;
    acuerdoPago?: string;
    formaPago?: string;
    pais?: string;
    createdBy?: string;
    numeroFactura?: string;
  }
): Promise<{ data: GastoProductora | null; error: string | null }> {
  const neto = input.neto;
  const iva = input.iva ?? DEFAULT_IVA;
  const importeTotal = neto * (1 + iva / 100);

  const result = await productoraRepo.addGastoToFormulario(formularioId, {
    gasto: {
      proveedor: input.proveedor,
      razon_social: input.razonSocial || null,
      moneda: DEFAULT_MONEDA,
      neto,
      iva,
      importe_total: importeTotal,
      empresa: input.empresa || null,
      observaciones: input.observaciones || null,
      estado: 'pendiente',
      estado_pago: 'creado',
      created_by: input.createdBy || null,
    },
    context: {
      factura_emitida_a: input.facturaEmitidaA || null,
      empresa: input.empresaContext || null,
      empresa_programa: input.empresaPrograma || null,
      fecha_comprobante: input.fechaComprobante || null,
      acuerdo_pago: input.acuerdoPago || null,
      forma_pago: input.formaPago || null,
      pais: input.pais || 'argentina',
    },
  });

  if (result.error || !result.data) {
    console.error('Error adding gasto to formulario:', result.error);
    return { data: null, error: result.error?.message || 'Error al agregar el gasto' };
  }

  return { data: mapFromDB(result.data), error: null };
}

export async function update(input: UpdateGastoProductoraInput): Promise<{ data: GastoProductora | null; error: string | null }> {
  const { id, ...fields } = input;

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

  // Recalculate total
  if (fields.neto !== undefined || fields.iva !== undefined) {
    const currentResult = await productoraRepo.findById(id);
    if (currentResult.data) {
      const neto = fields.neto ?? currentResult.data.neto;
      const iva = fields.iva ?? currentResult.data.iva;
      gastoUpdate.importe_total = neto * (1 + iva / 100);
    }
  }

  // Formulario (header)
  if (fields.mesGestion !== undefined) formularioUpdate.mes_gestion = fields.mesGestion;
  if (fields.unidadNegocio !== undefined) formularioUpdate.unidad_negocio = fields.unidadNegocio;
  if (fields.categoriaNegocio !== undefined) formularioUpdate.categoria_negocio = fields.categoriaNegocio;
  if (fields.rubro !== undefined) formularioUpdate.rubro = fields.rubro;
  if (fields.subRubro !== undefined) formularioUpdate.sub_rubro = fields.subRubro;
  if (fields.nombreCampana !== undefined) formularioUpdate.nombre_campana = fields.nombreCampana;
  if (fields.detalleCampana !== undefined) formularioUpdate.detalle_campana = fields.detalleCampana;

  // Consolidated fields -> comprobante
  if (fields.facturaEmitidaA !== undefined) gastoUpdate.factura_emitida_a = fields.facturaEmitidaA;
  if (fields.acuerdoPago !== undefined) gastoUpdate.acuerdo_pago = fields.acuerdoPago;
  if (fields.formaPago !== undefined) gastoUpdate.forma_pago = fields.formaPago;

  // Context
  if (fields.empresaContext !== undefined) contextUpdate.empresa = fields.empresaContext;
  if (fields.empresaPrograma !== undefined) contextUpdate.empresa_programa = fields.empresaPrograma;
  if (fields.fechaComprobante !== undefined) contextUpdate.fecha_comprobante = fields.fechaComprobante;
  if (fields.pais !== undefined) contextUpdate.pais = fields.pais;

  const result = await productoraRepo.update(id, {
    gasto: Object.keys(gastoUpdate).length > 0 ? gastoUpdate : undefined,
    formulario: Object.keys(formularioUpdate).length > 0 ? formularioUpdate : undefined,
    context: Object.keys(contextUpdate).length > 0 ? contextUpdate : undefined,
  });

  if (result.error) {
    console.error('Error updating gasto productora:', result.error);
    return { data: null, error: result.error.message };
  }

  return { data: result.data ? mapFromDB(result.data) : null, error: null };
}

export async function remove(id: string): Promise<{ success: boolean; error: string | null }> {
  const result = await productoraRepo.remove(id);

  if (result.error) {
    console.error('Error deleting gasto productora:', result.error);
    return { success: false, error: result.error.message };
  }

  return { success: true, error: null };
}
