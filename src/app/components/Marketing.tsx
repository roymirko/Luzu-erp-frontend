import { TablaMarketing } from './marketing/TablaMarketing';

interface MarketingProps {
  onNew?: () => void;
  onOpen?: (gastoId: string) => void;
}

export function Marketing({ onNew, onOpen }: MarketingProps) {
  return (
    <div className="space-y-6">
      <TablaMarketing onNew={onNew} onOpen={onOpen} />
    </div>
  );
}
