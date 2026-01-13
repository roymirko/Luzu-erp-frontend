import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { mapGastoFromDB, mapGastoToDB, mapBloqueImporteToDB } from '../utils/supabaseMappers';

export type EstadoOP = 'pendiente' | 'activo' | 'cerrado' | 'anulado';
export type EstadoPGM = 'pendiente-pago' | 'pagado' | 'anulado';

export interface BloqueImporte {
    id: string;
    programa: string;
    empresaPgm: string;
    fechaComprobante: string;
    proveedor: string;
    razonSocial: string;
    condicionPago: string;
    neto: string;
    documentoAdjunto?: string;
    estadoPgm: EstadoPGM;
}

export interface GastoImplementacion {
    id: string;
    estadoOP: EstadoOP;
    fechaRegistro: string;
    responsable: string;
    unidadNegocio: string;
    categoriaNegocio?: string;
    ordenPublicidad: string;
    presupuesto: string;
    cantidadProgramas: number;
    programasDisponibles: string[];
    sector: string;
    rubroGasto: string;
    subRubro: string;
    nombreCampana: string;
    acuerdoPago: string;
    facturaEmitidaA: string;
    empresa: string;
    conceptoGasto: string;
    observaciones: string;
    importes: BloqueImporte[];
    idFormularioComercial?: string;
    formItemId?: string;
}

interface ImplementacionContextType {
    gastos: GastoImplementacion[];
    loading: boolean;
    addGasto: (gasto: GastoImplementacion) => Promise<boolean>;
    updateGasto: (id: string, updates: Partial<GastoImplementacion>) => Promise<boolean>;
    deleteGasto: (id: string) => Promise<boolean>;
    getGastoById: (id: string) => GastoImplementacion | undefined;
    getGastoByFormItemId: (formId: string, itemId: string) => GastoImplementacion | undefined;
    refetch: () => Promise<void>;
}

const ImplementacionContext = createContext<ImplementacionContextType | undefined>(undefined);

export function ImplementacionProvider({ children }: { children: ReactNode }) {
    const [gastos, setGastos] = useState<GastoImplementacion[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchGastos = async () => {
        setLoading(true);
        try {
            const { data: expenses, error } = await supabase
                .from('gastos_implementacion')
                .select('*')
                .order('fecha_creacion', { ascending: false });

            if (error) {
                console.error('Error fetching gastos:', error);
                return;
            }

            const gastosWithItems: GastoImplementacion[] = [];
            for (const expense of expenses || []) {
                const { data: items } = await supabase
                    .from('items_gasto_implementacion')
                    .select('*')
                    .eq('gasto_id', expense.id);
                gastosWithItems.push(mapGastoFromDB(expense, items || []));
            }
            setGastos(gastosWithItems);
        } catch (err) {
            console.error('Error in fetchGastos:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGastos();
    }, []);

    const addGasto = async (gasto: GastoImplementacion): Promise<boolean> => {
        try {
            const dbGasto = mapGastoToDB(gasto);
            const { data: inserted, error } = await supabase
                .from('gastos_implementacion')
                .insert(dbGasto)
                .select()
                .single();

            if (error) {
                console.error('Error adding gasto:', error);
                return false;
            }

            if (gasto.importes.length > 0) {
                const dbItems = gasto.importes.map(imp => mapBloqueImporteToDB(imp, inserted.id));
                    const { error: itemsError } = await supabase
                        .from('items_gasto_implementacion')
                        .insert(dbItems);

                if (itemsError) {
                    console.error('Error adding expense items:', itemsError);
                }
            }

            await fetchGastos();
            return true;
        } catch (err) {
            console.error('Error in addGasto:', err);
            return false;
        }
    };

    const updateGasto = async (id: string, updates: Partial<GastoImplementacion>): Promise<boolean> => {
        try {
            const dbUpdates = mapGastoToDB(updates);
                const { error } = await supabase
                .from('gastos_implementacion')
                .update(dbUpdates)
                .eq('id', id);

            if (error) {
                console.error('Error updating gasto:', error);
                return false;
            }

            if (updates.importes) {
                await supabase
                    .from('items_gasto_implementacion')
                    .delete()
                    .eq('gasto_id', id);

                if (updates.importes.length > 0) {
                    const dbItems = updates.importes.map(imp => mapBloqueImporteToDB(imp, id));
                    await supabase
                        .from('items_gasto_implementacion')
                        .insert(dbItems);
                }
            }

            await fetchGastos();
            return true;
        } catch (err) {
            console.error('Error in updateGasto:', err);
            return false;
        }
    };

    const deleteGasto = async (id: string): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('gastos_implementacion')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting gasto:', error);
                return false;
            }

            await fetchGastos();
            return true;
        } catch (err) {
            console.error('Error in deleteGasto:', err);
            return false;
        }
    };

    const getGastoById = (id: string) => {
        return gastos.find((g) => g.id === id);
    };

    const getGastoByFormItemId = (formId: string, itemId: string) => {
        return gastos.find((g) => g.idFormularioComercial === formId && g.formItemId === itemId);
    };

    return (
        <ImplementacionContext.Provider
            value={{
                gastos,
                loading,
                addGasto,
                updateGasto,
                deleteGasto,
                getGastoById,
                getGastoByFormItemId,
                refetch: fetchGastos,
            }}
        >
            {children}
        </ImplementacionContext.Provider>
    );
}

export function useImplementacion() {
    const context = useContext(ImplementacionContext);
    if (context === undefined) {
        throw new Error('useImplementacion must be used within an ImplementacionProvider');
    }
    return context;
}
