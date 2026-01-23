import { TablaImplementaciones } from './TablaImplementaciones';

interface ImplementacionesProps {
  onOpen?: (formId: string, itemId?: string) => void;
}

export function Implementaciones({ onOpen }: ImplementacionesProps) {
  return (
    <div className="space-y-6">
      <TablaImplementaciones onOpen={onOpen} />
    </div>
  );
}
