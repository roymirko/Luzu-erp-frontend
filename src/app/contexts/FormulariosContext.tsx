import { createContext, useContext, useState, ReactNode } from 'react';

export interface FormularioData {
  id: string;
  fecha: string;
  mesServicio: string;
  responsable: string;
  ordenPublicidad: string;
  totalVenta: string;
  unidadNegocio: string;
  categoriaNegocio: string;
  proyecto: string;
  razonSocial: string;
  categoria: string;
  empresaAgencia: string;
  marca: string;
  nombreCampana: string;
  acuerdoPago: string;
  importeRows: Array<{
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
  }>;
  tipoImporte: 'canje' | 'factura';
  observaciones: string;
}

export interface FormularioNotification {
  id: string;
  formularioId: string;
  ordenPublicidad: string;
  responsable: string;
  timestamp: Date;
  read: boolean;
}

interface FormulariosContextType {
  formularios: FormularioData[];
  notifications: FormularioNotification[];
  addFormulario: (formulario: Partial<FormularioData>) => void;
  deleteFormulario: (id: string) => void;
  updateFormulario: (id: string, formulario: FormularioData) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  removeNotification: (notificationId: string) => void;
}

const FormulariosContext = createContext<FormulariosContextType | undefined>(undefined);

export function FormulariosProvider({ children }: { children: ReactNode }) {
  const [formularios, setFormularios] = useState<FormularioData[]>([]);
  const [notifications, setNotifications] = useState<FormularioNotification[]>([]);

  const addFormulario = (formulario: Partial<FormularioData>) => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('es-AR');
    
    const newFormulario: FormularioData = {
      id: Date.now().toString(),
      fecha: formattedDate,
      mesServicio: formulario.mesServicio || '',
      responsable: formulario.responsable || '',
      ordenPublicidad: formulario.ordenPublicidad || '',
      totalVenta: formulario.totalVenta || '',
      unidadNegocio: formulario.unidadNegocio || '',
      categoriaNegocio: formulario.categoriaNegocio || '',
      proyecto: formulario.proyecto || '',
      razonSocial: formulario.razonSocial || '',
      categoria: formulario.categoria || '',
      empresaAgencia: formulario.empresaAgencia || '',
      marca: formulario.marca || '',
      nombreCampana: formulario.nombreCampana || '',
      acuerdoPago: formulario.acuerdoPago || '',
      importeRows: formulario.importeRows || [],
      tipoImporte: formulario.tipoImporte || 'factura',
      observaciones: formulario.observaciones || '',
    };
    
    setFormularios(prev => [...prev, newFormulario]);
    
    // Mostrar notificación de éxito
    const newNotification: FormularioNotification = {
      id: Date.now().toString(),
      formularioId: newFormulario.id,
      ordenPublicidad: newFormulario.ordenPublicidad,
      responsable: newFormulario.responsable,
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [...prev, newNotification]);
    alert('Formulario guardado exitosamente');
  };

  const deleteFormulario = (id: string) => {
    setFormularios(prev => prev.filter(f => f.id !== id));
    setNotifications(prev => prev.filter(n => n.formularioId !== id));
  };

  const updateFormulario = (id: string, formulario: FormularioData) => {
    setFormularios(prev => prev.map(f => f.id === id ? formulario : f));
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  return (
    <FormulariosContext.Provider value={{ formularios, notifications, addFormulario, deleteFormulario, updateFormulario, markNotificationAsRead, markAllNotificationsAsRead, removeNotification }}>
      {children}
    </FormulariosContext.Provider>
  );
}

export function useFormularios() {
  const context = useContext(FormulariosContext);
  if (context === undefined) {
    throw new Error('useFormularios must be used within a FormulariosProvider');
  }
  return context;
}