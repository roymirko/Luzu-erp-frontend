import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { mapFormFromDB, mapFormToDB, mapFormItemToDB } from '../utils/supabaseMappers';
import { useData } from './DataContext';

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
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
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
  loading: boolean;
  addFormulario: (formulario: Partial<FormularioData>) => Promise<{ success: boolean; error?: string }>;
  deleteFormulario: (id: string) => Promise<{ success: boolean }>;
  updateFormulario: (id: string, formulario: FormularioData) => Promise<{ success: boolean }>;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  removeNotification: (notificationId: string) => void;
}

const FormulariosContext = createContext<FormulariosContextType | undefined>(undefined);

export function FormulariosProvider({ children }: { children: ReactNode }) {
  const [formularios, setFormularios] = useState<FormularioData[]>([]);
  const [notifications, setNotifications] = useState<FormularioNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useData();

  useEffect(() => {
    const fetchFormularios = async () => {
      setLoading(true);
      try {
        const { data: formsData, error } = await supabase
          .from('forms')
          .select(`
            *,
            form_items (*)
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching forms:', error);
          return;
        }

        if (formsData) {
          const mappedForms = formsData.map(f => mapFormFromDB(f, f.form_items));
          setFormularios(mappedForms);
        }
      } catch (err) {
        console.error('Error in fetchFormularios:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFormularios();
  }, []);

  const addFormulario = async (formulario: Partial<FormularioData>) => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('es-AR');

    // Create base form object for DB
    const newFormBase = {
      ...formulario,
      fecha: formattedDate,
      createdBy: currentUser?.id, // Use createdBy to match mapper expectation
    };

    // Insert Form
    const { data: insertedForm, error: formError } = await supabase
      .from('forms')
      .insert(mapFormToDB(newFormBase))
      .select()
      .single();

    if (formError || !insertedForm) {
      console.error('Error creating form:', formError);
      return { success: false, error: 'Error al guardar el formulario' };
    }

    // Insert Items
    if (formulario.importeRows && formulario.importeRows.length > 0) {
      const itemsToInsert = formulario.importeRows.map(item => mapFormItemToDB(item, insertedForm.id));

      const { error: itemsError } = await supabase
        .from('form_items')
        .insert(itemsToInsert);

      if (itemsError) {
        console.error('Error creating form items:', itemsError);
        // Should we delete the form? For now, keep it partial or warn.
      }
    }

    // Update local state by re-fetching or constructing. Use DB data to be safe.
    // Ideally we re-fetch to get IDs of items, but constructing is faster.
    // Let's re-fetch this single form to be clean.
    const { data: fullForm } = await supabase
      .from('forms')
      .select('*, form_items(*)')
      .eq('id', insertedForm.id)
      .single();

    if (fullForm) {
      const newFormulario = mapFormFromDB(fullForm, fullForm.form_items);
      setFormularios(prev => [newFormulario, ...prev]);

      // Notification
      const newNotification: FormularioNotification = {
        id: Date.now().toString(),
        formularioId: newFormulario.id,
        ordenPublicidad: newFormulario.ordenPublicidad,
        responsable: newFormulario.responsable,
        timestamp: new Date(),
        read: false,
      };
      setNotifications(prev => [...prev, newNotification]);
      return { success: true };
    }

    return { success: false };
  };

  const deleteFormulario = async (id: string) => {
    const { error } = await supabase
      .from('forms')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting form:', error);
      return { success: false };
    }

    setFormularios(prev => prev.filter(f => f.id !== id));
    setNotifications(prev => prev.filter(n => n.formularioId !== id));
    return { success: true };
  };

  const updateFormulario = async (id: string, formulario: FormularioData) => {
    // Update Form Table
    const formToUpdate = {
      ...formulario,
      updatedAt: new Date()
    };

    const { error: formError } = await supabase
      .from('forms')
      .update(mapFormToDB(formToUpdate))
      .eq('id', id);

    if (formError) {
      console.error('Error updating form:', formError);
      return { success: false };
    }

    // Update Items
    // Strategy: Delete all items and re-create. Simple and effective for small lists.
    await supabase.from('form_items').delete().eq('form_id', id);

    if (formulario.importeRows && formulario.importeRows.length > 0) {
      const itemsToInsert = formulario.importeRows.map(item => mapFormItemToDB(item, id));
      await supabase.from('form_items').insert(itemsToInsert);
    }

    // Update Local State
    // We could re-fetch, but mapping the input is fast if we trust it.
    // However, DB generated IDs for new items are missing if we don't fetch.
    // So better re-fetch.
    const { data: fullForm } = await supabase
      .from('forms')
      .select('*, form_items(*)')
      .eq('id', id)
      .single();

    if (fullForm) {
      const updatedForm = mapFormFromDB(fullForm, fullForm.form_items);
      setFormularios(prev => prev.map(f => f.id === id ? updatedForm : f));
      return { success: true };
    }

    return { success: false };
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
    <FormulariosContext.Provider value={{
      formularios,
      notifications,
      loading,
      addFormulario,
      deleteFormulario,
      updateFormulario,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      removeNotification
    }}>
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