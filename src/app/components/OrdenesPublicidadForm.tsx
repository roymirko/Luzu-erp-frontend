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
import { supabase } from '../services/supabase';
import { mapClientFromDB, mapClientToDB } from '../utils/supabaseMappers';
import { checkOrdenExists } from '../services/ordenesPublicidadService';
import type { Client } from '../types/business';
import { ProveedorSelector } from './ProveedorSelector';
import { AcuerdoPagoSelect } from './comercial/AcuerdoPagoSelect';
import { DatosBasicosSection } from './comercial/DatosBasicosSection';
import { DetallesSoloLectura } from './comercial/DetallesSoloLectura';
import { ConfiguracionSection } from './comercial/ConfiguracionSection';
import { MarcaCategoriaSection } from './comercial/MarcaCategoriaSection';
import { formatPesos, formatPesosInput, formatPorcentaje, getNumericValue } from '@/app/utils/formatters';
import { ProgramasList } from './comercial/ProgramasList';
import { PROGRAMAS_LUZU } from '@/app/utils/implementacionConstants';

interface OrdenesPublicidadFormProps {
  onFormularioGuardado?: () => void;
  onCancel?: () => void;
  formularioId?: string | null;
}

const MAX_CHARS_CAMPANA = 100;
const MAX_CHARS_OBSERVACIONES = 500;

