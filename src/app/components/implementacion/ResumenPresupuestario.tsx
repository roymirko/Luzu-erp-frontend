interface ResumenPresupuestarioProps {
  isDark: boolean;
  asignado: number;
  ejecutado: number;
  disponible: number;
  excedido: boolean;
  formatCurrency: (val: number) => string;
}

export function ResumenPresupuestario(props: ResumenPresupuestarioProps) {
  const { isDark, asignado, ejecutado, disponible, excedido, formatCurrency } = props;

  const cardClass = `p-4 rounded-lg flex flex-col items-center justify-center text-center gap-1 ${
    isDark ? 'bg-[#1e1e1e]' : 'bg-[#F3F5FF]'
  }`;

  const labelClass = `text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`;
  const valueClass = `text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`;

  const calcPercentage = (value: number) => {
    return asignado > 0 ? `${((value / asignado) * 100).toFixed(1)}%` : '0%';
  };

  return (
    <div
      className={`p-6 rounded-lg border ${
        isDark ? 'bg-[#141414] border-gray-800' : 'bg-white border-gray-200'
      }`}
    >
      <h2 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Resumen
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={cardClass}>
          <span className={labelClass}>Presupuesto Asignado</span>
          <span className={valueClass}>{formatCurrency(asignado)}</span>
          <span className="text-xs font-medium text-green-500">100%</span>
        </div>

        <div className={cardClass}>
          <span className={labelClass}>Ejecutado</span>
          <span className={valueClass}>{formatCurrency(ejecutado)}</span>
          <span className={`text-xs font-medium ${excedido ? 'text-red-500' : 'text-blue-500'}`}>
            {calcPercentage(ejecutado)}
          </span>
        </div>

        <div className={cardClass}>
          <span className={labelClass}>Disponible</span>
          <span
            className={`text-xl font-bold ${
              excedido ? 'text-red-500' : isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            {formatCurrency(Math.abs(disponible))}
          </span>
          <span className={`text-xs font-medium ${excedido ? 'text-red-500' : 'text-green-500'}`}>
            {calcPercentage(disponible)}
          </span>
        </div>
      </div>
    </div>
  );
}
