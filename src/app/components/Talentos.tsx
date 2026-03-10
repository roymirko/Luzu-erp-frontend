import { TablaTalentos } from './TablaTalentos';

interface TalentosProps {
  onOpen?: (formId: string, itemId?: string) => void;
  onOpenStandalone?: (gastoId: string) => void;
  onNew?: () => void;
}

export function Talentos({ onOpen, onOpenStandalone, onNew }: TalentosProps) {
  return (
    <div className="space-y-6">
      <TablaTalentos onOpen={onOpen} onOpenStandalone={onOpenStandalone} onNew={onNew} />
    </div>
  );
}
