import { TablaProgramacion } from './programacion/TablaProgramacion';

interface ProgramacionProps {
  onOpen?: (gastoId: string) => void;
  onNew?: () => void;
}

export function Programacion({ onOpen, onNew }: ProgramacionProps) {
  return (
    <div className="space-y-6">
      <TablaProgramacion onOpen={onOpen} onNew={onNew} />
    </div>
  );
}
