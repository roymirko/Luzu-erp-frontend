import { useState, useEffect } from 'react';
import { Plus, Search, X, Trash2, AlertCircle, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { useTheme } from '../contexts/ThemeContext';
import { useFormularios } from '../contexts/FormulariosContext';
import { useFormFields } from '../contexts/FormFieldsContext';
import { useData } from '../contexts/DataContext';
import { toast } from 'sonner';

interface FormularioInteligenteProps {
  onFormularioGuardado?: () => void;
  formularioId?: string | null;
}

interface ImporteRow {
  id: string;
  programa: string;
  monto: string;
  ncPrograma: string;
  ncPorcentaje: string;
  proveedorFee: string;
  feePrograma: string;
  feePorcentaje: string;
  implementacion: string;
  talentos: string;
  tecnica: string;
}

const PROGRAMAS_LUZU = [
  'FM Luzu',
  'Antes Que Nadie',
  'Nadie Dice Nada',
  'Patria y Familia',
  'Se Fue Larga',
  'La Novela',
  'Algo Va A Picar',
  'Los No Talentos',
  'Algo de Música',
  'Xtream Master',
  'Edición Especial',
];

const MAX_CHARS_CAMPANA = 100;
const MAX_CHARS_OBSERVACIONES = 500;

export function FormularioInteligente({ onFormularioGuardado, formularioId }: FormularioInteligenteProps = {}) {
  const { isDark } = useTheme();
  const { addFormulario, formularios, updateFormulario } = useFormularios();
  const { fieldsConfig } = useFormFields();
  const { currentUser } = useData();

  // Detectar si estamos editando
  const isEditMode = !!formularioId;
  const formularioExistente = isEditMode ? formularios.find(f => f.id === formularioId) : null;

  // Obtener opciones dinámicas del Context
  const getFieldOptions = (fieldLabel: string) => {
    const field = fieldsConfig.find(f => f.label === fieldLabel && f.category === 'Comercial');
    return field?.options.filter(opt => opt.active).map(opt => opt.value) || [];
  };

  const UNIDADES_NEGOCIO = getFieldOptions('Unidad de Negocio');
  const CATEGORIAS_NEGOCIO_OPTIONS = getFieldOptions('Categoría de Negocio');
  const CATEGORIAS_MARCA = getFieldOptions('Categoría');
  const ACUERDOS_PAGO = getFieldOptions('Acuerdo de Pago');

  // Estados básicos
  const [mesServicio, setMesServicio] = useState('');
  const [mesServicioMes, setMesServicioMes] = useState('');
  const [mesServicioAnio, setMesServicioAnio] = useState('');
  const [ordenPublicidad, setOrdenPublicidad] = useState('');
  const [totalVenta, setTotalVenta] = useState('');
  const [unidadNegocio, setUnidadNegocio] = useState('');
  const [categoriaNegocio, setCategoriaNegocio] = useState('');
  const [proyecto, setProyecto] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [categoria, setCategoria] = useState('');
  const [empresaAgencia, setEmpresaAgencia] = useState('');
  const [marca, setMarca] = useState('');
  const [nombreCampana, setNombreCampana] = useState('');
  const [acuerdoPago, setAcuerdoPago] = useState('');
  const [tipoImporte, setTipoImporte] = useState<'canje' | 'factura'>('factura');
  const [observaciones, setObservaciones] = useState('');
  const [showAddRazonSocial, setShowAddRazonSocial] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para el modal de nueva razón social
  const [newRazonSocial, setNewRazonSocial] = useState('');
  const [newCuit, setNewCuit] = useState('');
  const [newDireccion, setNewDireccion] = useState('');
  const [newEmpresaAgencia, setNewEmpresaAgencia] = useState('');

  const [importeRows, setImporteRows] = useState<ImporteRow[]>([
    {
      id: '1',
      programa: '',
      monto: '',
      ncPrograma: '',
      ncPorcentaje: '',
      proveedorFee: '',
      feePrograma: '',
      feePorcentaje: '',
      implementacion: '',
      talentos: '',
      tecnica: '',
    },
  ]);

  // Función para formatear números como pesos argentinos
  const formatPesos = (value: string) => {
    const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(num);
  };

  // Función para formatear pesos mientras se escribe
  const formatPesosInput = (value: string) => {
    // Eliminar todo excepto números
    const numericValue = value.replace(/[^0-9]/g, '');
    if (!numericValue) return '';

    // Convertir a número y formatear
    const num = parseInt(numericValue, 10);
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Función para formatear porcentajes con decimales
  const formatPorcentaje = (value: string) => {
    // Solo permitir números enteros
    const cleaned = value.replace(/[^0-9]/g, '');
    return cleaned;
  };

  // Función para obtener el valor numérico sin formato
  const getNumericValue = (formattedValue: string) => {
    return formattedValue.replace(/[^0-9]/g, '');
  };

  // Validar si categoría de negocio debe estar bloqueada
  const isCategoriaNegocioDisabled = () => {
    return !unidadNegocio || !['Media'].includes(unidadNegocio);
  };

  // Validar si proyecto debe estar bloqueado
  const isProyectoDisabled = () => {
    if (!unidadNegocio) return true;

    if (unidadNegocio === 'Media') {
      return categoriaNegocio === 'Media' || !categoriaNegocio;
    }

    if (['Experience', 'Productora'].includes(unidadNegocio)) {
      return false;
    }

    if (['E-commerce', 'Estructura'].includes(unidadNegocio)) {
      return true;
    }

    return true;
  };

  // Cargar datos del formulario existente en modo edición
  useEffect(() => {
    if (isEditMode && formularioExistente) {
      setMesServicio(formularioExistente.mesServicio || '');
      if (formularioExistente.mesServicio) {
        const [anio, mes] = formularioExistente.mesServicio.split('-');
        setMesServicioAnio(anio || '');
        setMesServicioMes(mes || '');
      }
      setOrdenPublicidad(formularioExistente.ordenPublicidad || '');
      setTotalVenta(formularioExistente.totalVenta || '');
      setUnidadNegocio(formularioExistente.unidadNegocio || '');
      setCategoriaNegocio(formularioExistente.categoriaNegocio || '');
      setProyecto(formularioExistente.proyecto || '');
      setRazonSocial(formularioExistente.razonSocial || '');
      setCategoria(formularioExistente.categoria || '');
      setEmpresaAgencia(formularioExistente.empresaAgencia || '');
      setMarca(formularioExistente.marca || '');
      setNombreCampana(formularioExistente.nombreCampana || '');
      setAcuerdoPago(formularioExistente.acuerdoPago || '');
      setTipoImporte(formularioExistente.tipoImporte || 'factura');
      setObservaciones(formularioExistente.observaciones || '');
      setImporteRows(formularioExistente.importeRows || []);
    }
  }, [formularioId, isEditMode]);

  // Resetear campos dependientes cuando cambia unidad de negocio (solo en modo creación)
  useEffect(() => {
    if (!isEditMode) {
      setCategoriaNegocio('');
      setProyecto('');
    }
  }, [unidadNegocio, isEditMode]);

  // Resetear proyecto cuando cambia categoría de negocio (solo en modo creación)
  useEffect(() => {
    if (!isEditMode) {
      setProyecto('');
    }
  }, [categoriaNegocio, isEditMode]);

  // Calcular NC Programa cuando cambia NC Porcentaje
  const handleNcPorcentajeChange = (rowId: string, porcentaje: string) => {
    setImporteRows(rows => rows.map(row => {
      if (row.id === rowId) {
        const monto = parseFloat(row.monto.replace(/[^0-9.-]/g, '')) || 0;
        const pct = parseFloat(porcentaje) || 0;
        const ncPrograma = (monto * pct / 100).toString();
        return { ...row, ncPorcentaje: porcentaje, ncPrograma };
      }
      return row;
    }));
  };

  // Calcular NC Porcentaje cuando cambia NC Programa
  const handleNcProgramaChange = (rowId: string, ncPrograma: string) => {
    setImporteRows(rows => rows.map(row => {
      if (row.id === rowId) {
        const monto = parseFloat(row.monto.replace(/[^0-9.-]/g, '')) || 0;
        const nc = parseFloat(ncPrograma.replace(/[^0-9.-]/g, '')) || 0;
        const ncPorcentaje = monto > 0 ? ((nc / monto) * 100).toFixed(2) : '0';
        return { ...row, ncPrograma, ncPorcentaje };
      }
      return row;
    }));
  };

  // Calcular FEE Programa cuando cambia FEE Porcentaje
  const handleFeePorcentajeChange = (rowId: string, porcentaje: string) => {
    setImporteRows(rows => rows.map(row => {
      if (row.id === rowId) {
        const monto = parseFloat(row.monto.replace(/[^0-9.-]/g, '')) || 0;
        const pct = parseFloat(porcentaje) || 0;
        const feePrograma = (monto * pct / 100).toString();
        return { ...row, feePorcentaje: porcentaje, feePrograma };
      }
      return row;
    }));
  };

  // Calcular FEE Porcentaje cuando cambia FEE Programa
  const handleFeeProgramaChange = (rowId: string, feePrograma: string) => {
    setImporteRows(rows => rows.map(row => {
      if (row.id === rowId) {
        const monto = parseFloat(row.monto.replace(/[^0-9.-]/g, '')) || 0;
        const fee = parseFloat(feePrograma.replace(/[^0-9.-]/g, '')) || 0;
        const feePorcentaje = monto > 0 ? ((fee / monto) * 100).toFixed(2) : '0';
        return { ...row, feePrograma, feePorcentaje };
      }
      return row;
    }));
  };

  // Calcular el total de programas
  const calcularTotalProgramas = () => {
    return importeRows.reduce((sum, row) => {
      const monto = parseFloat(row.monto.replace(/[^0-9.-]/g, '')) || 0;
      return sum + monto;
    }, 0);
  };

  // Validar si el total de programas supera el presupuesto
  const totalProgramas = calcularTotalProgramas();
  const presupuestoEstimado = parseFloat(totalVenta.replace(/[^0-9.-]/g, '')) || 0;
  const excedeLimite = presupuestoEstimado > 0 && totalProgramas > presupuestoEstimado;

  // Validar que el monto no supere el total de venta
  const validateMonto = (monto: string) => {
    const montoNum = parseFloat(monto.replace(/[^0-9.-]/g, '')) || 0;
    const totalVentaNum = parseFloat(totalVenta.replace(/[^0-9.-]/g, '')) || 0;
    return montoNum <= totalVentaNum;
  };

  // Agregar nueva fila
  const addImporteRow = () => {
    setImporteRows([
      ...importeRows,
      {
        id: Date.now().toString(),
        programa: '',
        monto: '',
        ncPrograma: '',
        ncPorcentaje: '',
        proveedorFee: '',
        feePrograma: '',
        feePorcentaje: '',
        implementacion: '',
        talentos: '',
        tecnica: '',
      },
    ]);
  };

  // Eliminar fila con confirmación
  const removeImporteRow = (id: string) => {
    if (importeRows.length === 1) {
      alert('Debe haber al menos un programa');
      return;
    }

    if (confirm('¿Está seguro de eliminar este programa?')) {
      setImporteRows(importeRows.filter(row => row.id !== id));
    }
  };

  // Cálculos del resumen
  const calcularResumen = () => {
    const totalVentaNum = parseFloat(totalVenta.replace(/[^0-9.-]/g, '')) || 0;

    const totalNotaCredito = importeRows.reduce((sum, row) => {
      const nc = parseFloat(row.ncPrograma.replace(/[^0-9.-]/g, '')) || 0;
      return sum + nc;
    }, 0);

    const totalFeeFacturado = importeRows.reduce((sum, row) => {
      const fee = parseFloat(row.feePrograma.replace(/[^0-9.-]/g, '')) || 0;
      return sum + fee;
    }, 0);

    const totalGastoVenta = importeRows.reduce((sum, row) => {
      const impl = parseFloat(row.implementacion.replace(/[^0-9.-]/g, '')) || 0;
      const tal = parseFloat(row.talentos.replace(/[^0-9.-]/g, '')) || 0;
      const tec = parseFloat(row.tecnica.replace(/[^0-9.-]/g, '')) || 0;
      return sum + impl + tal + tec;
    }, 0);

    const utilidadProyecto = totalVentaNum - totalNotaCredito - totalFeeFacturado - totalGastoVenta;

    return {
      totalVenta: totalVentaNum,
      totalNotaCredito,
      totalFeeFacturado,
      totalGastoVenta,
      utilidadProyecto,
      pctNotaCredito: totalVentaNum > 0 ? (totalNotaCredito / totalVentaNum * 100).toFixed(1) : '0',
      pctFeeFacturado: totalVentaNum > 0 ? (totalFeeFacturado / totalVentaNum * 100).toFixed(1) : '0',
      pctGastoVenta: totalVentaNum > 0 ? (totalGastoVenta / totalVentaNum * 100).toFixed(1) : '0',
      pctUtilidad: totalVentaNum > 0 ? (utilidadProyecto / totalVentaNum * 100).toFixed(1) : '0',
    };
  };

  const resumen = calcularResumen();

  // Obtener fecha actual
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // getMonth() devuelve 0-11

  // Generar años desde el año actual hasta 2030 (solo años futuros o actual)
  const ANIOS_DISPONIBLES = isEditMode
    ? Array.from({ length: 11 }, (_, i) => 2020 + i) // En modo edición permitir todos los años
    : Array.from({ length: 2031 - currentYear }, (_, i) => currentYear + i); // En creación solo año actual y futuros

  const MESES = [
    { value: '01', label: 'Enero' },
    { value: '02', label: 'Febrero' },
    { value: '03', label: 'Marzo' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Mayo' },
    { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' },
  ];

  // Filtrar meses disponibles: si el año seleccionado es el actual, solo mostrar meses >= mes actual
  const MESES_DISPONIBLES = isEditMode
    ? MESES // En modo edición permitir todos los meses
    : (mesServicioAnio && parseInt(mesServicioAnio) === currentYear)
      ? MESES.filter(mes => parseInt(mes.value) >= currentMonth)
      : MESES;

  // Actualizar mesServicio cuando cambian mes o año
  useEffect(() => {
    if (mesServicioMes && mesServicioAnio) {
      setMesServicio(`${mesServicioAnio}-${mesServicioMes}`);
    } else {
      setMesServicio('');
    }
  }, [mesServicioMes, mesServicioAnio]);

  // Resetear mes si cambia el año y el mes seleccionado ya no está disponible
  useEffect(() => {
    if (!isEditMode && mesServicioAnio && mesServicioMes) {
      const selectedYear = parseInt(mesServicioAnio);
      const selectedMonth = parseInt(mesServicioMes);

      // Si el año seleccionado es el actual y el mes es menor al mes actual, resetear
      if (selectedYear === currentYear && selectedMonth < currentMonth) {
        setMesServicioMes('');
      }
    }
  }, [mesServicioAnio, isEditMode, currentYear, currentMonth, mesServicioMes]);

  // Función para validar todos los campos obligatorios
  const validarCamposObligatorios = () => {
    const camposFaltantes = [];

    if (!ordenPublicidad.trim()) camposFaltantes.push('Orden de Publicidad');
    if (!totalVenta.trim()) camposFaltantes.push('Total de Venta');
    if (!mesServicioMes || !mesServicioAnio) camposFaltantes.push('Mes de Servicio');
    if (!unidadNegocio) camposFaltantes.push('Unidad de Negocio');
    // if (!categoriaNegocio) camposFaltantes.push('Categoría de Negocio');

    // Solo validar proyecto si no está deshabilitado
    if (!isProyectoDisabled() && !proyecto) camposFaltantes.push('Proyecto');

    if (!razonSocial) camposFaltantes.push('Razón Social');
    if (!categoria) camposFaltantes.push('Categoría');
    if (!empresaAgencia.trim()) camposFaltantes.push('Empresa/Agencia');
    if (!marca.trim()) camposFaltantes.push('Marca');

    return camposFaltantes;
  };

  // Verificar si el formulario es válido
  const formularioValido = validarCamposObligatorios().length === 0;



  return (
    <div className={`min-h-screen py-4 sm:py-6 ${isDark ? 'bg-transparent' : 'bg-white'}`}>
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="space-y-6 sm:space-y-8">
          {/* Título */}
          <div className="mb-6">
            <h1 className={`text-xl sm:text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {isEditMode ? `Orden de Publicidad: ${formularioExistente?.ordenPublicidad || 'N/A'}` : 'Cargar Datos'}
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
              {isEditMode ? 'Edite la información del formulario comercial' : 'Complete la información del nuevo formulario comercial'}
            </p>
          </div>

          {/* Sección: Datos Básicos */}
          <div className="space-y-6">
            {/* Primera fila: Orden de Publicidad, Total de Venta, Mes de Servicio */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Orden de Publicidad */}
              <div className="space-y-2">
                <Label className={`${isDark ? 'text-gray-400' : 'text-gray-700'} flex items-center gap-1`}>
                  Orden de Publicidad
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={ordenPublicidad}
                  onChange={(e) => setOrdenPublicidad(e.target.value)}
                  placeholder="Ej: 202509-0133 VER001"
                  disabled={isEditMode}
                  className={isDark
                    ? 'bg-[#141414] border-gray-800 text-white placeholder:text-gray-600 focus:border-[#fb2c36] disabled:opacity-60 disabled:cursor-not-allowed'
                    : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#fb2c36] disabled:opacity-60 disabled:cursor-not-allowed'
                  }
                />
              </div>

              {/* Total de Venta */}
              <div className="space-y-2">
                <Label className={`${isDark ? 'text-gray-400' : 'text-gray-700'} flex items-center gap-1`}>
                  Total de Venta
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  value={totalVenta ? formatPesosInput(totalVenta) : ''}
                  onChange={(e) => {
                    const value = getNumericValue(e.target.value);
                    setTotalVenta(value);
                  }}
                  placeholder="$ 0"
                  className={isDark
                    ? 'bg-[#141414] border-gray-800 text-white placeholder:text-gray-600 focus:border-[#fb2c36]'
                    : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#fb2c36]'
                  }
                />
              </div>

              {/* Mes de Servicio */}
              <div className="space-y-2">
                <Label className={`${isDark ? 'text-gray-400' : 'text-gray-700'} flex items-center gap-1`}>
                  Mes de Servicio
                  <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <select
                      value={mesServicioAnio}
                      onChange={(e) => setMesServicioAnio(e.target.value)}
                      className={`w-full h-10 pl-3 pr-10 rounded-md border text-sm appearance-none ${isDark
                        ? 'bg-[#141414] border-gray-800 text-white focus:border-[#fb2c36]'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-[#fb2c36]'
                        } focus:outline-none focus:ring-2 focus:ring-[#fb2c36]/20`}
                    >
                      <option value="">Año</option>
                      {ANIOS_DISPONIBLES.map((anio) => (
                        <option key={anio} value={anio.toString()}>{anio}</option>
                      ))}
                    </select>
                    <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                  <div className="relative flex-1">
                    <select
                      value={mesServicioMes}
                      onChange={(e) => setMesServicioMes(e.target.value)}
                      className={`w-full h-10 pl-3 pr-10 rounded-md border text-sm appearance-none ${isDark
                        ? 'bg-[#141414] border-gray-800 text-white focus:border-[#fb2c36]'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-[#fb2c36]'
                        } focus:outline-none focus:ring-2 focus:ring-[#fb2c36]/20`}
                    >
                      <option value="">Mes</option>
                      {MESES_DISPONIBLES.map((mes) => (
                        <option key={mes.value} value={mes.value}>{mes.label}</option>
                      ))}
                    </select>
                    <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                </div>
              </div>
            </div>

            {/* Campos no editables solo en modo edición */}
            {isEditMode && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800">
                {/* Responsable */}
                <div className="space-y-2">
                  <Label className={`${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                    Responsable
                  </Label>
                  <Input
                    value={formularioExistente?.responsable || ''}
                    disabled
                    className={isDark
                      ? 'bg-[#0a0a0a] border-gray-800 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 border-gray-300 text-gray-600 cursor-not-allowed'
                    }
                  />
                </div>

                {/* Fecha de Creación */}
                <div className="space-y-2">
                  <Label className={`${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                    Fecha de Creación
                  </Label>
                  <Input
                    value={formularioExistente?.fecha || ''}
                    disabled
                    className={isDark
                      ? 'bg-[#0a0a0a] border-gray-800 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 border-gray-300 text-gray-600 cursor-not-allowed'
                    }
                  />
                </div>
              </div>
            )}

            {/* Resto de campos en grid de 2 columnas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Unidad de Negocio */}
              <div className="space-y-2">
                <Label className={`${isDark ? 'text-gray-400' : 'text-gray-700'} flex items-center gap-1`}>
                  Unidad de Negocio
                  <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <select
                    value={unidadNegocio}
                    onChange={(e) => setUnidadNegocio(e.target.value)}
                    className={`w-full h-10 pl-3 pr-10 rounded-md border text-sm appearance-none ${isDark
                      ? 'bg-[#141414] border-gray-800 text-white focus:border-[#fb2c36]'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-[#fb2c36]'
                      } focus:outline-none focus:ring-2 focus:ring-[#fb2c36]/20`}
                  >
                    <option value="">Seleccionar</option>
                    {UNIDADES_NEGOCIO.map((unidad) => (
                      <option key={unidad} value={unidad}>{unidad}</option>
                    ))}
                  </select>
                  <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
              </div>

              {/* Categoría de Negocio */}
              <div className="space-y-2">
                <Label className={`${isDark ? 'text-gray-400' : 'text-gray-700'} flex items-center gap-1`}>
                  Categoría de Negocio
                </Label>
                <div className="relative">
                  <select
                    value={categoriaNegocio}
                    onChange={(e) => setCategoriaNegocio(e.target.value)}
                    disabled={isCategoriaNegocioDisabled()}
                    className={`w-full h-10 pl-3 pr-10 rounded-md border text-sm appearance-none ${isDark
                      ? 'bg-[#141414] border-gray-800 text-white focus:border-[#fb2c36]'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-[#fb2c36]'
                      } focus:outline-none focus:ring-2 focus:ring-[#fb2c36]/20 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <option value="">Seleccionar</option>
                    {unidadNegocio && CATEGORIAS_NEGOCIO_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
              </div>

              {/* Proyecto */}
              <div className="space-y-2">
                <Label className={`${isDark ? 'text-gray-400' : 'text-gray-700'} flex items-center gap-1`}>
                  Proyecto
                  {!isProyectoDisabled() && <span className="text-red-500">*</span>}
                </Label>
                <div className="relative">
                  <select
                    value={proyecto}
                    onChange={(e) => setProyecto(e.target.value)}
                    disabled={isProyectoDisabled()}
                    className={`w-full h-10 pl-3 pr-10 rounded-md border text-sm appearance-none ${isDark
                      ? 'bg-[#141414] border-gray-800 text-white focus:border-[#fb2c36]'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-[#fb2c36]'
                      } focus:outline-none focus:ring-2 focus:ring-[#fb2c36]/20 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <option value="">Seleccionar</option>
                    <option value="proyecto1">Proyecto 1</option>
                    <option value="proyecto2">Proyecto 2</option>
                    <option value="proyecto3">Proyecto 3</option>
                  </select>
                  <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
              </div>

              {/* Razón Social */}
              <div className="space-y-2">
                <Label className={`${isDark ? 'text-gray-400' : 'text-gray-700'} flex items-center gap-1`}>
                  Razón Social
                  <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <Input
                      value={razonSocial}
                      onChange={(e) => setRazonSocial(e.target.value)}
                      placeholder="Buscar razón social"
                      list="razones-sociales"
                      className={`pl-10 ${isDark
                        ? 'bg-[#141414] border-gray-800 text-white placeholder:text-gray-600 focus:border-[#fb2c36]'
                        : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#fb2c36]'
                        }`}
                    />
                    <datalist id="razones-sociales">
                      <option value="OMG Argentina S.A." />
                      <option value="Unilever Argentina S.A." />
                      <option value="Coca-Cola FEMSA S.A." />
                    </datalist>
                  </div>
                  <Button
                    onClick={() => setShowAddRazonSocial(true)}
                    size="icon"
                    className="bg-[#0070ff] hover:bg-[#0060dd] text-white shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Categoría */}
              <div className="space-y-2">
                <Label className={`${isDark ? 'text-gray-400' : 'text-gray-700'} flex items-center gap-1`}>
                  Categoría
                  <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className={`w-full h-10 pl-3 pr-10 rounded-md border text-sm appearance-none ${isDark
                      ? 'bg-[#141414] border-gray-800 text-white focus:border-[#fb2c36]'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-[#fb2c36]'
                      } focus:outline-none focus:ring-2 focus:ring-[#fb2c36]/20`}
                  >
                    <option value="">Seleccionar</option>
                    {CATEGORIAS_MARCA.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
              </div>

              {/* Empresa/Agencia */}
              <div className="space-y-2">
                <Label className={`${isDark ? 'text-gray-400' : 'text-gray-700'} flex items-center gap-1`}>
                  Empresa/Agencia
                  <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <Input
                    value={empresaAgencia}
                    onChange={(e) => setEmpresaAgencia(e.target.value)}
                    placeholder="Buscar empresa"
                    list="empresas"
                    className={`pl-10 ${isDark
                      ? 'bg-[#141414] border-gray-800 text-white placeholder:text-gray-600 focus:border-[#fb2c36]'
                      : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#fb2c36]'
                      }`}
                  />
                  <datalist id="empresas">
                    <option value="OMG" />
                    <option value="Unilever" />
                    <option value="Coca-Cola" />
                  </datalist>
                </div>
              </div>

              {/* Marca */}
              <div className="space-y-2">
                <Label className={`${isDark ? 'text-gray-400' : 'text-gray-700'} flex items-center gap-1`}>
                  Marca
                  <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <Input
                    value={marca}
                    onChange={(e) => setMarca(e.target.value)}
                    placeholder="Buscar marca"
                    list="marcas"
                    className={`pl-10 ${isDark
                      ? 'bg-[#141414] border-gray-800 text-white placeholder:text-gray-600 focus:border-[#fb2c36]'
                      : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#fb2c36]'
                      }`}
                  />
                  <datalist id="marcas">
                    <option value="Lysoform" />
                    <option value="Dove" />
                    <option value="Coca-Cola" />
                  </datalist>
                </div>
              </div>

              {/* Nombre de Campaña */}
              <div className="space-y-2">
                <Label className={isDark ? 'text-gray-400' : 'text-gray-700'}>
                  Nombre de Campaña
                </Label>
                <Input
                  value={nombreCampana}
                  onChange={(e) => {
                    if (e.target.value.length <= MAX_CHARS_CAMPANA) {
                      setNombreCampana(e.target.value);
                    }
                  }}
                  placeholder="Ej: Campaña Verano 2024"
                  className={isDark
                    ? 'bg-[#141414] border-gray-800 text-white placeholder:text-gray-600 focus:border-[#fb2c36]'
                    : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#fb2c36]'
                  }
                />
                <p className={`text-xs text-right ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                  {nombreCampana.length}/{MAX_CHARS_CAMPANA}
                </p>
              </div>
            </div>
          </div>

          {/* Sección: Carga de Importes */}
          <div className="space-y-4">
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Carga de Importes
            </h2>

            {/* Alerta de exceso de límite */}


            <div className="space-y-6">
              {/* Acuerdo de Pago */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className={isDark ? 'text-gray-400' : 'text-gray-700'}>
                    Acuerdo de Pago
                  </Label>
                  <div className="relative">
                    <select
                      value={acuerdoPago}
                      onChange={(e) => setAcuerdoPago(e.target.value)}
                      className={`w-full h-10 pl-3 pr-10 rounded-md border text-sm appearance-none ${isDark
                        ? 'bg-[#141414] border-gray-800 text-white focus:border-[#fb2c36]'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-[#fb2c36]'
                        } focus:outline-none focus:ring-2 focus:ring-[#fb2c36]/20`}
                    >
                      <option value="">Seleccionar</option>
                      {ACUERDOS_PAGO.map((acuerdo) => (
                        <option key={acuerdo} value={acuerdo}>{acuerdo}</option>
                      ))}
                    </select>
                    <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                </div>
              </div>



              {/* Programas */}
              <div className="space-y-4">
                {importeRows.map((row, index) => (
                  <div key={row.id} className={`border rounded-lg p-4 sm:p-6 ${isDark ? 'bg-[#141414] border-gray-800' : 'bg-[#E6EBFF] border-[#ABBCFF]'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <h4 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Programa {index + 1}
                        </h4>
                        {(() => {
                          const monto = parseFloat(row.monto) || 0;
                          const impl = parseFloat(row.implementacion) || 0;
                          const tal = parseFloat(row.talentos) || 0;
                          const tec = parseFloat(row.tecnica) || 0;
                          const suma = impl + tal + tec;

                          const isDuplicate = row.programa && importeRows.some(r => r.id !== row.id && r.programa === row.programa);

                          return (
                            <div className="flex flex-col gap-1">
                              {/* Cap Alert */}
                              {monto > 0 && suma > monto && (
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                                  <AlertCircle className="h-3 w-3 text-red-600 dark:text-red-400" />
                                  <span className="text-xs font-medium text-red-600 dark:text-red-400">
                                    El desglose supera el monto asignado ({formatPesos((suma - monto).toString())})
                                  </span>
                                </div>
                              )}

                              {/* Duplicate Alert */}
                              {isDuplicate && (
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800">
                                  <AlertCircle className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                                  <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                                    Este programa ya fue agregado
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                      {importeRows.length > 1 && (
                        <Button
                          onClick={() => removeImporteRow(row.id)}
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-4">
                      {/* Primera fila */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                          <Label className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Programa</Label>
                          <div className="relative">
                            <select
                              value={row.programa}
                              onChange={(e) => setImporteRows(rows => rows.map(r => r.id === row.id ? { ...r, programa: e.target.value } : r))}
                              className={`w-full h-9 pl-2 pr-8 rounded-md border text-sm appearance-none ${isDark
                                ? 'bg-[#1e1e1e] border-gray-700 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                                } focus:outline-none focus:ring-2 focus:ring-[#fb2c36]/20`}
                            >
                              <option value="">Seleccionar</option>
                              {PROGRAMAS_LUZU.map((programa) => (
                                <option key={programa} value={programa}>{programa}</option>
                              ))}
                            </select>
                            <ChevronDown className={`absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Monto</Label>
                          <Input
                            type="text"
                            value={row.monto ? formatPesosInput(row.monto) : ''}
                            onChange={(e) => {
                              const value = getNumericValue(e.target.value);
                              if (validateMonto(value)) {
                                setImporteRows(rows => rows.map(r => r.id === row.id ? { ...r, monto: value } : r));
                              } else {
                                alert('El monto no puede superar el Total de Venta');
                              }
                            }}
                            placeholder="$ 0"
                            className={`h-9 text-sm ${isDark
                              ? 'bg-[#1e1e1e] border-gray-700 text-white placeholder:text-gray-600'
                              : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                              }`}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>NC Programa</Label>
                          <Input
                            type="text"
                            value={row.ncPrograma ? formatPesosInput(row.ncPrograma) : ''}
                            onChange={(e) => {
                              const value = getNumericValue(e.target.value);
                              handleNcProgramaChange(row.id, value);
                            }}
                            placeholder="$ 0"
                            className={`h-9 text-sm ${isDark
                              ? 'bg-[#1e1e1e] border-gray-700 text-white placeholder:text-gray-600'
                              : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                              }`}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>%</Label>
                          <Input
                            type="text"
                            value={row.ncPorcentaje}
                            onChange={(e) => {
                              const value = formatPorcentaje(e.target.value);
                              handleNcPorcentajeChange(row.id, value);
                            }}
                            placeholder="0"
                            className={`h-9 text-sm ${isDark
                              ? 'bg-[#1e1e1e] border-gray-700 text-white placeholder:text-gray-600'
                              : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                              }`}
                          />
                        </div>
                      </div>

                      {/* Segunda fila */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                          <Label className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Proveedor FEE</Label>
                          <div className="relative">
                            <Search className={`absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                            <Input
                              value={row.proveedorFee}
                              onChange={(e) => setImporteRows(rows => rows.map(r => r.id === row.id ? { ...r, proveedorFee: e.target.value } : r))}
                              placeholder="Buscar proveedor"
                              list={`proveedores-${row.id}`}
                              className={`pl-8 h-9 text-sm ${isDark
                                ? 'bg-[#1e1e1e] border-gray-700 text-white placeholder:text-gray-600'
                                : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                                }`}
                            />
                            <datalist id={`proveedores-${row.id}`}>
                              <option value="Proveedor 1" />
                              <option value="Proveedor 2" />
                              <option value="Proveedor 3" />
                            </datalist>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>FEE Programa</Label>
                          <Input
                            type="text"
                            value={row.feePrograma ? formatPesosInput(row.feePrograma) : ''}
                            onChange={(e) => {
                              const value = getNumericValue(e.target.value);
                              handleFeeProgramaChange(row.id, value);
                            }}
                            placeholder="$ 0"
                            className={`h-9 text-sm ${isDark
                              ? 'bg-[#1e1e1e] border-gray-700 text-white placeholder:text-gray-600'
                              : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                              }`}
                          />
                        </div>

                        <div className="space-y-1.5 sm:col-span-2">
                          <Label className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>%</Label>
                          <Input
                            type="text"
                            value={row.feePorcentaje}
                            onChange={(e) => {
                              const value = formatPorcentaje(e.target.value);
                              handleFeePorcentajeChange(row.id, value);
                            }}
                            placeholder="0"
                            className={`h-9 text-sm ${isDark
                              ? 'bg-[#1e1e1e] border-gray-700 text-white placeholder:text-gray-600'
                              : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                              }`}
                          />
                        </div>
                      </div>

                      {/* Tercera fila */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <Label className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Implementación</Label>
                          <Input
                            type="text"
                            value={row.implementacion ? formatPesosInput(row.implementacion) : ''}
                            onChange={(e) => {
                              const value = getNumericValue(e.target.value);
                              const totalVentaNum = parseFloat(totalVenta) || 0;
                              const montoPrograma = parseFloat(row.monto) || 0;

                              if (parseFloat(value) > totalVentaNum) {
                                alert('El monto de Implementación no puede superar el Total de Venta');
                                return;
                              }
                              if (montoPrograma > 0 && parseFloat(value) > montoPrograma) {
                                alert('El monto de Implementación no puede superar el monto asignado al programa');
                                return;
                              }

                              setImporteRows(rows => rows.map(r => r.id === row.id ? { ...r, implementacion: value } : r));
                            }}
                            placeholder="$ 0"
                            className={`h-9 text-sm ${isDark
                              ? 'bg-[#1e1e1e] border-gray-700 text-white placeholder:text-gray-600'
                              : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                              }`}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Talentos</Label>
                          <Input
                            type="text"
                            value={row.talentos ? formatPesosInput(row.talentos) : ''}
                            onChange={(e) => {
                              const value = getNumericValue(e.target.value);
                              const totalVentaNum = parseFloat(totalVenta) || 0;
                              const montoPrograma = parseFloat(row.monto) || 0;

                              if (parseFloat(value) > totalVentaNum) {
                                alert('El monto de Talentos no puede superar el Total de Venta');
                                return;
                              }
                              if (montoPrograma > 0 && parseFloat(value) > montoPrograma) {
                                alert('El monto de Talentos no puede superar el monto asignado al programa');
                                return;
                              }

                              setImporteRows(rows => rows.map(r => r.id === row.id ? { ...r, talentos: value } : r));
                            }}
                            placeholder="$ 0"
                            className={`h-9 text-sm ${isDark
                              ? 'bg-[#1e1e1e] border-gray-700 text-white placeholder:text-gray-600'
                              : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                              }`}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Técnica</Label>
                          <Input
                            type="text"
                            value={row.tecnica ? formatPesosInput(row.tecnica) : ''}
                            onChange={(e) => {
                              const value = getNumericValue(e.target.value);
                              const totalVentaNum = parseFloat(totalVenta) || 0;
                              const montoPrograma = parseFloat(row.monto) || 0;

                              if (parseFloat(value) > totalVentaNum) {
                                alert('El monto de Técnica no puede superar el Total de Venta');
                                return;
                              }
                              if (montoPrograma > 0 && parseFloat(value) > montoPrograma) {
                                alert('El monto de Técnica no puede superar el monto asignado al programa');
                                return;
                              }

                              setImporteRows(rows => rows.map(r => r.id === row.id ? { ...r, tecnica: value } : r));
                            }}
                            placeholder="$ 0"
                            className={`h-9 text-sm ${isDark
                              ? 'bg-[#1e1e1e] border-gray-700 text-white placeholder:text-gray-600'
                              : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                              }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Botón Agregar Programa */}
                <div className="flex justify-end">
                  <Button
                    onClick={addImporteRow}
                    className="bg-[#0070ff] hover:bg-[#0060dd] text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Programa
                  </Button>
                </div>

                {/* Alerta de exceso de límite (Bottom) */}
                {excedeLimite && (
                  <div className={`p-4 rounded-lg border-2 flex items-start gap-3 ${isDark
                    ? 'bg-red-950/50 border-red-800 text-red-200'
                    : 'bg-red-50 border-red-300 text-red-800'
                    }`}>
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-500" />
                    <div className="flex-1">
                      <p className="font-semibold mb-1">
                        El total de programas supera el presupuesto estimado
                      </p>
                      <p className="text-sm opacity-90">
                        Total de programas: <span className="font-bold">{formatPesos(totalProgramas.toString())}</span>
                        {' | '}
                        Presupuesto: <span className="font-bold">{formatPesos(presupuestoEstimado.toString())}</span>
                        {' | '}
                        Excedente: <span className="font-bold">{formatPesos((totalProgramas - presupuestoEstimado).toString())}</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Tipo de Importe */}
              <div className="space-y-3">
                <Label className={isDark ? 'text-gray-400' : 'text-gray-700'}>Tipo de Importe</Label>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => setTipoImporte('canje')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${tipoImporte === 'canje'
                      ? 'bg-green-600 border-green-600 text-white'
                      : isDark
                        ? 'bg-[#141414] border-gray-700 text-gray-400 hover:border-gray-600'
                        : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
                      }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${tipoImporte === 'canje'
                      ? 'border-white'
                      : isDark ? 'border-gray-600' : 'border-gray-400'
                      }`}>
                      {tipoImporte === 'canje' && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <span className="text-sm font-medium">Canje</span>
                  </button>

                  <button
                    onClick={() => setTipoImporte('factura')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${tipoImporte === 'factura'
                      ? 'bg-green-600 border-green-600 text-white'
                      : isDark
                        ? 'bg-[#141414] border-gray-700 text-gray-400 hover:border-gray-600'
                        : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
                      }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${tipoImporte === 'factura'
                      ? 'border-white'
                      : isDark ? 'border-gray-600' : 'border-gray-400'
                      }`}>
                      {tipoImporte === 'factura' && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <span className="text-sm font-medium">Factura</span>
                  </button>
                </div>
              </div>

              {/* Observaciones */}
              <div className="space-y-2">
                <Label className={isDark ? 'text-gray-400' : 'text-gray-700'}>Observaciones</Label>
                <textarea
                  rows={4}
                  value={observaciones}
                  onChange={(e) => {
                    if (e.target.value.length <= MAX_CHARS_OBSERVACIONES) {
                      setObservaciones(e.target.value);
                    }
                  }}
                  placeholder="Agregar observaciones adicionales..."
                  className={`w-full px-3 py-2 rounded-md border text-sm resize-none ${isDark
                    ? 'bg-[#141414] border-gray-800 text-white placeholder:text-gray-600 focus:border-[#fb2c36]'
                    : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#fb2c36]'
                    } focus:outline-none focus:ring-2 focus:ring-[#fb2c36]/20`}
                />
                <p className={`text-xs text-right ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                  {observaciones.length}/{MAX_CHARS_OBSERVACIONES}
                </p>
              </div>
            </div>
          </div>

          {/* Resumen */}
          <Card className={isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'}>
            <CardHeader>
              <CardTitle className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Resumen</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className={`p-4 rounded-lg border text-center ${isDark ? 'bg-[#141414] border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                  <p className={`text-xs mb-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Total de venta</p>
                  <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatPesos(resumen.totalVenta.toString())}
                  </p>
                  <p className="text-xs mt-1 text-green-500">100%</p>
                </div>

                <div className={`p-4 rounded-lg border text-center ${isDark ? 'bg-[#141414] border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                  <p className={`text-xs mb-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Total Nota de Crédito</p>
                  <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatPesos(resumen.totalNotaCredito.toString())}
                  </p>
                  <p className="text-xs mt-1 text-yellow-500">{resumen.pctNotaCredito}%</p>
                </div>

                <div className={`p-4 rounded-lg border text-center ${isDark ? 'bg-[#141414] border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                  <p className={`text-xs mb-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Total FEE Facturado</p>
                  <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatPesos(resumen.totalFeeFacturado.toString())}
                  </p>
                  <p className="text-xs mt-1 text-blue-500">{resumen.pctFeeFacturado}%</p>
                </div>

                <div className={`p-4 rounded-lg border text-center ${isDark ? 'bg-[#141414] border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                  <p className={`text-xs mb-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Total gasto de venta</p>
                  <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatPesos(resumen.totalGastoVenta.toString())}
                  </p>
                  <p className="text-xs mt-1 text-orange-500">{resumen.pctGastoVenta}%</p>
                </div>

                <div className={`p-4 rounded-lg border text-center ${isDark ? 'bg-[#141414] border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                  <p className={`text-xs mb-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Utilidad de Proyecto</p>
                  <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatPesos(resumen.utilidadProyecto.toString())}
                  </p>
                  <p className={`text-xs mt-1 ${parseFloat(resumen.pctUtilidad) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {resumen.pctUtilidad}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pb-6">
            <Button
              variant="outline"
              className={isDark
                ? 'border-gray-700 text-gray-400 hover:bg-[#1e1e1e] hover:text-white'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }
            >
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                // Prevent double submission
                if (isSubmitting) return;

                // Validar campos obligatorios
                const camposFaltantes = validarCamposObligatorios();

                if (camposFaltantes.length > 0) {
                  toast.error('❌ Campos obligatorios incompletos', {
                    description: `Por favor completa: ${camposFaltantes.join(', ')}`
                  });
                  return;
                }

                // Validar montos vs Total Venta
                const totalProgramasCalc = importeRows.reduce((sum, row) => {
                  return sum + (parseFloat(row.monto) || 0);
                }, 0);
                const totalVentaNum = parseFloat(totalVenta) || 0;

                if (totalProgramasCalc !== totalVentaNum) {
                  toast.error('❌ Error en montos', {
                    description: 'Faltan asignaciones para completar el total de venta o que los importes en cada programa no coincide.'
                  });
                  return;
                }

                // Validar topes por programa y duplicados
                const programasUsados = new Set();
                for (const row of importeRows) {
                  const monto = parseFloat(row.monto) || 0;
                  const impl = parseFloat(row.implementacion) || 0;
                  const tal = parseFloat(row.talentos) || 0;
                  const tec = parseFloat(row.tecnica) || 0;

                  // Validación de tope
                  if ((impl + tal + tec) > monto) {
                    toast.error('❌ Error en desglose', {
                      description: `En el programa ${row.programa || 'sin nombre'}, la suma de Implementación, Talentos y Técnica supera el monto asignado.`
                    });
                    return;
                  }

                  // Validación de duplicados
                  if (row.programa) {
                    if (programasUsados.has(row.programa)) {
                      toast.error('❌ Programa duplicado', {
                        description: `El programa "${row.programa}" se repite. No se pueden agregar dos veces el mismo programa en una Orden.`
                      });
                      return;
                    }
                    programasUsados.add(row.programa);
                  }
                }

                const formularioData = {
                  mesServicio,
                  ordenPublicidad,
                  totalVenta,
                  unidadNegocio,
                  categoriaNegocio,
                  proyecto,
                  razonSocial,
                  categoria,
                  empresaAgencia,
                  marca,
                  nombreCampana,
                  acuerdoPago,
                  tipoImporte,
                  observaciones,
                  importeRows,
                  responsable: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : '',
                };

                setIsSubmitting(true);

                try {
                  let result;
                  if (isEditMode && formularioId) {
                    result = await updateFormulario(formularioId, {
                      ...formularioExistente,
                      ...formularioData,
                      id: formularioId,
                      fecha: formularioExistente?.fecha || new Date().toISOString(),
                    });
                  } else {
                    result = await addFormulario(formularioData);
                  }

                  if (result.success) {
                    toast.success(isEditMode ? '✅ Formulario actualizado correctamente' : '✅ Formulario guardado correctamente');
                    if (onFormularioGuardado) {
                      onFormularioGuardado();
                    }
                  } else {
                    toast.error('❌ Error al guardar', {
                      description: (result as any).error || 'Hubo un problema al guardar el formulario'
                    });
                  }
                } finally {
                  setIsSubmitting(false);
                }
              }}
              disabled={!formularioValido || isSubmitting}
              className={`${!formularioValido || isSubmitting
                ? 'bg-gray-400 cursor-not-allowed opacity-50'
                : 'bg-[#0070ff] hover:bg-[#0060dd]'
                } text-white`}
            >
              {isSubmitting 
                ? (isEditMode ? 'Actualizando...' : 'Guardando...') 
                : (isEditMode ? 'Actualizar' : 'Guardar')}
            </Button>
          </div>
        </div>
      </div>

      {/* Modal Nueva Razón Social */}
      <Dialog open={showAddRazonSocial} onOpenChange={setShowAddRazonSocial}>
        <DialogContent className={`sm:max-w-md ${isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'}`}>
          <DialogHeader>
            <DialogTitle className={isDark ? 'text-white' : 'text-gray-900'}>
              Nueva Razón Social
            </DialogTitle>
            <DialogDescription className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Complete los datos de la nueva razón social
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className={isDark ? 'text-gray-400' : 'text-gray-700'}>
                Razón Social
              </Label>
              <Input
                value={newRazonSocial}
                onChange={(e) => setNewRazonSocial(e.target.value)}
                placeholder="Ingrese la razón social"
                className={isDark
                  ? 'bg-[#141414] border-gray-700 text-white placeholder:text-gray-600'
                  : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                }
              />
            </div>
            <div className="space-y-2">
              <Label className={isDark ? 'text-gray-400' : 'text-gray-700'}>
                CUIT
              </Label>
              <Input
                value={newCuit}
                onChange={(e) => setNewCuit(e.target.value)}
                placeholder="XX-XXXXXXXX-X"
                className={isDark
                  ? 'bg-[#141414] border-gray-700 text-white placeholder:text-gray-600'
                  : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                }
              />
            </div>
            <div className="space-y-2">
              <Label className={isDark ? 'text-gray-400' : 'text-gray-700'}>
                Dirección
              </Label>
              <Input
                value={newDireccion}
                onChange={(e) => setNewDireccion(e.target.value)}
                placeholder="Ingrese la dirección"
                className={isDark
                  ? 'bg-[#141414] border-gray-700 text-white placeholder:text-gray-600'
                  : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                }
              />
            </div>
            <div className="space-y-2">
              <Label className={isDark ? 'text-gray-400' : 'text-gray-700'}>
                Empresa/Agencia
              </Label>
              <Input
                value={newEmpresaAgencia}
                onChange={(e) => setNewEmpresaAgencia(e.target.value)}
                placeholder="Ingrese la empresa o agencia"
                className={isDark
                  ? 'bg-[#141414] border-gray-700 text-white placeholder:text-gray-600'
                  : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                }
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddRazonSocial(false);
                setNewRazonSocial('');
                setNewCuit('');
                setNewDireccion('');
                setNewEmpresaAgencia('');
              }}
              className={isDark
                ? 'border-gray-700 text-gray-400 hover:bg-[#141414]'
                : 'border-gray-300 text-gray-700'
              }
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                // Aquí iría la lógica para guardar
                console.log({ newRazonSocial, newCuit, newDireccion, newEmpresaAgencia });
                setShowAddRazonSocial(false);
                setNewRazonSocial('');
                setNewCuit('');
                setNewDireccion('');
                setNewEmpresaAgencia('');
              }}
              className="bg-[#0070ff] hover:bg-[#0060dd] text-white"
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}