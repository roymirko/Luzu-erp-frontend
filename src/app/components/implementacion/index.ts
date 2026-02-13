export { CampaignInfoCard } from './CampaignInfoCard';
export { CargaDatosSection, type CargaDatosSectionErrors } from './CargaDatosSection';
export { CargaImportesSection, type ImportesErrors, type ProgramaConPresupuesto } from './CargaImportesSection';
export { ObservacionesSection } from './ObservacionesSection';
export { ResumenPresupuestario } from './ResumenPresupuestario';
export { StatusBadge, type EstadoOP, type EstadoPGM } from './StatusBadge';
export { ApprovalControls } from './ApprovalControls';

// Re-export GastoCardErrors as GastoImporteErrors for backwards compatibility
export type { GastoCardErrors as GastoImporteErrors } from '@/app/components/shared';

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
  numeroComprobante: string;
  formaPago: string;
  neto: string;
  observaciones: string;
  documentoAdjunto?: string;
  estadoPgm: EstadoPGM;
}
