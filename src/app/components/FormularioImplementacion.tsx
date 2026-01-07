import { useState, useEffect } from 'react';
import { useImplementacion, GastoImplementacion, BloqueImporte } from '../contexts/ImplementacionContext';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { DialogNuevoProveedor } from './DialogNuevoProveedor';
import { DialogNuevaRazonSocial } from './DialogNuevaRazonSocial';
import { toast } from 'sonner';
import { Plus, Trash2, Upload, ChevronDown, Lock, AlertTriangle, X, Search } from 'lucide-react';

interface FormularioImplementacionProps {
    gastoId?: string;
    onClose: () => void;
}

export function FormularioImplementacion({ gastoId, onClose }: FormularioImplementacionProps) {
    const { isDark } = useTheme();
    const { gastos, addGasto, updateGasto, getGastoById } = useImplementacion();
    const { currentUser } = useData();

    const [showNuevoProveedor, setShowNuevoProveedor] = useState(false);
    const [showNuevaRazonSocial, setShowNuevaRazonSocial] = useState(false);
    const [activeImporteId, setActiveImporteId] = useState<string | null>(null);

    const [formData, setFormData] = useState<GastoImplementacion>({
        id: crypto.randomUUID(),
        estadoOP: 'pendiente',
        fechaRegistro: '',
        responsable: '',
        unidadNegocio: '',
        categoriaNegocio: '',
        ordenPublicidad: 'OP-2024-001',
        presupuesto: '5000000',
        cantidadProgramas: 0,
        programasDisponibles: ['Programa 1', 'Programa 2'],
        sector: 'Implementación',
        rubroGasto: 'Gasto de venta',
        subRubro: 'Producción',
        nombreCampana: 'Campaña Mock',
        acuerdoPago: '30 días',
        facturaEmitidaA: '',
        empresa: '',
        conceptoGasto: '',
        observaciones: '',
        importes: []
    });

    useEffect(() => {
        if (gastoId) {
            const existingGasto = getGastoById(gastoId);
            if (existingGasto) {
                setFormData(existingGasto);
            }
        } else {
            setFormData(prev => ({
                ...prev,
                fechaRegistro: new Date().toISOString().split('T')[0],
                responsable: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Usuario Actual',
                importes: [{
                    id: crypto.randomUUID(),
                    programa: '',
                    empresaPgm: '',
                    fechaComprobante: new Date().toISOString().split('T')[0],
                    proveedor: '',
                    razonSocial: '',
                    condicionPago: '30',
                    neto: '',
                    estadoPgm: 'pendiente-pago'
                }]
            }));
        }
    }, [gastoId, getGastoById, currentUser]);

    const isCerrado = formData.estadoOP === 'cerrado' || formData.estadoOP === 'anulado';

    const handleInputChange = (field: keyof GastoImplementacion, value: any) => {
        setFormData(prev => {
            const updates: Partial<GastoImplementacion> = { [field]: value };
            if (field === 'unidadNegocio' && value !== 'Media') {
                updates.categoriaNegocio = '';
            }
            return { ...prev, ...updates };
        });
    };

    const addImporte = () => {
        const newImporte: BloqueImporte = {
            id: crypto.randomUUID(),
            programa: '',
            empresaPgm: '',
            fechaComprobante: new Date().toISOString().split('T')[0],
            proveedor: '',
            razonSocial: '',
            condicionPago: '30',
            neto: '',
            estadoPgm: 'pendiente-pago'
        };
        setFormData(prev => ({ ...prev, importes: [...prev.importes, newImporte] }));
    };

    const removeImporte = (id: string) => {
        if (formData.importes.length === 1) {
            toast.error('Debe haber al menos un bloque de importe');
            return;
        }
        setFormData(prev => ({ ...prev, importes: prev.importes.filter(imp => imp.id !== id) }));
    };

    const updateImporte = (id: string, field: keyof BloqueImporte, value: any) => {
        setFormData(prev => ({
            ...prev,
            importes: prev.importes.map(imp => imp.id === id ? { ...imp, [field]: value } : imp)
        }));
    };

    const validarFormulario = () => {
        if (!formData.facturaEmitidaA) { toast.error('Debe seleccionar a quién se emite la factura'); return false; }
        if (!formData.empresa) { toast.error('Debe seleccionar una empresa'); return false; }
        if (!formData.unidadNegocio) { toast.error('Debe seleccionar una unidad de negocio'); return false; }
        if (formData.unidadNegocio === 'Media' && !formData.categoriaNegocio) { toast.error('Debe seleccionar una categoría de negocio para Media'); return false; }
        if (!formData.conceptoGasto.trim()) { toast.error('Debe ingresar un concepto de gasto'); return false; }

        for (const imp of formData.importes) {
            if (!imp.empresaPgm || !imp.fechaComprobante || !imp.proveedor || !imp.razonSocial || !imp.condicionPago || !imp.neto) {
                toast.error('Complete todos los campos de los bloques de importe');
                return false;
            }
        }
        return true;
    };

    const handleGuardar = () => {
        if (!validarFormulario()) return;

        if (gastoId) {
            updateGasto(formData.id, formData);
            toast.success('Gasto actualizado correctamente');
        } else {
            addGasto(formData);
            toast.success('Gasto creado correctamente');
        }
        onClose();
    };

    const ejecutado = formData.importes.reduce((sum, imp) => sum + (parseFloat(imp.neto) || 0), 0);
    const asignado = parseFloat(formData.presupuesto) || 0;
    const disponible = asignado - ejecutado;
    const excedido = ejecutado > asignado;

    const formatCurrency = (val: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(val);
    const handleProveedorCreado = (nombre: string) => { if (activeImporteId) { updateImporte(activeImporteId, 'proveedor', nombre); setActiveImporteId(null); } };
    const handleRazonSocialCreada = (rs: string) => { if (activeImporteId) { updateImporte(activeImporteId, 'razonSocial', rs); setActiveImporteId(null); } };

    // Common Input Class Logic from FormularioInteligente
    const inputClass = isDark
        ? 'bg-[#141414] border-gray-800 text-white placeholder:text-gray-600 focus:border-[#fb2c36] disabled:opacity-60 disabled:cursor-not-allowed'
        : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#fb2c36] disabled:opacity-60 disabled:cursor-not-allowed';

    const labelClass = `${isDark ? 'text-gray-400' : 'text-gray-700'} flex items-center gap-1`;

    return (
        <div className={`min-h-screen py-4 sm:py-6 ${isDark ? 'bg-transparent' : 'bg-white'}`}>
            <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
                <div className="space-y-6 sm:space-y-8">

                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className={`text-xl sm:text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {gastoId ? 'Editar Gasto' : 'Nuevo Formulario'}
                                </h1>
                                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                                    {gastoId ? 'Edite la información del gasto de implementación' : 'Carga de gasto de implementación'}
                                </p>
                            </div>
                            {isCerrado && <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300 border border-gray-500">🔒 Gasto Cerrado</span>}
                        </div>
                        {isCerrado && (
                            <div className="mt-4 p-4 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 flex items-center gap-2 text-red-700 dark:text-red-400">
                                <Lock className="w-4 h-4" />
                                <span className="text-sm">Este gasto está {formData.estadoOP} y no puede ser editado.</span>
                            </div>
                        )}
                    </div>

                    {/* SECCIÓN 1: CARGA DE DATOS */}
                    <div className="space-y-6">
                        <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Carga de datos</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className={labelClass}>Factura emitida a *</Label>
                                <div className="relative">
                                    <select
                                        value={formData.facturaEmitidaA}
                                        onChange={(e) => handleInputChange('facturaEmitidaA', e.target.value)}
                                        disabled={isCerrado}
                                        className={`w-full h-10 pl-3 pr-10 rounded-md border text-sm appearance-none ${isDark ? 'bg-[#141414] border-gray-800 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-1 focus:ring-[#fb2c36]`}
                                    >
                                        <option value="">Seleccionar</option>
                                        <option value="Luzu TV">Luzu TV</option>
                                        <option value="Luzu TV SA">Luzu TV SA</option>
                                    </select>
                                    <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className={labelClass}>Empresa *</Label>
                                <div className="relative">
                                    <select
                                        value={formData.empresa}
                                        onChange={(e) => handleInputChange('empresa', e.target.value)}
                                        disabled={isCerrado}
                                        className={`w-full h-10 pl-3 pr-10 rounded-md border text-sm appearance-none ${isDark ? 'bg-[#141414] border-gray-800 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-1 focus:ring-[#fb2c36]`}
                                    >
                                        <option value="">Seleccionar</option>
                                        <option value="Luzu TV">Luzu TV</option>
                                        <option value="Luzu TV SA">Luzu TV SA</option>
                                    </select>
                                    <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className={labelClass}>Unidad de negocio *</Label>
                                <div className="relative">
                                    <select
                                        value={formData.unidadNegocio}
                                        onChange={(e) => handleInputChange('unidadNegocio', e.target.value)}
                                        disabled={isCerrado}
                                        className={`w-full h-10 pl-3 pr-10 rounded-md border text-sm appearance-none ${isDark ? 'bg-[#141414] border-gray-800 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-1 focus:ring-[#fb2c36]`}
                                    >
                                        <option value="">Seleccionar</option>
                                        <option value="Media">Media</option>
                                        <option value="Experience">Experience</option>
                                        <option value="Productora">Productora</option>
                                        <option value="E-commerce">E-commerce</option>
                                        <option value="Estructura">Estructura</option>
                                    </select>
                                    <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className={labelClass}>Categoría de negocio</Label>
                                <div className="relative">
                                    <select
                                        value={formData.categoriaNegocio}
                                        onChange={(e) => handleInputChange('categoriaNegocio', e.target.value)}
                                        disabled={isCerrado || formData.unidadNegocio !== 'Media'}
                                        className={`w-full h-10 pl-3 pr-10 rounded-md border text-sm appearance-none ${isDark ? 'bg-[#141414] border-gray-800 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-1 focus:ring-[#fb2c36] disabled:opacity-50`}
                                    >
                                        <option value="">Seleccionar</option>
                                        <option value="Media">Media</option>
                                        <option value="PEM - Proyectos especiales Marketing">PEM - Proyectos especiales Marketing</option>
                                        <option value="PEP - Proyectos Especiales Programación">PEP - Proyectos Especiales Programación</option>
                                        <option value="BC - Branded content">BC - Branded content</option>
                                    </select>
                                    <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className={labelClass}>Sector</Label>
                                <Input value="Implementación" disabled className={inputClass} />
                            </div>
                            <div className="space-y-2">
                                <Label className={labelClass}>Rubro de gasto</Label>
                                <Input value="Gasto de venta" disabled className={inputClass} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className={labelClass}>Sub rubro</Label>
                                <Input value={formData.subRubro} disabled className={inputClass} />
                            </div>
                            <div className="space-y-2">
                                <Label className={labelClass}>Nombre de la campaña *</Label>
                                <Input value={formData.nombreCampana} disabled className={inputClass} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className={labelClass}>Detalle/campaña *</Label>
                            <div className="relative">
                                <Textarea
                                    value={formData.conceptoGasto}
                                    onChange={(e) => handleInputChange('conceptoGasto', e.target.value)}
                                    maxLength={250}
                                    disabled={isCerrado}
                                    placeholder="Mural + Corpóreos"
                                    className={`min-h-[100px] resize-none ${inputClass}`}
                                />
                                <span className="absolute bottom-2 right-2 text-xs text-gray-400">{formData.conceptoGasto.length}/250</span>
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 2: CARGA DE IMPORTES */}
                    <div className="space-y-6 pt-6 border-t dark:border-gray-800">
                        <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Carga de importes</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className={labelClass}>Orden de publicidad</Label>
                                <Input value={formData.ordenPublicidad} disabled className={inputClass} />
                            </div>
                            <div className="space-y-2">
                                <Label className={labelClass}>Presupuesto</Label>
                                <Input value={formatCurrency(parseFloat(formData.presupuesto))} disabled className={inputClass} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            {formData.importes.map((imp, idx) => (
                                <div key={imp.id} className={`rounded-lg border p-6 space-y-4 ${isDark ? 'bg-[#141414] border-gray-800' : 'bg-[#f8f9fc] border-gray-200'}`}>
                                    <div className="flex justify-between items-center">
                                        <h3 className={`font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Gasto #{idx + 1}</h3>
                                        {formData.importes.length > 1 && !isCerrado && (
                                            <button onClick={() => removeImporte(imp.id)} className="text-gray-400 hover:text-red-500" title="Eliminar bloque">
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className={labelClass}>Empresa/PGM *</Label>
                                            <div className="relative">
                                                <select
                                                    value={imp.empresaPgm}
                                                    onChange={(e) => updateImporte(imp.id, 'empresaPgm', e.target.value)}
                                                    disabled={isCerrado}
                                                    className={`w-full h-10 pl-3 pr-10 rounded-md border text-sm appearance-none ${isDark ? 'bg-[#1e1e1e] border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-1 focus:ring-[#fb2c36]`}
                                                >
                                                    <option value="">Seleccionar</option>
                                                    {formData.programasDisponibles.map(p => <option key={p} value={p}>{p}</option>)}
                                                </select>
                                                <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className={labelClass}>Fecha comprobante *</Label>
                                            <Input
                                                type="date"
                                                value={imp.fechaComprobante}
                                                onChange={(e) => updateImporte(imp.id, 'fechaComprobante', e.target.value)}
                                                disabled={isCerrado}
                                                className={inputClass}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className={labelClass}>Proveedor *</Label>
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                                                    <Input
                                                        value={imp.proveedor}
                                                        onChange={(e) => updateImporte(imp.id, 'proveedor', e.target.value)}
                                                        disabled={isCerrado}
                                                        className={`pl-10 ${inputClass}`}
                                                        placeholder="Buscar proveedor"
                                                    />
                                                </div>
                                                <Button size="icon" className="bg-[#0070ff] hover:bg-[#0060dd] text-white shrink-0" onClick={() => { setActiveImporteId(imp.id); setShowNuevoProveedor(true); }} disabled={isCerrado}>
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className={labelClass}>Razón social *</Label>
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                                                    <Input
                                                        value={imp.razonSocial}
                                                        onChange={(e) => updateImporte(imp.id, 'razonSocial', e.target.value)}
                                                        disabled={isCerrado}
                                                        className={`pl-10 ${inputClass}`}
                                                        placeholder="Buscar razón social"
                                                    />
                                                </div>
                                                <Button size="icon" className="bg-[#0070ff] hover:bg-[#0060dd] text-white shrink-0" onClick={() => { setActiveImporteId(imp.id); setShowNuevaRazonSocial(true); }} disabled={isCerrado}>
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className={labelClass}>Acuerdo de pago *</Label>
                                            <div className="relative">
                                                <select
                                                    value={imp.condicionPago}
                                                    onChange={(e) => updateImporte(imp.id, 'condicionPago', e.target.value)}
                                                    disabled={isCerrado}
                                                    className={`w-full h-10 pl-3 pr-10 rounded-md border text-sm appearance-none ${isDark ? 'bg-[#1e1e1e] border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-1 focus:ring-[#fb2c36]`}
                                                >
                                                    <option value="">Seleccionar</option>
                                                    <option value="30">30 días</option>
                                                    <option value="45">45 días</option>
                                                    <option value="60">60 días</option>
                                                </select>
                                                <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className={labelClass}>Neto *</Label>
                                            <Input
                                                type="number"
                                                value={imp.neto}
                                                onChange={(e) => updateImporte(imp.id, 'neto', e.target.value)}
                                                disabled={isCerrado}
                                                placeholder="$0.00"
                                                className={inputClass}
                                            />
                                        </div>
                                    </div>

                                    {!isCerrado && (
                                        <div className="flex justify-start">
                                            <button className="text-sm text-blue-500 hover:text-blue-600 font-medium">
                                                Agregar adjuntos
                                            </button>
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-2 pt-2">
                                        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                                        <Button variant="outline" className="text-blue-500 border-blue-200 hover:bg-blue-50">Guardar</Button>
                                    </div>
                                </div>
                            ))}

                            {!isCerrado && (
                                <div className="flex justify-end">
                                    <Button onClick={addImporte} className="bg-[#0070ff] hover:bg-[#0060dd] text-white">
                                        <Plus className="h-4 w-4 mr-2" /> Agregar importe
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SECCIÓN 3: OBSERVACIONES */}
                    <div className="space-y-4 pt-6">
                        <Labels className={labelClass}>Observaciones</Labels>
                        <Textarea
                            value={formData.observaciones}
                            onChange={(e) => handleInputChange('observaciones', e.target.value)}
                            maxLength={250}
                            disabled={isCerrado}
                            placeholder="Type here"
                            className={`min-h-[100px] resize-none ${inputClass}`}
                        />
                    </div>

                    {/* SECCIÓN 4: RESUMEN PRESUPUESTARIO */}
                    <div className={`p-6 rounded-lg border ${isDark ? 'bg-[#141414] border-gray-800' : 'bg-white border-gray-200'}`}>
                        <h2 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Resumen</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* Card: Presupuesto Asignado */}
                            <div className={`p-4 rounded-lg flex flex-col items-center justify-center text-center gap-1 ${isDark ? 'bg-[#1e1e1e]' : 'bg-[#F3F5FF]'}`}>
                                <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Presupuesto Asignado</span>
                                <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(asignado)}</span>
                                <span className="text-xs font-medium text-green-500">100%</span>
                            </div>

                            {/* Card: Ejecutado */}
                            <div className={`p-4 rounded-lg flex flex-col items-center justify-center text-center gap-1 ${isDark ? 'bg-[#1e1e1e]' : 'bg-[#F3F5FF]'}`}>
                                <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Ejecutado</span>
                                <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(ejecutado)}</span>
                                <span className={`text-xs font-medium ${excedido ? 'text-red-500' : 'text-blue-500'}`}>
                                    {asignado > 0 ? `${((ejecutado / asignado) * 100).toFixed(1)}%` : '0%'}
                                </span>
                            </div>

                            {/* Card: Disponible */}
                            <div className={`p-4 rounded-lg flex flex-col items-center justify-center text-center gap-1 ${isDark ? 'bg-[#1e1e1e]' : 'bg-[#F3F5FF]'}`}>
                                <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Disponible</span>
                                <span className={`text-xl font-bold ${excedido ? 'text-red-500' : (isDark ? 'text-white' : 'text-gray-900')}`}>{formatCurrency(Math.abs(disponible))}</span>
                                <span className={`text-xs font-medium ${excedido ? 'text-red-500' : 'text-green-500'}`}>
                                    {asignado > 0 ? `${((disponible / asignado) * 100).toFixed(1)}%` : '0%'}
                                </span>
                            </div>

                        </div>
                    </div>

                    {/* FOOTER */}
                    <div className="flex justify-end gap-3 pt-8 pb-8">
                        <Button variant="ghost" onClick={onClose} className="text-gray-500">Cancelar</Button>
                        <Button onClick={handleGuardar} className="bg-[#0070ff] hover:bg-[#0060dd] text-white px-8">Guardar</Button>
                    </div>

                </div>
            </div>

            <DialogNuevoProveedor open={showNuevoProveedor} onOpenChange={setShowNuevoProveedor} onProveedorCreado={handleProveedorCreado} />
            <DialogNuevaRazonSocial open={showNuevaRazonSocial} onOpenChange={setShowNuevaRazonSocial} onRazonSocialCreada={handleRazonSocialCreada} />
        </div>
    );
}

function Labels({ children, className }: { children: React.ReactNode; className?: string }) {
    return <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}>{children}</label>;
}
