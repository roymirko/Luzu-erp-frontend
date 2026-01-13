import { useState, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useFormularios } from '../contexts/FormulariosContext';
import { useImplementacion } from '../contexts/ImplementacionContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ChevronLeft, ChevronRight, Search, Pencil } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

interface TablaImplementacionesProps {
  onOpen?: (formId: string, itemId?: string) => void;
}

export function TablaImplementaciones({ onOpen }: TablaImplementacionesProps = {}) {
  const { isDark } = useTheme();
  const { formularios } = useFormularios();
  const { gastos, loading } = useImplementacion();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const formatPesos = (value: string | number) => {
    const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ''));
    if (isNaN(num)) return '$0';
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(num);
  };

  const rows = useMemo(() => {
    const fromFormularios = formularios.flatMap((form) => {
      if (!Array.isArray(form.importeRows)) return [] as any[];
      return form.importeRows
        .filter((item) => {
          const v = parseFloat(String(item.implementacion || '0').replace(/[^0-9.-]/g, ''));
          return !isNaN(v) && v > 0;
        })
        .map((item) => {
          const linkedGasto = gastos.find(g => 
            (g as any).idFormularioComercial === form.id && 
            (g as any).formItemId === item.id
          );
          
          const presupuestoImpl = parseFloat(String(item.implementacion || '0').replace(/[^0-9.-]/g, ''));
          
          return {
            id: linkedGasto ? linkedGasto.id : `${form.id}-${item.id}`,
            formId: form.id,
            itemId: item.id,
            linkedGastoId: linkedGasto?.id,
            estado: linkedGasto ? 'Cargado' : 'Pendiente de carga',
            fechaRegistro: linkedGasto?.fechaRegistro || form.fecha,
            responsable: linkedGasto?.responsable || form.responsable,
            unidadNegocio: form.unidadNegocio,
            categoriaNegocio: form.categoriaNegocio || 'N/A',
            ordenPublicidad: form.ordenPublicidad,
            presupuesto: presupuestoImpl,
            cantidadProgramas: 1,
            sector: 'Implementación',
            rubroGasto: linkedGasto?.rubroGasto || 'Gasto de venta',
            subRubro: linkedGasto?.subRubro || '-',
            nombreCampana: form.nombreCampana || '-',
            acuerdoPago: form.acuerdoPago || '-',
            programa: item.programa,
            meta: '-',
          };
        });
    });

    const formItemIds = new Set(fromFormularios.map(r => r.linkedGastoId).filter(Boolean));
    
    const standaloneGastos = gastos
      .filter(g => !formItemIds.has(g.id))
      .map((gasto) => ({
        id: gasto.id,
        formId: gasto.id,
        itemId: undefined,
        linkedGastoId: gasto.id,
        estado: gasto.estadoOP === 'pendiente' ? 'Pendiente' : gasto.estadoOP === 'activo' ? 'Activo' : gasto.estadoOP === 'cerrado' ? 'Cerrado' : 'Anulado',
        fechaRegistro: gasto.fechaRegistro,
        responsable: gasto.responsable,
        unidadNegocio: gasto.unidadNegocio,
        categoriaNegocio: gasto.categoriaNegocio || 'N/A',
        ordenPublicidad: gasto.ordenPublicidad,
        presupuesto: gasto.presupuesto,
        cantidadProgramas: gasto.cantidadProgramas,
        sector: gasto.sector,
        rubroGasto: gasto.rubroGasto,
        subRubro: gasto.subRubro,
        nombreCampana: gasto.nombreCampana,
        acuerdoPago: gasto.acuerdoPago,
        programa: undefined,
        meta: '-',
      }));

    const combined = [...fromFormularios, ...standaloneGastos];

    const filtered = combined.filter((row) => {
      if (!searchTerm) return true;
      const s = searchTerm.toLowerCase();
      return (
        row.ordenPublicidad?.toLowerCase().includes(s) ||
        row.responsable?.toLowerCase().includes(s) ||
        row.unidadNegocio?.toLowerCase().includes(s) ||
        row.categoriaNegocio?.toLowerCase().includes(s) ||
        row.nombreCampana?.toLowerCase().includes(s) ||
        row.sector?.toLowerCase().includes(s)
      );
    });

    return filtered;
  }, [formularios, gastos, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(rows.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentRows = rows.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
  const handlePageClick = (page: number) => setCurrentPage(page);
  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 4) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 3) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Detalle de gastos</h2>
        <div className="relative w-64">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          <Input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-10 ${isDark ? 'bg-[#1e1e1e] border-gray-800 text-white placeholder:text-gray-600 focus:border-[#fb2c36]' : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#fb2c36]'}`}
          />
        </div>
      </div>

      {/* Table */}
      <div className={`rounded-lg border overflow-hidden ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={isDark ? 'bg-[#1e1e1e]' : 'bg-[#fcfcfd]'}>
              <tr>
                {[
                  'Estado',
                  'Fecha de registro',
                  'Responsable',
                  'Unidad de negocio',
                  'Categoría de negocio',
                  'Orden de Publicidad',
                  'Presupuesto',
                  'Cant. de programas',
                  'Sector',
                  'Rubro de gasto',
                  'Sub rubro',
                  'Nombre de campaña',
                  'Acuerdo de pago',
                  'Meta',
                  'Acciones',
                ].map((h) => (
                  <th key={h} className={`px-6 py-3 text-left text-xs font-bold whitespace-nowrap ${isDark ? 'text-gray-400 border-gray-800' : 'text-[#667085] border-[#eaecf0]'} border-b`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentRows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onOpen && onOpen(row.formId, row.itemId)}
                  className={`${isDark ? 'bg-[#141414] hover:bg-[#1a1a1a]' : 'bg-white hover:bg-gray-50'} cursor-pointer`}
                >
                  <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'} border-b`}>
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-yellow-400" />
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{row.estado}</span>
                    </span>
                  </td>
                  <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'} border-b`}>{row.fechaRegistro}</td>
                  <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'} border-b`}>{row.responsable}</td>
                  <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'} border-b`}>{row.unidadNegocio}</td>
                  <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'} border-b`}>{row.categoriaNegocio}</td>
                  <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'} border-b`}>{row.ordenPublicidad}</td>
                  <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'} border-b`}>{formatPesos(row.presupuesto)}</td>
                  <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'} border-b`}>{row.cantidadProgramas}</td>
                  <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'text-gray-400 border-gray-800' : 'text-[#667085] border-[#eaecf0]'} border-b`}>{row.sector}</td>
                  <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'text-gray-400 border-gray-800' : 'text-[#667085] border-[#eaecf0]'} border-b`}>{row.rubroGasto}</td>
                  <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'text-gray-400 border-gray-800' : 'text-[#667085] border-[#eaecf0]'} border-b`}>{row.subRubro}</td>
                  <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'text-gray-400 border-gray-800' : 'text-[#667085] border-[#eaecf0]'} border-b`}>{row.nombreCampana}</td>
                  <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'} border-b`}>{row.acuerdoPago}</td>
                  <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'text-gray-400 border-gray-800' : 'text-[#667085] border-[#eaecf0]'} border-b`}>{row.meta}</td>
                  <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'border-gray-800' : 'border-[#eaecf0]'} border-b`}>
                    <div className="flex items-center justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpen && onOpen(row.formId, row.itemId);
                        }}
                        className={isDark ? 'text-gray-400 hover:text-white hover:bg-[#1e1e1e]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={isDark ? 'border-gray-800 text-gray-400 hover:bg-[#1e1e1e] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed' : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              {getPageNumbers().map((page, index) => (
                page === '...'
                  ? (
                    <span key={`ellipsis-${index}`} className={`px-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>...</span>
                  )
                  : (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageClick(page as number)}
                      className={currentPage === page
                        ? 'bg-[#fb2c36] text-white hover:bg-[#fb2c36]/90 min-w-[32px]'
                        : isDark
                          ? 'border-gray-800 text-gray-400 hover:bg-[#1e1e1e] hover:text-white min-w-[32px]'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 min-w-[32px]'}
                    >
                      {page}
                    </Button>
                  )
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={isDark ? 'border-gray-800 text-gray-400 hover:bg-[#1e1e1e] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed' : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
