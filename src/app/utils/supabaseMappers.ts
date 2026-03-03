import { User, Area, Role, UserAreaRole, AuditLog, RoleType, LogAction, LogEntity, LogResult, Client } from '../types/business';
import { FormularioData } from '../contexts/FormulariosContext';

// HELPERS
const toDate = (str: string | Date | null | undefined): Date => {
    if (!str) return new Date();
    return typeof str === 'string' ? new Date(str) : str;
};

// USERS (usuarios)
export const mapUserFromDB = (dbUser: any): User => ({
    id: dbUser.id,
    email: dbUser.correo ?? dbUser.email, // fallback if older seed
    firstName: dbUser.nombre ?? dbUser.first_name,
    lastName: dbUser.apellido ?? dbUser.last_name,
    avatar: dbUser.avatar,
    active: dbUser.activo ?? dbUser.active,
    createdAt: toDate(dbUser.fecha_creacion ?? dbUser.creado_el ?? dbUser.created_at),
    updatedAt: toDate(dbUser.fecha_actualizacion ?? dbUser.actualizado_el ?? dbUser.updated_at),
    lastLogin: dbUser.ultimo_acceso ? toDate(dbUser.ultimo_acceso) : (dbUser.last_login ? toDate(dbUser.last_login) : undefined),
    createdBy: dbUser.creado_por ?? dbUser.created_by,
    metadata: {
        ...(dbUser.metadatos ?? dbUser.metadata ?? {}),
        userType: dbUser.user_type
    }
});

export const mapUserToDB = (user: Partial<User>) => {
    const dbUser: any = {};
    if (user.id) dbUser.id = user.id;
    if (user.email) dbUser.email = user.email;
    if (user.firstName) dbUser.first_name = user.firstName;
    if (user.lastName) dbUser.last_name = user.lastName;
    if (user.avatar !== undefined) dbUser.avatar = user.avatar;
    if (user.active !== undefined) dbUser.active = user.active;
    if (user.lastLogin) dbUser.last_login = user.lastLogin.toISOString();
    if (user.createdBy) dbUser.creado_por = user.createdBy;
    if (user.metadata) dbUser.metadata = user.metadata;
    return dbUser;
};

// AREAS (areas)
export const mapAreaFromDB = (dbArea: any): Area => ({
    id: dbArea.id,
    name: dbArea.nombre ?? dbArea.name,
    code: dbArea.codigo ?? dbArea.code,
    description: dbArea.descripcion ?? dbArea.description,
    manager: dbArea.responsable_id ?? dbArea.manager_id,
    active: dbArea.activo ?? dbArea.active,
    createdAt: toDate(dbArea.fecha_creacion ?? dbArea.creado_el ?? dbArea.created_at),
    updatedAt: toDate(dbArea.fecha_actualizacion ?? dbArea.actualizado_el ?? dbArea.updated_at),
    createdBy: dbArea.creado_por ?? dbArea.created_by,
    metadata: dbArea.metadatos ?? dbArea.metadata ?? {}
});

export const mapAreaToDB = (area: Partial<Area>) => {
    const dbArea: any = {};
    if (area.id) dbArea.id = area.id;
    if (area.name) dbArea.name = area.name;
    if (area.code) dbArea.code = area.code;
    if (area.description) dbArea.description = area.description;
    if (area.manager) dbArea.manager_id = area.manager;
    if (area.active !== undefined) dbArea.active = area.active;
    if (area.createdBy) dbArea.creado_por = area.createdBy;
    if (area.metadata) dbArea.metadata = area.metadata;
    return dbArea;
};

// ROLES
export const mapRoleFromDB = (dbRole: any): Role => ({
    id: dbRole.id,
    name: dbRole.name as RoleType,
    description: dbRole.description,
    permissions: dbRole.permissions || [],
    createdAt: toDate(dbRole.created_at)
});

