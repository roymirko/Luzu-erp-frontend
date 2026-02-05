import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { ActionCard } from '@/app/components/ui/action-card';
import { TablaComprobantes } from '@/app/components/shared/TablaComprobantes';
import { DialogNuevoComprobante } from '@/app/components/shared/DialogNuevoComprobante';
import { DialogAdminComprobante } from './DialogAdminComprobante';
import { DialogIngresoAdmin } from './DialogIngresoAdmin';
import * as comprobantesService from '@/app/services/comprobantesService';
import type { ComprobanteWithContext, Comprobante } from '@/app/types/comprobantes';

export function Administracion() {
  const [comprobantes, setComprobantes] = useState<ComprobanteWithContext[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNuevo, setShowNuevo] = useState(false);
  const [selectedComprobante, setSelectedComprobante] = useState<ComprobanteWithContext | null>(null);
  const [selectedIngreso, setSelectedIngreso] = useState<ComprobanteWithContext | null>(null);

  const fetchComprobantes = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await comprobantesService.getAllWithContext();
      if (error) {
        console.error('Error fetching comprobantes:', error);
        return;
      }
      setComprobantes(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComprobantes();
  }, [fetchComprobantes]);

  const handleRowClick = (comprobante: ComprobanteWithContext) => {
    if (comprobante.tipoMovimiento === 'ingreso') {
      setSelectedIngreso(comprobante);
    } else {
      setSelectedComprobante(comprobante);
    }
  };

  const handleComprobanteCreado = (comprobante: Comprobante) => {
    fetchComprobantes();
    setShowNuevo(false);
  };

  const handleComprobanteUpdated = (comprobante: Comprobante) => {
    fetchComprobantes();
    setSelectedComprobante(null);
    setSelectedIngreso(null);
  };

  return (
    <div className="space-y-6">
      <ActionCard
        title="Nuevo Formulario"
        description="Cargar nuevo ingreso/egreso"
        icon={Plus}
        onClick={() => setShowNuevo(true)}
      />

      <TablaComprobantes
        comprobantes={comprobantes}
        loading={loading}
        onRowClick={handleRowClick}
        title="Comprobantes"
      />

      <DialogNuevoComprobante
        open={showNuevo}
        onOpenChange={setShowNuevo}
        onComprobanteCreado={handleComprobanteCreado}
        defaultTipoMovimiento="ingreso"
      />

      <DialogAdminComprobante
        open={!!selectedComprobante}
        onOpenChange={(open) => !open && setSelectedComprobante(null)}
        comprobante={selectedComprobante}
        onComprobanteUpdated={handleComprobanteUpdated}
      />

      <DialogIngresoAdmin
        open={!!selectedIngreso}
        onOpenChange={(open) => !open && setSelectedIngreso(null)}
        comprobante={selectedIngreso}
        onComprobanteUpdated={handleComprobanteUpdated}
      />
    </div>
  );
}
