import { useState, useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useProgramacion } from '../../contexts/ProgramacionContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ChevronLeft, ChevronRight, Search, MoreVertical, Plus, ChevronRight as ChevronRightIcon } from 'lucide-react';
import type { FormularioAgrupado, GastoProgramacion } from '../../types/programacion';

const ITEMS_PER_PAGE = 10;

type FilterMode = 'programa' | 'campana';

interface TablaProgramacionProps {
  onOpenGasto?: (gastoId: string) => void;
  onOpenFormulario?: (formularioId: string) => void;
  onNew?: () => void;
}

// Columns for Programa mode (individual gastos)
const PROGRAMA_COLUMNS = [
  'Estado',
  'Fecha de registro',
  'Responsable',
  'Empresa/Programa',
  'Factura emitida a',
  'Empresa',
  'Unidad de negocio',
  'Subrubro',
  'Campaña',
  'Proveedor',
  'Razón social',
  'Neto',
  'Acciones',
];

// Columns for Campaña mode (grouped formularios)
const CAMPANA_COLUMNS = [
  'Estado',
  'Fecha de registro',
  'Responsable',
  'Factura emitida a',
  'Empresa',
  'Unidad de negocio',
  'Subrubro',
  'Campaña',
  'Proveedor',
  'Razón social',
  'Neto total',
  'Acciones',
];

