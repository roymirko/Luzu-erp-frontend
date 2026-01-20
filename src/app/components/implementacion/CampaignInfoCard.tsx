import { cn } from '@/app/components/ui/utils';

interface CampaignInfoItem {
  label: string;
  value: string;
}

interface CampaignInfoCardProps {
  isDark: boolean;
  ordenPublicidad: string;
  presupuesto: string;
  mesServicio?: string;
  unidadNegocio: string;
  categoriaNegocio: string;
  marca?: string;
  nombreCampana: string;
  rubroGasto: string;
  subRubro: string;
  formatCurrency: (val: number) => string;
}

export function CampaignInfoCard({
  isDark,
  ordenPublicidad,
  presupuesto,
  mesServicio,
  unidadNegocio,
  categoriaNegocio,
  marca,
  nombreCampana,
  rubroGasto,
  subRubro,
  formatCurrency,
}: CampaignInfoCardProps) {
  const items: CampaignInfoItem[][] = [
    [
      { label: 'Orden de Publicidad', value: ordenPublicidad || '-' },
      { label: 'Presupuesto Total', value: formatCurrency(parseFloat(presupuesto) || 0) },
      { label: 'Mes de Servicio', value: mesServicio || '-' },
      { label: 'Unidad de Negocio', value: unidadNegocio || '-' },
    ],
    [
      { label: 'Categoría de Negocio', value: categoriaNegocio || '-' },
      { label: 'Marca', value: marca || '-' },
      { label: 'Nombre de Campaña', value: nombreCampana || '-' },
      { label: 'Rubro de Gasto', value: rubroGasto || '-' },
    ],
    [
      { label: 'Subrubro', value: subRubro || '-' },
    ],
  ];

  return (
    <div
      className={cn(
        'rounded-[10px] border p-6',
        isDark ? 'bg-[#141414] border-gray-800' : 'bg-white border-[#e5e7eb]'
      )}
    >
      <div className="grid grid-cols-4 gap-x-6 gap-y-6">
        {items.flat().map((item, index) => (
          <div key={index} className="flex flex-col gap-1">
            <span
              className={cn(
                'text-sm font-normal',
                isDark ? 'text-gray-400' : 'text-[#4a5565]'
              )}
            >
              {item.label}
            </span>
            <span
              className={cn(
                'text-sm font-semibold',
                isDark ? 'text-white' : 'text-[#101828]'
              )}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