// USER AREA ROLES (usuario_area_roles)
export const mapUserAreaRoleFromDB = (dbUar: any): UserAreaRole => ({
    id: dbUar.id,
    userId: dbUar.usuario_id ?? dbUar.user_id,
    areaId: dbUar.area_id,
    roleId: dbUar.rol_id ?? dbUar.role_id,
    assignedAt: toDate(dbUar.asignado_el ?? dbUar.assigned_at),
    assignedBy: dbUar.asignado_por ?? dbUar.assigned_by
});

export const mapUserAreaRoleToDB = (uar: Partial<UserAreaRole>) => {
    const dbUar: any = {};
    if (uar.userId) dbUar.usuario_id = uar.userId;
    if (uar.areaId) dbUar.area_id = uar.areaId;
    if (uar.roleId) dbUar.rol_id = uar.roleId;
    if (uar.assignedBy) dbUar.assigned_by = uar.assignedBy;
    return dbUar;
};

// LOGS (registros_auditoria)
export const mapLogFromDB = (dbLog: any): AuditLog => {
    const rawResult = dbLog.resultado ?? dbLog.result ?? 'success';
    return {
        id: dbLog.id,
        timestamp: toDate(dbLog.fecha ?? dbLog.timestamp),
        userId: dbLog.usuario_id ?? dbLog.user_id,
        userEmail: dbLog.usuario_correo ?? dbLog.user_email ?? '',
        userRole: (dbLog.usuario_rol as RoleType) || (dbLog.user_role as RoleType) || RoleType.VISUALIZADOR,
        action: (dbLog.accion ?? dbLog.action) as LogAction,
        entity: (dbLog.entidad ?? dbLog.entity) as LogEntity,
        entityId: dbLog.entidad_id ?? dbLog.entity_id,
        entityName: dbLog.entidad_nombre ?? dbLog.entity_name ?? '',
        details: dbLog.detalles ?? dbLog.details ?? '',
        result: mapResultFromDB(rawResult),
        metadata: dbLog.metadatos ?? dbLog.metadata,
        ipAddress: dbLog.ip ?? dbLog.ip_address,
        userAgent: dbLog.user_agent
    };
};

// Map result from app (Spanish) to DB (English)
const mapResultToDB = (result: LogResult): string => {
    const map: Record<LogResult, string> = {
        'exito': 'success',
        'error': 'error',
        'advertencia': 'warning'
    };
    return map[result] || 'success';
};

// Map result from DB (English) to app (Spanish)
const mapResultFromDB = (result: string): LogResult => {
    const map: Record<string, LogResult> = {
        'success': 'exito',
        'error': 'error',
        'warning': 'advertencia'
    };
    return (map[result] || 'exito') as LogResult;
};

export const mapLogToDB = (log: Partial<AuditLog>) => {
    const dbLog: any = {};
    if (log.userId) dbLog.user_id = log.userId;
    if (log.userEmail) dbLog.user_email = log.userEmail;
    if (log.userRole) dbLog.user_role = log.userRole;
    if (log.action) dbLog.action = log.action;
    if (log.entity) dbLog.entity = log.entity;
    if (log.entityId) dbLog.entity_id = log.entityId;
    if (log.entityName) dbLog.entity_name = log.entityName;
    if (log.details) dbLog.details = log.details;
    if (log.result) dbLog.result = mapResultToDB(log.result);
    if (log.metadata) dbLog.metadata = log.metadata;
    return dbLog;
};

// FORMS
// FORMS
export const mapFormFromDB = (dbForm: any, dbItems: any[] = []): FormularioData => ({
     id: dbForm.id,
     fecha: dbForm.fecha,
     mesServicio: dbForm.mes_servicio,
     responsable: dbForm.responsable,
     ordenPublicidad: dbForm.orden_publicidad,
     totalVenta: dbForm.total_venta,
     unidadNegocio: dbForm.unidad_negocio,
     categoriaNegocio: dbForm.categoria_negocio,
     proyecto: dbForm.proyecto,
     razonSocial: dbForm.razon_social,
     categoria: dbForm.categoria,
     empresaAgencia: dbForm.empresa_agencia,
     marca: dbForm.marca,
     nombreCampana: dbForm.nombre_campana,
     acuerdoPago: dbForm.acuerdo_pago,
     formaPago: dbForm.forma_pago,
     numeroComprobante: dbForm.numero_comprobante,
     fechaComprobante: dbForm.fecha_comprobante,
     facturaEmitidaA: dbForm.factura_emitida_a,
     empresa: dbForm.empresa,
     tipoImporte: dbForm.tipo_importe,
     observaciones: dbForm.observaciones,
     importeRows: dbItems.map(mapFormItemFromDB),
     createdAt: toDate(dbForm.fecha_creacion ?? dbForm.creado_el ?? dbForm.created_at),
     updatedAt: toDate(dbForm.fecha_actualizacion ?? dbForm.actualizado_el ?? dbForm.updated_at),
     createdBy: dbForm.creado_por ?? dbForm.created_by
 });

