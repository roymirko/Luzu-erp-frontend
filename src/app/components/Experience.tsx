import { TablaExperience } from './experience/TablaExperience';

interface ExperienceProps {
  onNew?: () => void;
  onOpen?: (gastoId: string) => void;
}

export function Experience({ onNew, onOpen }: ExperienceProps) {
  return (
    <div className="space-y-6">
      <TablaExperience onNew={onNew} onOpen={onOpen} />
    </div>
  );
}