export function OrdenesPublicidadForm({ onFormularioGuardado, onCancel, formularioId }: OrdenesPublicidadFormProps = {}) {
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
  const CATEGORIAS_MARCA = getFieldOptions('Categoría');
  const ACUERDOS_PAGO = getFieldOptions('Acuerdo de Pago');

  // Estados básicos
  const [mesServicio, setMesServicio] = useState('');
  const [mesServicioMes, setMesServicioMes] = useState('');
  const [mesServicioAnio, setMesServicioAnio] = useState('');
  const [ordenPublicidad, setOrdenPublicidad] = useState('');
  const [ordenPublicidadError, setOrdenPublicidadError] = useState(false);
  const [totalVenta, setTotalVenta] = useState('');
  const [unidadNegocio, setUnidadNegocio] = useState('');
  const [categoriaNegocio, setCategoriaNegocio] = useState('');
  const [proyecto, setProyecto] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [empresaAgencia, setEmpresaAgencia] = useState('');
  const [categoria, setCategoria] = useState('');
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
  const [isSavingClient, setIsSavingClient] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);

  const [importeRows, setImporteRows] = useState<import('./comercial/ProgramaCard').ImporteRow[]>([
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

  const handleOrdenPublicidadBlur = async () => {
    if (!ordenPublicidad.trim() || isEditMode) {
      setOrdenPublicidadError(false);
      return;
    }

    const exists = await checkOrdenExists(ordenPublicidad);
    setOrdenPublicidadError(exists);
  };

  useEffect(() => {
    const fetchClients = async () => {
      const { data, error } = await supabase
        .from('proveedores')
        .select('*')
        .eq('activo', true)
        .order('razon_social');

         if (error) {
          console.error('Error fetching clients:', error);
          return;
         }

       if (data) {
         setClients(data.map(mapClientFromDB));
       }
    };

    fetchClients();
  }, []);

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
      setEmpresaAgencia(formularioExistente.empresaAgencia || '');
      setCategoria(formularioExistente.categoria || '');
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

            <div className="space-y-6">
               <DatosBasicosSection
                 isDark={isDark}
                 isEditMode={isEditMode}
                 ordenPublicidad={ordenPublicidad}
                 setOrdenPublicidad={setOrdenPublicidad}
                 totalVenta={totalVenta}
                 setTotalVenta={setTotalVenta}
                 mesServicioMes={mesServicioMes}
                 setMesServicioMes={setMesServicioMes}
                 mesServicioAnio={mesServicioAnio}
                 setMesServicioAnio={setMesServicioAnio}
                 aniosDisponibles={ANIOS_DISPONIBLES}
                 meses={MESES}
                 mesesDisponibles={MESES_DISPONIBLES}
                 formatPesosInput={formatPesosInput}
                 getNumericValue={getNumericValue}
                 ordenPublicidadError={ordenPublicidadError}
                 onOrdenBlur={handleOrdenPublicidadBlur}
               />

              <DetallesSoloLectura
                isDark={isDark}
                isEditMode={isEditMode}
                responsable={formularioExistente?.responsable || ''}
                fecha={formularioExistente?.fecha || ''}
              />

              <ConfiguracionSection
                isDark={isDark}
                unidadNegocio={unidadNegocio}
                setUnidadNegocio={setUnidadNegocio}
                unidadesNegocioOptions={UNIDADES_NEGOCIO}
                categoriaNegocio={categoriaNegocio}
                setCategoriaNegocio={setCategoriaNegocio}
                proyecto={proyecto}
                setProyecto={setProyecto}
                isProyectoDisabled={isProyectoDisabled}
                ProveedorSelector={ProveedorSelector}
                proveedorValue={{ proveedor: empresaAgencia, razonSocial: razonSocial || '', proveedorId: null }}
                onProveedorChange={(next) => {
                  setRazonSocial(next.razonSocial);
                  setEmpresaAgencia(next.proveedor);
                }}
              />

              <MarcaCategoriaSection
                isDark={isDark}
                categoria={categoria}
                setCategoria={setCategoria}
                categoriasMarca={CATEGORIAS_MARCA}
                marca={marca}
                setMarca={setMarca}
                nombreCampana={nombreCampana}
                setNombreCampana={setNombreCampana}
                maxCharsCampana={MAX_CHARS_CAMPANA}
              />
            </div>



          <div>
          <div className="space-y-4">
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Carga de Importes
            </h2>

            <div className="space-y-6">
              {/* Acuerdo de Pago */}
                <AcuerdoPagoSelect
                  isDark={isDark}
                  acuerdosPago={ACUERDOS_PAGO}
                  value={acuerdoPago}
                  onChange={setAcuerdoPago}
                />



               {/* Programas */}
                <ProgramasList
                  isDark={isDark}
                  importeRows={importeRows}
                  setImporteRows={setImporteRows}
                  totalVenta={totalVenta}
                  programasDisponibles={PROGRAMAS_LUZU}
                  excedeLimite={excedeLimite}
                  totalProgramas={totalProgramas}
                  presupuestoEstimado={presupuestoEstimado}
                  onAdd={addImporteRow}
                  onRemove={removeImporteRow}
                />

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
          </div>

          {/* Resumen */}
          <Card className={isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'}>
            <CardHeader>
              <CardTitle className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Resumen</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className={`p-4 rounded-lg border text-center ${isDark ? 'bg-[#141414] border-gray-800' : 'bg-[#F3F5FF] border-gray-100'}`}>
                  <p className={`text-xs mb-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Total de venta</p>
                  <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatPesos(resumen.totalVenta.toString())}
                  </p>
                  <p className="text-xs mt-1 text-green-500">100%</p>
                </div>

                <div className={`p-4 rounded-lg border text-center ${isDark ? 'bg-[#141414] border-gray-800' : 'bg-[#F3F5FF] border-gray-100'}`}>
                  <p className={`text-xs mb-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Total Nota de Crédito</p>
                  <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatPesos(resumen.totalNotaCredito.toString())}
                  </p>
                  <p className="text-xs mt-1 text-yellow-500">{resumen.pctNotaCredito}%</p>
                </div>

                <div className={`p-4 rounded-lg border text-center ${isDark ? 'bg-[#141414] border-gray-800' : 'bg-[#F3F5FF] border-gray-100'}`}>
                  <p className={`text-xs mb-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Total FEE Facturado</p>
                  <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatPesos(resumen.totalFeeFacturado.toString())}
                  </p>
                  <p className="text-xs mt-1 text-blue-500">{resumen.pctFeeFacturado}%</p>
                </div>

                <div className={`p-4 rounded-lg border text-center ${isDark ? 'bg-[#141414] border-gray-800' : 'bg-[#F3F5FF] border-gray-100'}`}>
                  <p className={`text-xs mb-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Total gasto de venta</p>
                  <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatPesos(resumen.totalGastoVenta.toString())}
                  </p>
                  <p className="text-xs mt-1 text-orange-500">{resumen.pctGastoVenta}%</p>
                </div>

                <div className={`p-4 rounded-lg border text-center ${isDark ? 'bg-[#141414] border-gray-800' : 'bg-[#F3F5FF] border-gray-100'}`}>
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
              onClick={onCancel}
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
                  empresaAgencia,
                  categoria,
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
              disabled={!formularioValido || isSubmitting || ordenPublicidadError}
              className={`${!formularioValido || isSubmitting || ordenPublicidadError
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
      <div className="relative z-50">
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
              onClick={async () => {
                if (!newRazonSocial.trim() || !newCuit.trim()) {
                  toast.error('Razón Social y CUIT son obligatorios');
                  return;
                }

                setIsSavingClient(true);

                try {
                  const clientData = mapClientToDB({
                    businessName: newRazonSocial.trim(),
                    cuit: newCuit.trim(),
                    address: newDireccion.trim() || undefined,
                    companyName: newEmpresaAgencia.trim() || undefined,
                    active: true,
                  });

                    const { data, error } = await supabase
                      .from('proveedores')
                      .insert(clientData)
                      .select()
                      .single();

                  if (error) {
                    if (error.code === '23505') {
                      toast.error('Ya existe un cliente con esa Razón Social o CUIT');
                    } else {
                      toast.error('Error al guardar el cliente');
                      console.error('Error creating client:', error);
                    }
                    return;
                  }

                  if (data) {
                    const newClient = mapClientFromDB(data);
                    setClients(prev => [...prev, newClient].sort((a, b) =>
                      a.businessName.localeCompare(b.businessName)
                    ));
                    setRazonSocial(newClient.businessName);
                    if (newClient.companyName) {
                      setEmpresaAgencia(newClient.companyName);
                    }
                    toast.success('Cliente creado correctamente');
                  }

                  setShowAddRazonSocial(false);
                  setNewRazonSocial('');
                  setNewCuit('');
                  setNewDireccion('');
                  setNewEmpresaAgencia('');
                } finally {
                  setIsSavingClient(false);
                }
              }}
              disabled={isSavingClient || !newRazonSocial.trim() || !newCuit.trim()}
              className={`${isSavingClient || !newRazonSocial.trim() || !newCuit.trim()
                ? 'bg-gray-400 cursor-not-allowed opacity-50'
                : 'bg-[#0070ff] hover:bg-[#0060dd]'
                } text-white`}
            >
              {isSavingClient ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
        </Dialog>
      </div>
    </div>
  </div>
  );
}
