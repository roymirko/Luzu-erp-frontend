import { TablaProductora } from './productora/TablaProductora';

interface ProductoraProps {
  onNew?: () => void;
  onOpen?: (gastoId: string) => void;
}

export function Productora({ onNew, onOpen }: ProductoraProps) {
  return (
    <div className="space-y-6">
      <TablaProductora onNew={onNew} onOpen={onOpen} />
    </div>
  );
}
