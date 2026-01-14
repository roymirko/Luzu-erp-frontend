import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { cn } from '@/app/components/ui/utils';
import { FIELD_MAX_LENGTHS } from '@/app/utils/implementacionConstants';

interface ObservacionesSectionProps {
  isDark: boolean;
  isCerrado: boolean;
  observaciones: string;
  setObservaciones: (v: string) => void;
}

export function ObservacionesSection(props: ObservacionesSectionProps) {
  const { isDark, isCerrado, observaciones, setObservaciones } = props;

  const inputClass = cn(
    'min-h-[100px] resize-none',
    isDark
      ? 'bg-[#141414] border-gray-800 text-white placeholder:text-gray-600 focus:border-[#fb2c36]'
      : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#fb2c36]',
    'disabled:opacity-60 disabled:cursor-not-allowed'
  );

  const labelClass = cn(
    'flex items-center gap-1',
    isDark ? 'text-gray-400' : 'text-gray-700'
  );

  return (
    <div className="space-y-4 pt-6">
      <Label className={labelClass}>Observaciones</Label>
      <div className="relative">
        <Textarea
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          maxLength={FIELD_MAX_LENGTHS.observaciones}
          disabled={isCerrado}
          placeholder="Type here"
          className={inputClass}
        />
        <span className="absolute bottom-2 right-2 text-xs text-gray-400">
          {observaciones.length}/{FIELD_MAX_LENGTHS.observaciones}
        </span>
      </div>
    </div>
  );
}
