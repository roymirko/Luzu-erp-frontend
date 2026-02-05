import { useTheme } from '../contexts/ThemeContext';
import { useFormularios } from '../contexts/FormulariosContext';
import { Pencil } from 'lucide-react';
import { Button } from './ui/button';
import { FilterToggle } from './ui/filter-toggle';
import { TableHeader } from './ui/table-header';
import { DataTable, DataTableHead, DataTableHeaderCell, DataTableBody, DataTableRow, DataTableCell, DataTableEmpty } from './ui/data-table';
import { DataTablePagination } from './ui/data-table-pagination';
import { useState, useMemo } from 'react';

const ITEMS_PER_PAGE = 10;

interface TablaFormulariosProps {
  onEditFormulario?: (id: string) => void;
}

const COLUMNS_PROGRAMA = [
  'Mes de servicio', 'Fecha', 'Responsable', 'Unidad de negocio', 'Categoría de negocio',
  'Proyecto', 'Razón social', 'Orden de Publicidad', 'Categoría', 'Empresa/Agencia',
  'Marca', 'Nombre de campaña', 'Acuerdo de pago', 'Programa', 'Monto', 'NC PGM',
  'FEE PGM', 'Proveedor FEE', 'Implementación', 'Talentos', 'Técnica', '%', 'Acciones'
];

const COLUMNS_ORDEN = [
  'Mes de servicio', 'Fecha', 'Responsable', 'Unidad de negocio', 'Categoría de negocio',
  'Proyecto', 'Razón social', 'Orden de Publicidad', 'Cant. Programas', 'Categoría',
  'Empresa/Agencia', 'Marca', 'Nombre de campaña', 'Acuerdo de pago', 'Acciones'
];

const VIEW_MODE_OPTIONS = [
  { value: 'programa', label: 'Programa' },
  { value: 'orden', label: 'Orden de Publicidad' },
];

export function TablaFormularios({ onEditFormulario }: TablaFormulariosProps = {}) {
  const { isDark } = useTheme();
  const { formularios } = useFormularios();
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'programa' | 'orden'>('programa');
  const [searchTerm, setSearchTerm] = useState('');

  const formatPesos = (value: string) => {
    const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
    if (isNaN(num)) return '$0';
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(num);
  };

  const rowsData = useMemo(() => {
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
      return filtered.flatMap(form => 
        (form.importeRows || []).map((prog, index) => ({
          ...form,
          programa: prog,
          isFirstRow: index === 0,
          rowSpan: (form.importeRows || []).length,
        }))
      );
    } else {
      return filtered.map(form => ({
        ...form,
        cantidadProgramas: (form.importeRows || []).length,
        isFirstRow: true,
        rowSpan: 1,
      }));
    }
  }, [formularios, viewMode, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(rowsData.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentRows = rowsData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const columns = viewMode === 'programa' ? COLUMNS_PROGRAMA : COLUMNS_ORDEN;

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  if (formularios.length === 0) {
    return (
      <div className={`p-8 rounded-lg border text-center ${isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'}`}>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
          No hay formularios guardados aún. Crea uno nuevo para comenzar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TableHeader
        title="Formularios Comerciales"
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
      >
        <FilterToggle
          options={VIEW_MODE_OPTIONS}
          value={viewMode}
          onChange={(v) => { setViewMode(v as 'programa' | 'orden'); setCurrentPage(1); }}
        />
      </TableHeader>
      
      <DataTable>
        <DataTableHead>
          <tr>
            {columns.map((col) => (
              <DataTableHeaderCell key={col}>{col}</DataTableHeaderCell>
            ))}
          </tr>
        </DataTableHead>
        <DataTableBody>
          {currentRows.length === 0 ? (
            <DataTableEmpty colSpan={columns.length}>
              {searchTerm ? 'No se encontraron resultados' : 'Sin formularios registrados'}
            </DataTableEmpty>
          ) : (
            currentRows.map((row, index) => (
              <DataTableRow
                key={viewMode === 'programa' ? `${row.id}-${row.programa?.id}-${startIndex + index}` : `${row.id}-${startIndex + index}`}
                onClick={() => onEditFormulario?.(row.id)}
              >
                {viewMode === 'programa' ? (
                  <>
                    <DataTableCell>{row.mesServicio}</DataTableCell>
                    <DataTableCell>{row.fecha}</DataTableCell>
                    <DataTableCell>{row.responsable}</DataTableCell>
                    <DataTableCell>{row.unidadNegocio}</DataTableCell>
                    <DataTableCell>{row.categoriaNegocio || 'N/A'}</DataTableCell>
                    <DataTableCell>{row.proyecto || 'No aplica'}</DataTableCell>
                    <DataTableCell>{row.razonSocial}</DataTableCell>
                    <DataTableCell>{row.ordenPublicidad}</DataTableCell>
                    <DataTableCell>{row.categoria}</DataTableCell>
                    <DataTableCell muted>{row.empresaAgencia}</DataTableCell>
                    <DataTableCell>{row.marca}</DataTableCell>
                    <DataTableCell muted>{row.nombreCampana || '-'}</DataTableCell>
                    <DataTableCell>{row.acuerdoPago}</DataTableCell>
                    <DataTableCell>{row.programa?.programa}</DataTableCell>
                    <DataTableCell>{formatPesos(row.programa?.monto || '0')}</DataTableCell>
                    <DataTableCell>{formatPesos(row.programa?.ncPrograma || '0')}</DataTableCell>
                    <DataTableCell>{formatPesos(row.programa?.feePrograma || '0')}</DataTableCell>
                    <DataTableCell>{row.programa?.proveedorFee || '-'}</DataTableCell>
                    <DataTableCell>{formatPesos(row.programa?.implementacion || '0')}</DataTableCell>
                    <DataTableCell>{formatPesos(row.programa?.talentos || '0')}</DataTableCell>
                    <DataTableCell>{formatPesos(row.programa?.tecnica || '0')}</DataTableCell>
                    <DataTableCell>{row.programa?.ncPorcentaje}%</DataTableCell>
                  </>
                ) : (
                  <>
                    <DataTableCell>{row.mesServicio}</DataTableCell>
                    <DataTableCell>{row.fecha}</DataTableCell>
                    <DataTableCell>{row.responsable}</DataTableCell>
                    <DataTableCell>{row.unidadNegocio}</DataTableCell>
                    <DataTableCell>{row.categoriaNegocio || 'N/A'}</DataTableCell>
                    <DataTableCell>{row.proyecto || 'No aplica'}</DataTableCell>
                    <DataTableCell>{row.razonSocial}</DataTableCell>
                    <DataTableCell>{row.ordenPublicidad}</DataTableCell>
                    <DataTableCell>{row.cantidadProgramas}</DataTableCell>
                    <DataTableCell>{row.categoria}</DataTableCell>
                    <DataTableCell muted>{row.empresaAgencia}</DataTableCell>
                    <DataTableCell>{row.marca}</DataTableCell>
                    <DataTableCell muted>{row.nombreCampana || '-'}</DataTableCell>
                    <DataTableCell>{row.acuerdoPago}</DataTableCell>
                  </>
                )}
                <DataTableCell>
                  <div className="flex items-center justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditFormulario?.(row.id);
                      }}
                      className={isDark ? 'text-gray-400 hover:text-white hover:bg-[#1e1e1e]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </DataTableCell>
              </DataTableRow>
            ))
          )}
        </DataTableBody>
      </DataTable>

      <DataTablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
