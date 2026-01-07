import { useState } from 'react';
import { useImplementacion, BloqueImporte } from '../contexts/ImplementacionContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Search, ChevronLeft, ChevronRight, Plus, Briefcase, ChevronRight as ChevronRightIcon, Key } from 'lucide-react';
import { FormularioImplementacion } from './FormularioImplementacion';
import { ViewSwitch } from './ViewSwitch';

interface TablaImplementacionProps {
    onNewGasto?: () => void;
    onEditGasto?: (id: string) => void;
}

export function TablaImplementacion({ onNewGasto, onEditGasto }: TablaImplementacionProps) {
    const { isDark } = useTheme();
    const { gastos, deleteGasto } = useImplementacion();
    const [viewMode, setViewMode] = useState<'orden' | 'programa'>('programa');
    const [searchTerm, setSearchTerm] = useState('');

    // Internal state removed in favor of props
    // const [isEditing, setIsEditing] = useState(false);
    // const [editingId, setEditingId] = useState<string | undefined>(undefined);

    const handleEdit = (id: string) => {
        onEditGasto?.(id);
    };

    const handleNew = () => {
        onNewGasto?.();
    };

    // Processing Data
    const filteredGastos = gastos.filter(g => {
        const term = searchTerm.toLowerCase();
        return (
            g.ordenPublicidad.toLowerCase().includes(term) ||
            g.responsable.toLowerCase().includes(term) ||
            g.nombreCampana.toLowerCase().includes(term)
        );
    });

    interface ImporteWithParent extends BloqueImporte {
        parentId: string;
        parentOP: string;
        responsable: string;
        unidadNegocio: string;
        sector: string;
        rubroGasto: string;
        subRubro: string;
        nombreCampana: string;
        acuerdoPago: string;
        presupuesto: string;
        categoriaNegocio?: string;
    }

    const allImportes: ImporteWithParent[] = gastos.flatMap(g =>
        g.importes.map(imp => ({
            ...imp,
            parentId: g.id,
            parentOP: g.ordenPublicidad,
            responsable: g.responsable,
            unidadNegocio: g.unidadNegocio,
            sector: g.sector,
            rubroGasto: g.rubroGasto,
            subRubro: g.subRubro,
            nombreCampana: g.nombreCampana,
            acuerdoPago: g.acuerdoPago,
            presupuesto: g.presupuesto,
            categoriaNegocio: g.categoriaNegocio
        }))
    );

    const filteredImportes = allImportes.filter(imp => {
        const term = searchTerm.toLowerCase();
        return (
            imp.parentOP.toLowerCase().includes(term) ||
            imp.programa.toLowerCase().includes(term)
        );
    });

    // Removed conditional rendering of FormularioImplementacion directly
    // if (isEditing) {
    //    return <FormularioImplementacion gastoId={editingId} onClose={() => setIsEditing(false)} />;
    // }

    // Colors mapping
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pendiente': return 'bg-yellow-400';
            case 'pendiente-pago': return 'bg-yellow-400';
            case 'pagado': return 'bg-[#00d6b5]'; // Custom Teal/Cyan from image
            case 'activo': return 'bg-[#00d6b5]';
            case 'cerrado': return 'bg-green-500';
            case 'anulado': return 'bg-red-500';
            default: return 'bg-gray-400';
        }
    };

    // Check capitalization for labels
    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pendiente-pago': return 'Pendiente de pago';
            case 'pagado': return 'Pagado';
            case 'anulado': return 'Anulado';
            case 'pendiente': return 'Pendiente';
            case 'activo': return 'Activo';
            case 'cerrado': return 'Cerrado';
            default: return status;
        }
    };

    // Helper for row styles
    const thClass = `px-6 py-3 text-left text-xs font-bold whitespace-nowrap border-b ${isDark ? 'text-gray-400 border-gray-800' : 'text-[#667085] border-[#eaecf0]'}`;
    const tdClass = `px-6 py-3 text-sm whitespace-nowrap border-b ${isDark ? 'text-white border-gray-800' : 'text-[#1d1d1d] border-[#eaecf0]'}`;

    // Format currency helper
    const formatCurrency = (val: string | number) => {
        const num = typeof val === 'string' ? parseFloat(val) : val;
        return isNaN(num) ? '-' : new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(num);
    };

    return (
        <div className="space-y-6">

            {/* BIG CARD "NUEVO FORMULARIO" (Matches App.tsx Commercial view) */}
            <div
                onClick={handleNew}
                className={`p-4 border rounded-lg hover:border-[#fb2c36] transition-all cursor-pointer group inline-flex items-center gap-3 w-[320px] ${isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'
                    }`}
            >
                <div className="bg-[#fb2c36]/20 p-2.5 rounded-lg group-hover:bg-[#fb2c36]/30 transition-colors">
                    <Key className="h-5 w-5 text-[#fb2c36]" />
                </div>
                <div>
                    <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Nuevo Gasto</h3>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Cargar Gasto de implementación</p>
                </div>
                <ChevronRightIcon className={`h-4 w-4 ml-auto group-hover:text-[#fb2c36] transition-colors ${isDark ? 'text-gray-600' : 'text-gray-400'
                    }`} />
            </div>

            {/* HEADER ROW & TABLE CONTAINER */}
            <div className="space-y-4">
                {/* HEADER ROW: Title + Search + Switch */}
                <div className="flex items-center justify-between gap-4">
                    <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Detalle de gastos</h2>

                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="relative w-48 sm:w-64">
                            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                            <Input
                                placeholder="Buscar..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`pl-10 ${isDark ? 'bg-[#1e1e1e] border-gray-800 text-white placeholder:text-gray-600 focus:border-[#fb2c36]' : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#fb2c36]'}`}
                            />
                        </div>

                        {/* View Switch */}
                        <ViewSwitch mode={viewMode} onModeChange={setViewMode} />
                    </div>
                </div>

                {/* TABLE */}
                <div className={`rounded-lg border overflow-hidden ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className={isDark ? 'bg-[#1e1e1e]' : 'bg-[#fcfcfd]'}>
                                <tr>
                                    <th className={thClass}>Estado</th>
                                    <th className={thClass}>Fecha de registro</th>
                                    <th className={thClass}>Responsable</th>
                                    <th className={thClass}>Unidad de negocio</th>
                                    <th className={thClass}>Categoría de negocio</th>

                                    {viewMode === 'programa' ? (
                                        <>
                                            <th className={thClass}>Empresa/PGM</th>
                                            <th className={thClass}>Orden de Publicidad</th>
                                            <th className={thClass}>Presupuesto</th>
                                            <th className={thClass}>Sector</th>
                                            <th className={thClass}>Rubro de gasto</th>
                                            <th className={thClass}>Sub rubro</th>
                                            <th className={thClass}>Nombre de campaña</th>
                                            <th className={thClass}>Acuerdo de pago</th>
                                            <th className={thClass}>Neto</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className={thClass}>Orden de Publicidad</th>
                                            <th className={thClass}>Presupuesto</th>
                                            <th className={thClass}>Cant. de programas</th>
                                            <th className={thClass}>Sector</th>
                                            <th className={thClass}>Rubro de gasto</th>
                                            <th className={thClass}>Sub rubro</th>
                                            <th className={thClass}>Nombre de campaña</th>
                                            <th className={thClass}>Neto Total</th>
                                        </>
                                    )}
                                    <th className={thClass}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(viewMode === 'orden' ? filteredGastos : filteredImportes).map((item: any) => {
                                    const status = viewMode === 'orden' ? item.estadoOP : item.estadoPgm;
                                    const statusColor = getStatusColor(status);
                                    const statusLabel = getStatusLabel(status);
                                    const id = viewMode === 'orden' ? item.id : item.parentId;

                                    return (
                                        <tr key={viewMode === 'orden' ? item.id : item.id} className={isDark ? 'bg-[#141414] hover:bg-[#1a1a1a]' : 'bg-white hover:bg-gray-50'}>
                                            <td className={tdClass}>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${statusColor}`} />
                                                    <span className={isDark ? 'text-white' : 'text-gray-900'}>{statusLabel}</span>
                                                </div>
                                            </td>
                                            <td className={tdClass}>{viewMode === 'orden' ? item.fechaRegistro : item.fechaComprobante}</td>
                                            <td className={tdClass}>{item.responsable}</td>
                                            <td className={tdClass}>{item.unidadNegocio}</td>
                                            <td className={tdClass}>{item.categoriaNegocio || '-'}</td>

                                            {viewMode === 'programa' ? (
                                                <>
                                                    <td className={tdClass}>{item.empresaPgm}</td>
                                                    <td className={tdClass}>{item.parentOP}</td>
                                                    <td className={tdClass}>{formatCurrency(item.presupuesto)}</td>
                                                    <td className={tdClass}>{item.sector}</td>
                                                    <td className={tdClass}>{item.rubroGasto}</td>
                                                    <td className={tdClass}>{item.subRubro}</td>
                                                    <td className={tdClass}>{item.nombreCampana}</td>
                                                    <td className={tdClass}>{item.acuerdoPago}</td>
                                                    <td className={tdClass}>{formatCurrency(item.neto)}</td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className={tdClass}>{item.ordenPublicidad}</td>
                                                    <td className={tdClass}>{formatCurrency(item.presupuesto)}</td>
                                                    <td className={tdClass}>{item.cantidadProgramas}</td>
                                                    <td className={tdClass}>{item.sector}</td>
                                                    <td className={tdClass}>{item.rubroGasto}</td>
                                                    <td className={tdClass}>{item.subRubro}</td>
                                                    <td className={tdClass}>{item.nombreCampana}</td>
                                                    <td className={tdClass}>
                                                        {item.importes ? formatCurrency(item.importes.reduce((sum: number, i: any) => sum + (parseFloat(i.neto) || 0), 0)) : '-'}
                                                    </td>
                                                </>
                                            )}

                                            <td className={tdClass}>
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(id)}>
                                                        <div className="flex flex-col gap-[2px]">
                                                            <div className="w-1 h-1 bg-gray-500 rounded-full" />
                                                            <div className="w-1 h-1 bg-gray-500 rounded-full" />
                                                            <div className="w-1 h-1 bg-gray-500 rounded-full" />
                                                        </div>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center py-4">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" disabled><ChevronLeft className="h-4 w-4" /></Button>
                    <Button variant="secondary" size="sm" className="bg-blue-100 text-blue-600 hover:bg-blue-200">1</Button>
                    <Button variant="ghost" size="sm">2</Button>
                    <Button variant="ghost" size="sm">3</Button>
                    <Button variant="ghost" size="icon"><ChevronRight className="h-4 w-4" /></Button>
                </div>
            </div>

        </div>
    );
}
