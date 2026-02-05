import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/app/components/ui/utils';
import { useTheme } from '@/app/contexts/ThemeContext';
import { Button } from '@/app/components/ui/button';
import { TablaComprobantes } from '@/app/components/shared/TablaComprobantes';
import { DialogNuevoComprobante } from '@/app/components/shared/DialogNuevoComprobante';
import { DialogAdminComprobante } from '@/app/components/administracion/DialogAdminComprobante';
import { DialogIngresoAdmin } from '@/app/components/administracion/DialogIngresoAdmin';
import * as comprobantesService from '@/app/services/comprobantesService';
import type { ComprobanteWithContext, Comprobante } from '@/app/types/comprobantes';

export function Finanzas() {
  const { isDark } = useTheme();
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-gray-900")}>
            Finanzas
          </h1>
          <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>
            Gestión de comprobantes de todas las áreas
          </p>
        </div>
        <Button
          onClick={() => setShowNuevo(true)}
          className="gap-2 bg-[#fb2c36] hover:bg-[#fb2c36]/90 text-white"
        >
          <Plus className="h-4 w-4" />
          Nuevo Ingreso
        </Button>
      </div>

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
