import { useState, useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useProgramacion } from '../../contexts/ProgramacionContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ChevronLeft, ChevronRight, Search, Pencil, FileText } from 'lucide-react';
import type { GastoProgramacion } from '../../types/programacion';

const ITEMS_PER_PAGE = 10;

interface TablaProgramacionProps {
  onOpen?: (gastoId: string) => void;
  onNew?: () => void;
}

export function TablaProgramacion({ onOpen, onNew }: TablaProgramacionProps) {
  const { isDark } = useTheme();
  const { gastos, loading } = useProgramacion();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const formatPesos = (value: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(value);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-400';
      case 'activo':
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
        return 'Pendiente';
      case 'activo':
        return 'Activo';
      case 'cerrado':
        return 'Cerrado';
      case 'anulado':
        return 'Anulado';
      default:
        return estado;
    }
  };

  const filteredGastos = useMemo(() => {
    if (!searchTerm) return gastos;
    const s = searchTerm.toLowerCase();
    return gastos.filter((gasto) =>
      gasto.mesGestion?.toLowerCase().includes(s) ||
      gasto.programa?.toLowerCase().includes(s) ||
      gasto.razonSocial?.toLowerCase().includes(s) ||
      gasto.unidadNegocio?.toLowerCase().includes(s) ||
      gasto.categoriaNegocio?.toLowerCase().includes(s) ||
      gasto.ejecutivo?.toLowerCase().includes(s) ||
      gasto.categoria?.toLowerCase().includes(s)
    );
  }, [gastos, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredGastos.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentRows = filteredGastos.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Cargando gastos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Detalle de gastos</h2>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <Input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className={`pl-10 ${isDark ? 'bg-[#1e1e1e] border-gray-800 text-white placeholder:text-gray-600 focus:border-[#fb2c36]' : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#fb2c36]'}`}
            />
          </div>
          {onNew && (
            <Button
              onClick={onNew}
              className="bg-[#fb2c36] hover:bg-[#fb2c36]/90 text-white gap-2"
            >
              <FileText className="h-4 w-4" />
              Nuevo Formulario
            </Button>
          )}
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
                  'Mes gestión',
                  'Fecha',
                  'Responsable',
                  'Unidad de negocio',
                  'Cat. de negocio',
                  'Programa',
                  'Razón social',
                  'Categoría',
                  'Importe',
                  'Acciones',
                ].map((h) => (
                  <th key={h} className={`px-6 py-3 text-left text-xs font-bold whitespace-nowrap ${isDark ? 'text-gray-400 border-gray-800' : 'text-[#667085] border-[#eaecf0]'} border-b`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentRows.length === 0 ? (
                <tr>
                  <td colSpan={11} className={`px-6 py-12 text-center text-sm ${isDark ? 'text-gray-500 bg-[#141414]' : 'text-gray-500 bg-white'}`}>
                    {searchTerm ? 'No se encontraron resultados' : 'Sin gastos registrados'}
                  </td>
                </tr>
              ) : (
                currentRows.map((gasto) => (
                  <tr
                    key={gasto.id}
                    onClick={() => onOpen && onOpen(gasto.id)}
                    className={`${isDark ? 'bg-[#141414] hover:bg-[#1a1a1a]' : 'bg-white hover:bg-gray-50'} cursor-pointer`}
                  >
                    <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'} border-b`}>
                      <span className="inline-flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${getEstadoColor(gasto.estado)}`} />
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{getEstadoLabel(gasto.estado)}</span>
                      </span>
                    </td>
                    <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'} border-b`}>{gasto.mesGestion || '-'}</td>
                    <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'} border-b`}>{formatDate(gasto.createdAt)}</td>
                    <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'} border-b`}>{gasto.ejecutivo || '-'}</td>
                    <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'} border-b`}>{gasto.unidadNegocio || '-'}</td>
                    <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'} border-b`}>{gasto.categoriaNegocio || '-'}</td>
                    <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'text-gray-400 border-gray-800' : 'text-[#667085] border-[#eaecf0]'} border-b`}>{gasto.programa || '-'}</td>
                    <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'text-gray-400 border-gray-800' : 'text-[#667085] border-[#eaecf0]'} border-b`}>{gasto.razonSocial || '-'}</td>
                    <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'text-gray-400 border-gray-800' : 'text-[#667085] border-[#eaecf0]'} border-b`}>{gasto.categoria || '-'}</td>
                    <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'} border-b`}>{formatPesos(gasto.neto)}</td>
                    <td className={`px-6 py-3 text-sm whitespace-nowrap ${isDark ? 'border-gray-800' : 'border-[#eaecf0]'} border-b`}>
                      <div className="flex items-center justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpen && onOpen(gasto.id);
                          }}
                          className={isDark ? 'text-gray-400 hover:text-white hover:bg-[#1e1e1e]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
                        >
                          <Pencil className="h-4 w-4" />
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
