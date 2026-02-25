import { TablaTalentos } from './TablaTalentos';

interface TalentosProps {
  onOpen?: (formId: string, itemId?: string) => void;
}

export function Talentos({ onOpen }: TalentosProps) {
  return (
    <div className="space-y-6">
      <TablaTalentos onOpen={onOpen} />
    </div>
  );
}
