import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/app/components/ui/alert-dialog';
import type { EstadoOP, EstadoPGM } from '@/app/contexts/ImplementacionContext';

interface ApprovalControlsProps {
  estado: EstadoOP;
  estadoPago: EstadoPGM;
  onApprove: () => void;
  onReject: () => void;
  onMarkPaid: () => void;
  loading?: boolean;
}

export function ApprovalControls({
  estado,
  estadoPago,
  onApprove,
  onReject,
  onMarkPaid,
  loading = false,
}: ApprovalControlsProps) {
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const handleRejectConfirm = () => {
    setShowRejectDialog(false);
    onReject();
  };

  // Pendiente de aprobación: show Rechazar / Aprobar buttons
  if (estado === 'pendiente') {
    return (
      <>
        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRejectDialog(true)}
            disabled={loading}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 text-xs"
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Rechazar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onApprove}
            disabled={loading}
            className="border-[#10b981] text-[#10b981] hover:bg-[#10b981]/10 text-xs"
          >
            <Check className="h-3.5 w-3.5 mr-1" />
            Aprobar
          </Button>
        </div>

        <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar rechazo</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Estás seguro de rechazar este gasto? Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRejectConfirm}
                disabled={loading}
                className="bg-red-500 hover:bg-red-600"
              >
                Rechazar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // Activo + pendiente de pago: show "Marcar como pagado" button
  if (estado === 'activo' && estadoPago === 'pendiente-pago') {
    return (
      <div className="flex justify-end gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onMarkPaid}
          disabled={loading}
          className="border-[#0070ff] text-[#0070ff] hover:bg-[#0070ff]/10 text-xs"
        >
          <Check className="h-3.5 w-3.5 mr-1" />
          Marcar como pagado
        </Button>
      </div>
    );
  }

  // Pagado or Rechazado: no controls (read-only)
  return null;
}
