import { useTheme } from '../contexts/ThemeContext';
import { useFormularios } from '../contexts/FormulariosContext';
import { ChevronLeft, ChevronRight, Search, Pencil } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ViewSwitch } from './ViewSwitch';
import { useState, useMemo } from 'react';
import type { FormularioData } from '../contexts/FormulariosContext';

const ITEMS_PER_PAGE = 10;

interface TablaFormulariosProps {
  onEditFormulario?: (id: string) => void;
}

export function TablaFormularios({ onEditFormulario }: TablaFormulariosProps = {}) {
  const { isDark } = useTheme();
  const { formularios } = useFormularios();
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'programa' | 'orden'>('programa');
  const [searchTerm, setSearchTerm] = useState('');

  // Función para formatear números como pesos argentinos
  const formatPesos = (value: string) => {
    const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
    if (isNaN(num)) return '$0';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(num);
  };

  // Expandir formularios según el modo de visualización
  const rowsData = useMemo(() => {
    // Filtrar por término de búsqueda
    const filtered = formularios.filter(form => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (
        form.ordenPublicidad?.toLowerCase().includes(search) ||
        form.razonSocial?.toLowerCase().includes(search) ||
        form.marca?.toLowerCase().includes(search) ||
        form.empresaAgencia?.toLowerCase().includes(search) ||
        form.unidadNegocio?.toLowerCase().includes(search)
      );
    });

    if (viewMode === 'programa') {
      // Modo Programa: 1 fila por programa
      return filtered.flatMap(form => 
        (form.importeRows || []).map((prog, index) => ({
          ...form,
          programa: prog,
          isFirstRow: index === 0,
          rowSpan: (form.importeRows || []).length,
        }))
      );
    } else {
      // Modo Orden: 1 fila por orden de publicidad (sin detalles de programas)
      return filtered.map(form => ({
        ...form,
        cantidadProgramas: (form.importeRows || []).length,
        isFirstRow: true,
        rowSpan: 1,
      }));
    }
  }, [formularios, viewMode, searchTerm]);

  // Calcular paginación
  const totalPages = Math.ceil(rowsData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentRows = rowsData.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  // Generar números de página para mostrar
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (formularios.length === 0) {
    return (
      <div className={`p-8 rounded-lg border text-center ${
        isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'
      }`}>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
          No hay formularios guardados aún. Crea uno nuevo para comenzar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con título, buscador y switch en una línea */}
      <div className="flex items-center justify-between gap-4">
        <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Formularios Comerciales
        </h2>
        
        <div className="flex items-center gap-3">
          {/* Buscador */}
          <div className="relative w-64">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <Input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 ${isDark 
                ? 'bg-[#1e1e1e] border-gray-800 text-white placeholder:text-gray-600 focus:border-[#fb2c36]'
                : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#fb2c36]'
              }`}
            />
          </div>
          
          {/* Switch de visualización */}
          <ViewSwitch mode={viewMode} onModeChange={setViewMode} />
        </div>
      </div>
      
      <div className={`rounded-lg border overflow-hidden ${
        isDark ? 'border-gray-800' : 'border-gray-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={isDark ? 'bg-[#1e1e1e]' : 'bg-[#fcfcfd]'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-bold whitespace-nowrap ${
                  isDark ? 'text-gray-400 border-gray-800' : 'text-[#667085] border-[#eaecf0]'
                } border-b`}>
                  Mes de servicio
                </th>
                <th className={`px-6 py-3 text-left text-xs font-bold whitespace-nowrap ${
                  isDark ? 'text-gray-400 border-gray-800' : 'text-[#667085] border-[#eaecf0]'
                } border-b`}>
                  Fecha
                </th>
                <th className={`px-6 py-3 text-left text-xs font-bold whitespace-nowrap ${
                  isDark ? 'text-gray-400 border-gray-800' : 'text-[#667085] border-[#eaecf0]'
                } border-b`}>
                  Responsable
                </th>
                <th className={`px-6 py-3 text-left text-xs font-bold whitespace-nowrap ${
                  isDark ? 'text-gray-400 border-gray-800' : 'text-[#667085] border-[#eaecf0]'
                } border-b`}>
                  Unidad de negocio
                </th>
                <th className={`px-6 py-3 text-left text-xs font-bold whitespace-nowrap ${
                  isDark ? 'text-gray-400 border-gray-800' : 'text-[#667085] border-[#eaecf0]'
                } border-b`}>
                  Categoría de negocio
                </th>
                <th className={`px-6 py-3 text-left text-xs font-bold whitespace-nowrap ${
                  isDark ? 'text-gray-400 border-gray-800' : 'text-[#667085] border-[#eaecf0]'
                } border-b`}>
                  Proyecto
                </th>
                <th className={`px-6 py-3 text-left text-xs font-bold whitespace-nowrap ${
                  isDark ? 'text-gray-400 border-gray-800' : 'text-[#667085] border-[#eaecf0]'
                } border-b`}>
                  Razón social
                </th>
                <th className={`px-6 py-3 text-left text-xs font-bold whitespace-nowrap ${
                  isDark ? 'text-gray-400 border-gray-800' : 'text-[#667085] border-[#eaecf0]'
                } border-b`}>
                  Orden de Publicidad
                </th>
                
                {/* Columna solo en modo Orden */}
                {viewMode === 'orden' && (
                  <th className={`px-6 py-3 text-left text-xs font-bold whitespace-nowrap ${
                    isDark ? 'text-gray-400 border-gray-800' : 'text-[#667085] border-[#eaecf0]'
                  } border-b`}>
                    Cant. Programas
                  </th>
                )}
                
                <th className={`px-6 py-3 text-left text-xs font-bold whitespace-nowrap ${
                  isDark ? 'text-gray-400 border-gray-800' : 'text-[#667085] border-[#eaecf0]'
                } border-b`}>
                  Categoría
                </th>
                <th className={`px-6 py-3 text-left text-xs font-bold whitespace-nowrap ${
                  isDark ? 'text-gray-400 border-gray-800' : 'text-[#667085] border-[#eaecf0]'
                } border-b`}>
                  Empresa/Agencia
                </th>
                <th className={`px-6 py-3 text-left text-xs font-bold whitespace-nowrap ${
                  isDark ? 'text-gray-400 border-gray-800' : 'text-[#667085] border-[#eaecf0]'
                } border-b`}>
                  Marca
                </th>
                <th className={`px-6 py-3 text-left text-xs font-bold whitespace-nowrap ${
                  isDark ? 'text-gray-400 border-gray-800' : 'text-[#667085] border-[#eaecf0]'
                } border-b`}>
                  Nombre de campaña
                </th>
                <th className={`px-6 py-3 text-left text-xs font-bold whitespace-nowrap ${
                  isDark ? 'text-gray-400 border-gray-800' : 'text-[#667085] border-[#eaecf0]'
                } border-b`}>
                  Acuerdo de pago
                </th>
                
                {/* Columnas solo en modo Programa */}
                {viewMode === 'programa' && (
                  <>
                    <th className={`px-6 py-3 text-left text-xs font-bold whitespace-nowrap ${
                      isDark ? 'text-gray-400 border-gray-800' : 'text-[#667085] border-[#eaecf0]'
                    } border-b`}>
                      Programa
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-bold whitespace-nowrap ${
                      isDark ? 'text-gray-400 border-gray-800' : 'text-[#667085] border-[#eaecf0]'
                    } border-b`}>
                      Monto
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-bold whitespace-nowrap ${
                      isDark ? 'text-gray-400 border-gray-800' : 'text-[#667085] border-[#eaecf0]'
                    } border-b`}>
                      NC PGM
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-bold whitespace-nowrap ${
                      isDark ? 'text-gray-400 border-gray-800' : 'text-[#667085] border-[#eaecf0]'
                    } border-b`}>
                      FEE PGM
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-bold whitespace-nowrap ${
                      isDark ? 'text-gray-400 border-gray-800' : 'text-[#667085] border-[#eaecf0]'
                    } border-b`}>
                      Proveedor FEE
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-bold whitespace-nowrap ${
                      isDark ? 'text-gray-400 border-gray-800' : 'text-[#667085] border-[#eaecf0]'
                    } border-b`}>
                      Implementación
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-bold whitespace-nowrap ${
                      isDark ? 'text-gray-400 border-gray-800' : 'text-[#667085] border-[#eaecf0]'
                    } border-b`}>
                      Talentos
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-bold whitespace-nowrap ${
                      isDark ? 'text-gray-400 border-gray-800' : 'text-[#667085] border-[#eaecf0]'
                    } border-b`}>
                      Técnica
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-bold whitespace-nowrap ${
                      isDark ? 'text-gray-400 border-gray-800' : 'text-[#667085] border-[#eaecf0]'
                    } border-b`}>
                      %
                    </th>
                  </>
                )}
                
                {/* Columna de acciones */}
                <th className={`px-6 py-3 text-center text-xs font-bold whitespace-nowrap ${
                  isDark ? 'text-gray-400 border-gray-800' : 'text-[#667085] border-[#eaecf0]'
                } border-b`}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((row, index) => (
                <tr 
                  key={viewMode === 'programa' ? `${row.id}-${row.programa?.id}-${startIndex + index}` : `${row.id}-${startIndex + index}`}
                  className={isDark ? 'bg-[#141414] hover:bg-[#1a1a1a]' : 'bg-white hover:bg-gray-50'}
                >
                  {viewMode === 'programa' && (
                    <>
                      <td className={`px-6 py-3 text-sm whitespace-nowrap ${
                        isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'
                      } border-b`}>
                        {row.mesServicio}
                      </td>
                      <td className={`px-6 py-3 text-sm whitespace-nowrap ${
                        isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'
                      } border-b`}>
                        {row.fecha}
                      </td>
                      <td className={`px-6 py-3 text-sm whitespace-nowrap ${
                        isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'
                      } border-b`}>
                        {row.responsable}
                      </td>
                      <td className={`px-6 py-3 text-sm whitespace-nowrap ${
                        isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'
                      } border-b`}>
                        {row.unidadNegocio}
                      </td>
                      <td className={`px-6 py-3 text-sm whitespace-nowrap ${
                        isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'
                      } border-b`}>
                        {row.categoriaNegocio || 'N/A'}
                      </td>
                      <td className={`px-6 py-3 text-sm whitespace-nowrap ${
                        isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'
                      } border-b`}>
                        {row.proyecto || 'No aplica'}
                      </td>
                      <td className={`px-6 py-3 text-sm whitespace-nowrap ${
                        isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'
                      } border-b`}>
                        {row.razonSocial}
                      </td>
                      <td className={`px-6 py-3 text-sm whitespace-nowrap ${
                        isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'
                      } border-b`}>
                        {row.ordenPublicidad}
                      </td>
                      <td className={`px-6 py-3 text-sm whitespace-nowrap ${
                        isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'
                      } border-b`}>
                        {row.categoria}
                      </td>
                      <td className={`px-6 py-3 text-sm whitespace-nowrap ${
                        isDark ? 'text-gray-400 border-gray-800' : 'text-[#667085] border-[#eaecf0]'
                      } border-b`}>
                        {row.empresaAgencia}
                      </td>
                      <td className={`px-6 py-3 text-sm whitespace-nowrap ${
                        isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'
                      } border-b`}>
                        {row.marca}
                      </td>
                      <td className={`px-6 py-3 text-sm whitespace-nowrap ${
                        isDark ? 'text-gray-400 border-gray-800' : 'text-[#667085] border-[#eaecf0]'
                      } border-b`}>
                        {row.nombreCampana || '-'}
                      </td>
                      <td className={`px-6 py-3 text-sm whitespace-nowrap ${
                        isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'
                      } border-b`}>
                        {row.acuerdoPago}
                      </td>
                      <td className={`px-6 py-3 text-sm whitespace-nowrap ${
                        isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'
                      } border-b`}>
                        {row.programa?.programa}
                      </td>
                      <td className={`px-6 py-3 text-sm whitespace-nowrap ${
                        isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'
                      } border-b`}>
                        {formatPesos(row.programa?.monto || '0')}
                      </td>
                      <td className={`px-6 py-3 text-sm whitespace-nowrap ${
                        isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'
                      } border-b`}>
                        {formatPesos(row.programa?.ncPrograma || '0')}
                      </td>
                      <td className={`px-6 py-3 text-sm whitespace-nowrap ${
                        isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'
                      } border-b`}>
                        {formatPesos(row.programa?.feePrograma || '0')}
                      </td>
                      <td className={`px-6 py-3 text-sm whitespace-nowrap ${
                        isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'
                      } border-b`}>
                        {row.programa?.proveedorFee || '-'}
                      </td>
                      <td className={`px-6 py-3 text-sm whitespace-nowrap ${
                        isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'
                      } border-b`}>
                        {formatPesos(row.programa?.implementacion || '0')}
                      </td>
                      <td className={`px-6 py-3 text-sm whitespace-nowrap ${
                        isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'
                      } border-b`}>
                        {formatPesos(row.programa?.talentos || '0')}
                      </td>
                      <td className={`px-6 py-3 text-sm whitespace-nowrap ${
                        isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'
                      } border-b`}>
                        {formatPesos(row.programa?.tecnica || '0')}
                      </td>
                      <td className={`px-6 py-3 text-sm whitespace-nowrap ${
                        isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'
                      } border-b`}>
                        {row.programa?.ncPorcentaje}%
                      </td>
                    </>
                  )}
                  
                  {viewMode === 'orden' && (
                    <>
                      <td className={`px-6 py-3 text-sm whitespace-nowrap ${
                        isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'
                      } border-b`}>
                        {row.mesServicio}
                      </td>
                      <td className={`px-6 py-3 text-sm whitespace-nowrap ${
                        isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'
                      } border-b`}>
                        {row.fecha}
                      </td>
                      <td className={`px-6 py-3 text-sm whitespace-nowrap ${
                        isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'
                      } border-b`}>
                        {row.responsable}
                      </td>
                      <td className={`px-6 py-3 text-sm whitespace-nowrap ${
                        isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'
                      } border-b`}>
                        {row.unidadNegocio}
                      </td>
                      <td className={`px-6 py-3 text-sm whitespace-nowrap ${
                        isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'
                      } border-b`}>
                        {row.categoriaNegocio || 'N/A'}
                      </td>
                      <td className={`px-6 py-3 text-sm whitespace-nowrap ${
                        isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'
                      } border-b`}>
                        {row.proyecto || 'No aplica'}
                      </td>
                      <td className={`px-6 py-3 text-sm whitespace-nowrap ${
                        isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'
                      } border-b`}>
                        {row.razonSocial}
                      </td>
                      <td className={`px-6 py-3 text-sm whitespace-nowrap ${
                        isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'
                      } border-b`}>
                        {row.ordenPublicidad}
                      </td>
                      <td className={`px-6 py-3 text-sm whitespace-nowrap ${
                        isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'
                      } border-b`}>
                        {row.cantidadProgramas}
                      </td>
                      <td className={`px-6 py-3 text-sm whitespace-nowrap ${
                        isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'
                      } border-b`}>
                        {row.categoria}
                      </td>
                      <td className={`px-6 py-3 text-sm whitespace-nowrap ${
                        isDark ? 'text-gray-400 border-gray-800' : 'text-[#667085] border-[#eaecf0]'
                      } border-b`}>
                        {row.empresaAgencia}
                      </td>
                      <td className={`px-6 py-3 text-sm whitespace-nowrap ${
                        isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'
                      } border-b`}>
                        {row.marca}
                      </td>
                      <td className={`px-6 py-3 text-sm whitespace-nowrap ${
                        isDark ? 'text-gray-400 border-gray-800' : 'text-[#667085] border-[#eaecf0]'
                      } border-b`}>
                        {row.nombreCampana || '-'}
                      </td>
                      <td className={`px-6 py-3 text-sm whitespace-nowrap ${
                        isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'
                      } border-b`}>
                        {row.acuerdoPago}
                      </td>
                    </>
                  )}
                  
                  {/* Columna de acciones */}
                  <td className={`px-6 py-3 text-sm whitespace-nowrap ${
                    isDark ? 'border-gray-800' : 'border-[#eaecf0]'
                  } border-b`}>
                    <div className="flex items-center justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditFormulario && onEditFormulario(row.id)}
                        className={isDark 
                          ? 'text-gray-400 hover:text-white hover:bg-[#1e1e1e]' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }
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
              className={isDark 
                ? 'border-gray-800 text-gray-400 hover:bg-[#1e1e1e] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1">
              {getPageNumbers().map((page, index) => (
                page === '...' ? (
                  <span 
                    key={`ellipsis-${index}`} 
                    className={`px-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}
                  >
                    ...
                  </span>
                ) : (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePageClick(page as number)}
                    className={currentPage === page
                      ? 'bg-[#fb2c36] text-white hover:bg-[#fb2c36]/90 min-w-[32px]'
                      : isDark
                        ? 'border-gray-800 text-gray-400 hover:bg-[#1e1e1e] hover:text-white min-w-[32px]'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 min-w-[32px]'
                    }
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
              className={isDark 
                ? 'border-gray-800 text-gray-400 hover:bg-[#1e1e1e] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}