export const mapFormToDB = (form: Partial<FormularioData>) => {
     const dbForm: any = {};
     if (form.id) dbForm.id = form.id;
     if (form.fecha) dbForm.fecha = form.fecha;
     if (form.mesServicio) dbForm.mes_servicio = form.mesServicio;
     if (form.responsable) dbForm.responsable = form.responsable;
     if (form.ordenPublicidad) dbForm.orden_publicidad = form.ordenPublicidad;
     if (form.totalVenta) dbForm.total_venta = form.totalVenta;
     if (form.unidadNegocio) dbForm.unidad_negocio = form.unidadNegocio;
     if (form.categoriaNegocio) dbForm.categoria_negocio = form.categoriaNegocio;
     if (form.proyecto) dbForm.proyecto = form.proyecto;
     if (form.razonSocial) dbForm.razon_social = form.razonSocial;
     if (form.categoria) dbForm.categoria = form.categoria;
     if (form.empresaAgencia) dbForm.empresa_agencia = form.empresaAgencia;
     if (form.marca) dbForm.marca = form.marca;
     if (form.nombreCampana) dbForm.nombre_campana = form.nombreCampana;
     if (form.acuerdoPago) dbForm.acuerdo_pago = form.acuerdoPago;
     if (form.formaPago) dbForm.forma_pago = form.formaPago;
     if (form.numeroComprobante) dbForm.numero_comprobante = form.numeroComprobante;
     if (form.fechaComprobante) dbForm.fecha_comprobante = form.fechaComprobante;
     if (form.facturaEmitidaA) dbForm.factura_emitida_a = form.facturaEmitidaA;
     if (form.empresa) dbForm.empresa = form.empresa;
     if (form.tipoImporte) dbForm.tipo_importe = form.tipoImporte;
     if (form.observaciones) dbForm.observaciones = form.observaciones;
     if (form.createdBy) dbForm.creado_por = form.createdBy;
     if (form.updatedAt) dbForm.fecha_actualizacion = form.updatedAt.toISOString();
     // fecha_creacion usually handled by default
     return dbForm;
 };

// FORM ITEMS (items_orden_publicidad)
export const mapFormItemFromDB = (dbItem: any): any => ({
    id: dbItem.id,
    programa: dbItem.programa,
    monto: dbItem.monto,
    ncPrograma: dbItem.nc_programa,
    ncPorcentaje: dbItem.nc_porcentaje,
    proveedorFee: dbItem.proveedor_fee,
    feePrograma: dbItem.fee_programa,
    feePorcentaje: dbItem.fee_porcentaje,
    implementacion: dbItem.implementacion,
    talentos: dbItem.talentos,
    tecnica: dbItem.tecnica
});

export const mapFormItemToDB = (item: any, formId: string) => ({
    orden_publicidad_id: formId,
    programa: item.programa,
    monto: item.monto,
    nc_programa: item.ncPrograma,
    nc_porcentaje: item.ncPorcentaje,
    proveedor_fee: item.proveedorFee,
    fee_programa: item.feePrograma,
    fee_porcentaje: item.feePorcentaje,
    implementacion: item.implementacion,
    talentos: item.talentos,
    tecnica: item.tecnica
});

