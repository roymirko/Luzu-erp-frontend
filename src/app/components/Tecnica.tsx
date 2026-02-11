import { TablaTecnica } from './TablaTecnica';

interface TecnicaProps {
  onOpen?: (formId: string, itemId?: string) => void;
  onOpenStandalone?: (gastoId: string) => void;
  onNew?: () => void;
}

export function Tecnica({ onOpen, onOpenStandalone, onNew }: TecnicaProps) {
  return (
    <div className="space-y-6">
      <TablaTecnica onOpen={onOpen} onOpenStandalone={onOpenStandalone} onNew={onNew} />
    </div>
  );
}
