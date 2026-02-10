import { TablaTecnica } from './TablaTecnica';

interface TecnicaProps {
  onOpen?: (formId: string, itemId?: string) => void;
  onNew?: () => void;
}

export function Tecnica({ onOpen, onNew }: TecnicaProps) {
  return (
    <div className="space-y-6">
      <TablaTecnica onOpen={onOpen} onNew={onNew} />
    </div>
  );
}
