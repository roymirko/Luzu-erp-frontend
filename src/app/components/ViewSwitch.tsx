import { useTheme } from '../contexts/ThemeContext';

type ViewMode = 'programa' | 'orden';

interface ViewSwitchProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

export function ViewSwitch({ mode, onModeChange }: ViewSwitchProps) {
  const { isDark } = useTheme();

  return (
    <div
      className={`relative inline-flex rounded-lg p-1 ${isDark ? 'bg-[#2a2a2a]' : 'bg-[#F3F5FF]'
        }`}
      role="tablist"
      aria-label="Modo de visualización"
    >
      {/* Slider background */}
      <div
        className={`absolute bg-white h-[calc(100%-8px)] top-1 rounded-md shadow-sm transition-all duration-300 ease-in-out ${mode === 'programa' ? 'w-[108px] left-1' : 'w-[162px] left-[116px]'
          }`}
        aria-hidden="true"
      />

      {/* Programa button */}
      <button
        onClick={() => onModeChange('programa')}
        role="tab"
        aria-selected={mode === 'programa'}
        className={`relative px-4 py-2 rounded-md transition-all duration-200 z-10 min-w-[108px] ${mode === 'programa'
            ? 'text-[#2f2f2f] font-medium'
            : isDark
              ? 'text-gray-400 hover:text-gray-300'
              : 'text-gray-600 hover:text-gray-700'
          }`}
      >
        <span className="text-sm">Programa</span>
      </button>

      {/* Orden de Publicidad button */}
      <button
        onClick={() => onModeChange('orden')}
        role="tab"
        aria-selected={mode === 'orden'}
        className={`relative px-4 py-2 rounded-md transition-all duration-200 z-10 min-w-[162px] ${mode === 'orden'
            ? 'text-[#2f2f2f] font-medium'
            : isDark
              ? 'text-gray-400 hover:text-gray-300'
              : 'text-gray-600 hover:text-gray-700'
          }`}
      >
        <span className="text-sm whitespace-nowrap">Orden de Publicidad</span>
      </button>
    </div>
  );
}