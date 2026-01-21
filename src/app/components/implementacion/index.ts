export { CampaignInfoCard } from './CampaignInfoCard';
export { CargaDatosSection, type CargaDatosSectionErrors } from './CargaDatosSection';
export { CargaImportesSection, type ImportesErrors, type ProgramaConPresupuesto } from './CargaImportesSection';
export { GastoImporteCard, type GastoImporteErrors } from './GastoImporteCard';
export { ObservacionesSection } from './ObservacionesSection';
export { ResumenPresupuestario } from './ResumenPresupuestario';
export { StatusBadge } from './StatusBadge';
export { ApprovalControls } from './ApprovalControls';

// UI-specific types for form state management
export type EstadoOP = 'pendiente' | 'activo' | 'cerrado' | 'anulado';
export type EstadoPGM = 'pendiente' | 'pagado' | 'anulado';

export interface BloqueImporte {
  id: string;
  programa: string;
  empresaPgm: string;
  itemOrdenPublicidadId?: string;
  facturaEmitidaA: string;
  empresa: string;
  fechaComprobante: string;
  proveedor: string;
  razonSocial: string;
  condicionPago: string;
  neto: string;
  documentoAdjunto?: string;
  estadoPgm: EstadoPGM;
}