export const mapClientFromDB = (dbClient: any): Client => ({
    id: dbClient.id,
    businessName: dbClient.razon_social ?? dbClient.business_name,
    cuit: dbClient.cuit,
    address: dbClient.direccion ?? dbClient.address,
    companyName: dbClient.empresa ?? dbClient.company_name,
    active: dbClient.activo ?? dbClient.active,
    createdAt: toDate(dbClient.creado_el ?? dbClient.created_at),
    createdBy: dbClient.creado_por ?? dbClient.created_by
});

export const mapClientToDB = (client: Partial<Client>) => {
    const dbClient: any = {};
    if (client.businessName) dbClient.razon_social = client.businessName;
    if (client.cuit) dbClient.cuit = client.cuit;
    if (client.address !== undefined) dbClient.direccion = client.address;
    if (client.companyName !== undefined) dbClient.empresa = client.companyName;
    if (client.active !== undefined) dbClient.activo = client.active;
    if (client.createdBy) dbClient.creado_por = client.createdBy;
    return dbClient;
};

// ============================================
// IMPLEMENTACIÓN: Gastos
// ============================================

import type { GastoImplementacion, BloqueImporte, EstadoOP, EstadoPGM } from '../contexts/ImplementacionContext';

// Map DB gastos_implementacion row -> App GastoImplementacion
export const mapGastoFromDB = (dbExpense: any, dbItems: any[] = []): GastoImplementacion => ({
    id: dbExpense.id,
    estadoOP: (dbExpense.estado || 'pendiente') as EstadoOP,
    fechaRegistro: dbExpense.fecha_registro ? String(dbExpense.fecha_registro).split('T')[0] : '',
    responsable: dbExpense.responsable || '',
    unidadNegocio: dbExpense.unidad_negocio || '',
    categoriaNegocio: dbExpense.categoria_negocio || '',
    ordenPublicidad: dbExpense.orden_publicidad || '',
    presupuesto: dbExpense.presupuesto ? String(dbExpense.presupuesto) : '0',
    cantidadProgramas: dbExpense.cantidad_programas || 0,
    programasDisponibles: dbExpense.programas_disponibles || [],
    sector: dbExpense.sector || 'Implementación',
    rubro: dbExpense.rubro || 'Gasto de venta',
    subRubro: dbExpense.sub_rubro || '',
    nombreCampana: dbExpense.nombre_campana || '',
    acuerdoPago: dbExpense.acuerdo_pago || '',
    facturaEmitidaA: dbExpense.factura_emitida_a || '',
    empresa: dbExpense.empresa || '',
    conceptoGasto: dbExpense.concepto_gasto || '',
    observaciones: dbExpense.observaciones || '',
    importes: dbItems.map(mapBloqueImporteFromDB),
    idFormularioComercial: dbExpense.id_formulario_comercial || undefined,
    formItemId: (dbExpense.item_orden_publicidad_id ?? dbExpense.form_item_id) ?? undefined
});

// Map App GastoImplementacion -> DB gastos_implementacion row
export const mapGastoToDB = (gasto: Partial<GastoImplementacion>) => {
    const db: any = {};
    if (gasto.estadoOP) db.estado = gasto.estadoOP;
    if (gasto.fechaRegistro) db.fecha_registro = gasto.fechaRegistro;
    if (gasto.responsable) db.responsable = gasto.responsable;
    if (gasto.unidadNegocio) db.unidad_negocio = gasto.unidadNegocio;
    if (gasto.categoriaNegocio !== undefined) db.categoria_negocio = gasto.categoriaNegocio;
    if (gasto.ordenPublicidad) db.orden_publicidad = gasto.ordenPublicidad;
    if (gasto.presupuesto) db.presupuesto = parseFloat(gasto.presupuesto) || 0;
    if (gasto.cantidadProgramas !== undefined) db.cantidad_programas = gasto.cantidadProgramas;
    if (gasto.programasDisponibles) db.programas_disponibles = gasto.programasDisponibles;
    if (gasto.sector) db.sector = gasto.sector;
    if (gasto.rubro) db.rubro = gasto.rubro;
    if (gasto.subRubro) db.sub_rubro = gasto.subRubro;
    if (gasto.nombreCampana) db.nombre_campana = gasto.nombreCampana;
    if (gasto.acuerdoPago) db.acuerdo_pago = gasto.acuerdoPago;
    if (gasto.facturaEmitidaA) db.factura_emitida_a = gasto.facturaEmitidaA;
    if (gasto.empresa) db.empresa = gasto.empresa;
    if (gasto.conceptoGasto !== undefined) db.concepto_gasto = gasto.conceptoGasto;
    if (gasto.observaciones !== undefined) db.observaciones = gasto.observaciones;
    if (gasto.idFormularioComercial) db.id_formulario_comercial = gasto.idFormularioComercial;
    if (gasto.formItemId) db.item_orden_publicidad_id = gasto.formItemId;
    if (gasto.fechaRegistro) {
        const date = new Date(gasto.fechaRegistro);
        db.anio = date.getFullYear();
        db.mes = date.getMonth() + 1;
    }
    return db;
};