export function TablaProgramacion({ onOpenGasto, onOpenFormulario, onNew }: TablaProgramacionProps) {
  const { isDark } = useTheme();
  const { gastos, formulariosAgrupados, loading } = useProgramacion();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('programa');

  const formatPesos = (value: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(value);
  };

  const formatDate = (date: Date) => {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month} - ${year}`;
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-400';
      case 'activo':
      case 'pago':
        return 'bg-green-400';
      case 'cerrado':
        return 'bg-gray-400';
      case 'anulado':
        return 'bg-red-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'Pendiente de pago';
      case 'activo':
        return 'Activo';
      case 'pago':
        return 'Pago';
      case 'cerrado':
        return 'Cerrado';
      case 'anulado':
        return 'Anulado';
      default:
        return estado;
    }
  };

  // Filter gastos for Programa mode
  const filteredGastos = useMemo(() => {
    if (!searchTerm) return gastos;
    const s = searchTerm.toLowerCase();
    return gastos.filter((g) =>
      g.ejecutivo?.toLowerCase().includes(s) ||
      g.programa?.toLowerCase().includes(s) ||
      g.facturaEmitidaA?.toLowerCase().includes(s) ||
      g.empresa?.toLowerCase().includes(s) ||
      g.unidadNegocio?.toLowerCase().includes(s) ||
      g.subRubroEmpresa?.toLowerCase().includes(s) ||
      g.detalleCampana?.toLowerCase().includes(s) ||
      g.proveedor?.toLowerCase().includes(s) ||
      g.razonSocial?.toLowerCase().includes(s)
    );
  }, [gastos, searchTerm]);

  // Filter formularios for Campaña mode
  const filteredFormularios = useMemo(() => {
    if (!searchTerm) return formulariosAgrupados;
    const s = searchTerm.toLowerCase();
    return formulariosAgrupados.filter((f) =>
      f.ejecutivo?.toLowerCase().includes(s) ||
      f.facturaEmitidaA?.toLowerCase().includes(s) ||
      f.empresa?.toLowerCase().includes(s) ||
      f.unidadNegocio?.toLowerCase().includes(s) ||
      f.subRubroEmpresa?.toLowerCase().includes(s) ||
      f.detalleCampana?.toLowerCase().includes(s) ||
      f.proveedor?.toLowerCase().includes(s) ||
      f.razonSocial?.toLowerCase().includes(s)
    );
  }, [formulariosAgrupados, searchTerm]);

  // Determine current data based on mode
  const currentData = filterMode === 'programa' ? filteredGastos : filteredFormularios;
  const columns = filterMode === 'programa' ? PROGRAMA_COLUMNS : CAMPANA_COLUMNS;

  const totalPages = Math.max(1, Math.ceil(currentData.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentRows = currentData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
  const handlePageClick = (page: number) => setCurrentPage(page);

  const handleModeChange = (mode: FilterMode) => {
    setFilterMode(mode);
    setCurrentPage(1);
  };

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

  const handleRowClick = (item: GastoProgramacion | FormularioAgrupado) => {
    if (filterMode === 'programa') {
      onOpenGasto?.((item as GastoProgramacion).id);
    } else {
      onOpenFormulario?.((item as FormularioAgrupado).id);
    }
  };

  const handleActionClick = (e: React.MouseEvent, item: GastoProgramacion | FormularioAgrupado) => {
    e.stopPropagation();
    handleRowClick(item);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Cargando gastos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* New Formulario Card */}
      {onNew && (
        <button
          onClick={onNew}
          className={`flex items-center gap-4 px-4 py-4 rounded-[10px] border transition-colors w-[272px] ${
            isDark
              ? 'bg-[#1e1e1e] border-gray-800 hover:border-gray-700'
              : 'bg-white border-[#e5e7eb] hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-[10px] bg-[#fb2c36]/20">
            <Plus className="h-5 w-5 text-[#fb2c36]" />
          </div>
          <div className="flex flex-col items-start">
            <span className={`text-lg font-medium ${isDark ? 'text-white' : 'text-[#101828]'}`}>
              Nuevo Formulario
            </span>
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-[#4a5565]'}`}>
              Crear importe de gasto
            </span>
          </div>
          <ChevronRightIcon className={`h-4 w-4 ml-auto ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
        </button>
      )}

      {/* Header with Title, Search, and Filter Toggle */}
      <div className="flex items-center justify-between gap-4 px-12 py-2">
        <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#101828]'}`}>
          Detalle de gastos
        </h2>

        <div className="flex items-center gap-4">
          {/* Search Input */}
          <div className="relative w-[300px]">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${isDark ? 'text-gray-500' : 'text-[#8b8b8d]'}`} />
            <Input
              type="text"
              placeholder="Buscar"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className={`pl-10 h-8 text-xs rounded-[5px] ${isDark ? 'bg-[#1e1e1e] border-gray-800 text-white placeholder:text-gray-600' : 'bg-white border-[#d1d5db] text-gray-900 placeholder:text-[#8b8b8d]'}`}
            />
          </div>

          {/* Filter Toggle */}
          <div className={`flex rounded-[6px] p-[5px] w-[253px] ${isDark ? 'bg-[#1e1e1e]' : 'bg-[#f3f5ff]'}`}>
            <button
              onClick={() => handleModeChange('programa')}
              className={`flex-1 px-4 py-1.5 text-sm font-normal rounded-[3px] transition-colors ${
                filterMode === 'programa'
                  ? isDark
                    ? 'bg-[#2a2a2a] text-white shadow-sm'
                    : 'bg-white text-[#2f2f2f] shadow-[0.5px_0.5px_1px_0px_rgba(0,0,0,0.15)]'
                  : isDark
                    ? 'text-gray-400 hover:text-white'
                    : 'text-[#2f2f2f] hover:text-gray-900'
              }`}
            >
              Programa
            </button>
            <button
              onClick={() => handleModeChange('campana')}
              className={`flex-1 px-4 py-1.5 text-sm font-normal rounded-[3px] transition-colors ${
                filterMode === 'campana'
                  ? isDark
                    ? 'bg-[#2a2a2a] text-white shadow-sm'
                    : 'bg-white text-[#2f2f2f] shadow-[0.5px_0.5px_1px_0px_rgba(0,0,0,0.15)]'
                  : isDark
                    ? 'text-gray-400 hover:text-white'
                    : 'text-[#2f2f2f] hover:text-gray-900'
              }`}
            >
              Campaña
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={`rounded-[10px] border overflow-hidden ${isDark ? 'border-gray-800' : 'border-[#eaecf0]'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={isDark ? 'bg-[#1e1e1e]' : 'bg-[#fcfcfd]'}>
              <tr>
                {columns.map((h) => (
                  <th key={h} className={`px-6 py-3 text-left text-sm font-bold whitespace-nowrap ${isDark ? 'text-gray-400 border-gray-800' : 'text-[#667085] border-[#eaecf0]'} border-b`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentRows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className={`px-6 py-12 text-center text-sm ${isDark ? 'text-gray-500 bg-[#141414]' : 'text-gray-500 bg-white'}`}>
                    {searchTerm ? 'No se encontraron resultados' : 'Sin gastos registrados'}
                  </td>
                </tr>
              ) : filterMode === 'programa' ? (
                // Programa mode rows (individual gastos)
                (currentRows as GastoProgramacion[]).map((gasto) => (
                  <tr
                    key={gasto.id}
                    onClick={() => handleRowClick(gasto)}
                    className={`${isDark ? 'bg-[#141414] hover:bg-[#1a1a1a]' : 'bg-white hover:bg-gray-50'} cursor-pointer`}
                  >
                    {/* Estado */}
                    <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'border-gray-800' : 'border-[#eaecf0]'} border-b`}>
                      <span className="inline-flex items-center gap-3">
                        <span className={`h-4 w-4 rounded-full ${getEstadoColor(gasto.estado)}`} />
                        <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-black'}`}>{getEstadoLabel(gasto.estado)}</span>
                      </span>
                    </td>
                    {/* Fecha de registro */}
                    <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'} border-b`}>
                      {formatDate(gasto.createdAt)}
                    </td>
                    {/* Responsable */}
                    <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'} border-b`}>
                      {gasto.ejecutivo || '-'}
                    </td>
                    {/* Empresa/Programa */}
                    <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'} border-b`}>
                      {gasto.programa || gasto.empresa || '-'}
                    </td>
                    {/* Factura emitida a */}
                    <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'} border-b`}>
                      {gasto.facturaEmitidaA || '-'}
                    </td>
                    {/* Empresa */}
                    <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'} border-b`}>
                      {gasto.empresa || '-'}
                    </td>
                    {/* Unidad de negocio */}
                    <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'} border-b`}>
                      {gasto.unidadNegocio || '-'}
                    </td>
                    {/* Subrubro */}
                    <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'} border-b`}>
                      {gasto.subRubroEmpresa || '-'}
                    </td>
                    {/* Campaña */}
                    <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'} border-b`}>
                      {gasto.detalleCampana || '-'}
                    </td>
                    {/* Proveedor */}
                    <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'} border-b`}>
                      {gasto.proveedor || '-'}
                    </td>
                    {/* Razón social */}
                    <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'} border-b`}>
                      {gasto.razonSocial || '-'}
                    </td>
                    {/* Neto */}
                    <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'} border-b`}>
                      {formatPesos(gasto.neto)}
                    </td>
                    {/* Acciones */}
                    <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'border-gray-800' : 'border-[#eaecf0]'} border-b`}>
                      <div className="flex items-center justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleActionClick(e, gasto)}
                          className={isDark ? 'text-gray-400 hover:text-white hover:bg-[#1e1e1e]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
                        >
                          <MoreVertical className="h-6 w-6" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                // Campaña mode rows (grouped formularios)
                (currentRows as FormularioAgrupado[]).map((formulario) => (
                  <tr
                    key={formulario.id}
                    onClick={() => handleRowClick(formulario)}
                    className={`${isDark ? 'bg-[#141414] hover:bg-[#1a1a1a]' : 'bg-white hover:bg-gray-50'} cursor-pointer`}
                  >
                    {/* Estado */}
                    <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'border-gray-800' : 'border-[#eaecf0]'} border-b`}>
                      <span className="inline-flex items-center gap-3">
                        <span className={`h-4 w-4 rounded-full ${getEstadoColor(formulario.estado)}`} />
                        <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-black'}`}>{getEstadoLabel(formulario.estado)}</span>
                      </span>
                    </td>
                    {/* Fecha de registro */}
                    <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'} border-b`}>
                      {formatDate(formulario.createdAt)}
                    </td>
                    {/* Responsable */}
                    <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'} border-b`}>
                      {formulario.ejecutivo || '-'}
                    </td>
                    {/* Factura emitida a */}
                    <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'} border-b`}>
                      {formulario.facturaEmitidaA || '-'}
                    </td>
                    {/* Empresa */}
                    <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'} border-b`}>
                      {formulario.empresa || '-'}
                    </td>
                    {/* Unidad de negocio */}
                    <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'} border-b`}>
                      {formulario.unidadNegocio || '-'}
                    </td>
                    {/* Subrubro */}
                    <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'} border-b`}>
                      {formulario.subRubroEmpresa || '-'}
                    </td>
                    {/* Campaña */}
                    <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'} border-b`}>
                      {formulario.detalleCampana || '-'}
                    </td>
                    {/* Proveedor */}
                    <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'} border-b`}>
                      {formulario.proveedor || '-'}
                    </td>
                    {/* Razón social */}
                    <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'} border-b`}>
                      {formulario.razonSocial || '-'}
                    </td>
                    {/* Neto total */}
                    <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'} border-b`}>
                      {formatPesos(formulario.netoTotal)}
                    </td>
                    {/* Acciones */}
                    <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'border-gray-800' : 'border-[#eaecf0]'} border-b`}>
                      <div className="flex items-center justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleActionClick(e, formulario)}
                          className={isDark ? 'text-gray-400 hover:text-white hover:bg-[#1e1e1e]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
                        >
                          <MoreVertical className="h-6 w-6" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
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
