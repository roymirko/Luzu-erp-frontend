export interface OrdenPublicidad {
  id: string;
  fecha: string;
  mesServicio: string;
  responsable: string;
  ordenPublicidad: string;
  totalVenta: string;
  unidadNegocio: string;
  categoriaNegocio: string;
  proyecto: string;
  razonSocial: string;
  categoria: string;
  empresaAgencia: string;
  marca: string;
  nombreCampana: string;
  acuerdoPago: string;
  tipoImporte: 'canje' | 'factura';
  observaciones: string;
  estadoOp: 'pendiente' | 'aprobado' | 'rechazado';
  items: ItemOrdenPublicidad[];
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

export interface ItemOrdenPublicidad {
  id: string;
  programa: string;
  monto: string;
  ncPrograma: string;
  ncPorcentaje: string;
  proveedorFee: string;
  feePrograma: string;
  feePorcentaje: string;
  implementacion: string;
  talentos: string;
  tecnica: string;
}

export interface CreateOrdenPublicidadInput {
  mesServicio: string;
  responsable: string;
  ordenPublicidad: string;
  totalVenta: string;
  unidadNegocio: string;
  categoriaNegocio: string;
  proyecto?: string;
  razonSocial: string;
  categoria: string;
  empresaAgencia: string;
  marca: string;
  nombreCampana: string;
  acuerdoPago: string;
  tipoImporte: 'canje' | 'factura';
  observaciones?: string;
  items: CreateItemOrdenPublicidadInput[];
  createdBy?: string;
}

export interface CreateItemOrdenPublicidadInput {
  id?: string;
  programa: string;
  monto: string;
  ncPrograma?: string;
  ncPorcentaje?: string;
  proveedorFee?: string;
  feePrograma?: string;
  feePorcentaje?: string;
  implementacion?: string;
  talentos?: string;
  tecnica?: string;
}

export interface UpdateOrdenPublicidadInput extends Partial<CreateOrdenPublicidadInput> {
  id: string;
}

export interface OrdenPublicidadValidationError {
  field: string;
  message: string;
}

export interface OrdenPublicidadValidationResult {
  valid: boolean;
  errors: OrdenPublicidadValidationError[];
}