// Map DB items_gasto_implementacion row -> App BloqueImporte
export const mapBloqueImporteFromDB = (dbItem: any): BloqueImporte => ({
    id: dbItem.id,
    programa: dbItem.descripcion || '',
    empresaPgm: dbItem.tipo_proveedor || '',
    fechaComprobante: dbItem.fecha_factura ? String(dbItem.fecha_factura).split('T')[0] : '',
    proveedor: dbItem.proveedor || '',
    razonSocial: dbItem.razon_social || '',
    condicionPago: dbItem.condicion_pago || '',
    neto: dbItem.neto ? String(dbItem.neto) : '',
    documentoAdjunto: dbItem.adjuntos?.[0] || undefined,
    estadoPgm: (dbItem.estado_pago || 'pendiente-pago') as EstadoPGM
});

// Map App BloqueImporte -> DB items_gasto_implementacion row
export const mapBloqueImporteToDB = (item: BloqueImporte, expenseId: string) => ({
    gasto_id: expenseId,
    tipo_proveedor: item.empresaPgm || 'Directo',
    proveedor: item.proveedor,
    razon_social: item.razonSocial,
    descripcion: item.programa,
    rubro: 'Gasto de venta',
    sector: 'Implementación',
    moneda: 'ARS',
    neto: parseFloat(item.neto) || 0,
    iva: 21,
    importe_total: (parseFloat(item.neto) || 0) * 1.21,
    fecha_factura: item.fechaComprobante || null,
    condicion_pago: item.condicionPago,
    estado_pago: item.estadoPgm || 'creado',
    adjuntos: item.documentoAdjunto ? [item.documentoAdjunto] : null
});

export interface ImplementationExpense {
    id: string;
    expenseId: string;
    proveedor?: string;
    razonSocial?: string;
    proveedorId?: string | null;
    condicionPago?: string;
    neto?: number;
    fechaComprobante?: string;
}

export const mapImplementationExpenseFromDB = (dbItem: any): ImplementationExpense => ({
    id: dbItem.id,
    expenseId: dbItem.gasto_id ?? dbItem.expense_id,
    proveedor: dbItem.proveedor || '',
    razonSocial: dbItem.razon_social || '',
    proveedorId: dbItem.proveedor_id ?? null,
    condicionPago: dbItem.condicion_pago || '',
    neto: typeof dbItem.neto === 'number' ? dbItem.neto : Number(dbItem.neto || 0),
    fechaComprobante: dbItem.fecha_factura ? String(dbItem.fecha_factura) : ''
});

export const mapImplementationExpenseToDB = (item: Partial<ImplementationExpense>) => {
    const db: any = {};
    if (item.expenseId) db.gasto_id = item.expenseId;
    if (item.proveedor !== undefined) db.proveedor = item.proveedor;
    if (item.razonSocial !== undefined) db.razon_social = item.razonSocial;

    if (item.condicionPago !== undefined) db.condicion_pago = item.condicionPago;
    if (item.neto !== undefined) db.neto = item.neto;
    if (item.fechaComprobante !== undefined) db.fecha_factura = item.fechaComprobante;
    return db;
};
