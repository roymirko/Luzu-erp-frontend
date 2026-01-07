import React, { createContext, useContext, useState, ReactNode } from 'react';

// --- TYPES ---

export type EstadoOP = 'pendiente' | 'activo' | 'cerrado' | 'anulado';
export type EstadoPGM = 'pendiente-pago' | 'pagado' | 'anulado';

export interface BloqueImporte {
    id: string;
    programa: string;              // Nombre del programa
    empresaPgm: string;            // Empresa asociada
    fechaComprobante: string;      // YYYY-MM-DD
    proveedor: string;             // Nombre del proveedor
    razonSocial: string;           // Razón social del proveedor
    condicionPago: string;         // '5' | '30' | '45' | '60' | '90'
    neto: string;                  // Monto neto
    documentoAdjunto?: string;     // Nombre del archivo
    estadoPgm: EstadoPGM;          // Estado del pago
}

export interface GastoImplementacion {
    // Identificación y estado
    id: string;
    estadoOP: EstadoOP;

    // Datos de registro
    fechaRegistro: string;          // YYYY-MM-DD
    responsable: string;            // Usuario que carga

    // Clasificación
    unidadNegocio: string;          // 'Media' | 'Experience' | ...
    categoriaNegocio?: string;      // Solo si unidadNegocio === 'Media'

    // Datos heredados de Comercial
    ordenPublicidad: string;        // Ej: 'OP-2024-001'
    presupuesto: string;            // Monto en ARS
    cantidadProgramas: number;
    programasDisponibles: string[]; // Array de nombres de programas
    sector: string;                 // Siempre 'Implementación'
    rubroGasto: string;             // Ej: 'Gasto de venta'
    subRubro: string;               // Ej: 'Producción' | 'Honorarios'
    nombreCampana: string;          // Heredado de Comercial
    acuerdoPago: string;            // Ej: '30 días' | 'Pago anticipado'

    // Campos editables del formulario
    facturaEmitidaA: string;        // 'Luzu TV' | 'Luzu TV SA'
    empresa: string;                // 'Luzu TV' | 'Luzu TV SA'
    conceptoGasto: string;          // Max 250 caracteres
    observaciones: string;          // Max 250 caracteres

    // Bloques de importe
    importes: BloqueImporte[];
}

interface ImplementacionContextType {
    gastos: GastoImplementacion[];
    addGasto: (gasto: GastoImplementacion) => void;
    updateGasto: (id: string, updates: Partial<GastoImplementacion>) => void;
    deleteGasto: (id: string) => void;
    getGastoById: (id: string) => GastoImplementacion | undefined;
}

const ImplementacionContext = createContext<ImplementacionContextType | undefined>(undefined);

// --- MOCK DATA ---

const MOCK_GASTOS: GastoImplementacion[] = [
    // GASTO PENDIENTE 1
    {
        id: '1',
        estadoOP: 'pendiente',
        fechaRegistro: '',
        responsable: '',
        unidadNegocio: '',
        categoriaNegocio: '',
        ordenPublicidad: 'OP-2024-001',
        presupuesto: '5000000',
        cantidadProgramas: 3,
        programasDisponibles: ['Programa 1', 'Programa 2', 'Programa 3'],
        sector: 'Implementación',
        rubroGasto: 'Gasto de venta',
        subRubro: 'Producción',
        nombreCampana: 'Campaña Coca Cola',
        acuerdoPago: 'Pago anticipado',
        facturaEmitidaA: '',
        empresa: '',
        conceptoGasto: '',
        observaciones: '',
        importes: []
    },
    // GASTO PENDIENTE 2
    {
        id: '2',
        estadoOP: 'pendiente',
        fechaRegistro: '',
        responsable: '',
        unidadNegocio: '',
        ordenPublicidad: 'OP-2024-005',
        presupuesto: '4200000',
        cantidadProgramas: 2,
        programasDisponibles: ['Luzu Stream', 'Después te explico'],
        sector: 'Implementación',
        rubroGasto: 'Gasto de venta',
        subRubro: 'Honorarios',
        nombreCampana: 'Campaña Adidas',
        acuerdoPago: '30 días',
        facturaEmitidaA: '',
        empresa: '',
        conceptoGasto: '',
        observaciones: '',
        importes: []
    },
    // GASTO PENDIENTE 3
    {
        id: '3',
        estadoOP: 'pendiente',
        fechaRegistro: '',
        responsable: '',
        unidadNegocio: '',
        ordenPublicidad: 'OP-2024-007',
        presupuesto: '3800000',
        cantidadProgramas: 1,
        programasDisponibles: ['La Cruda'],
        sector: 'Implementación',
        rubroGasto: 'Gasto de venta',
        subRubro: 'Producción',
        nombreCampana: 'Campaña Quilmes',
        acuerdoPago: '45 días',
        facturaEmitidaA: '',
        empresa: '',
        conceptoGasto: '',
        observaciones: '',
        importes: []
    },
    // GASTO PENDIENTE 4
    {
        id: '4',
        estadoOP: 'pendiente',
        fechaRegistro: '',
        responsable: '',
        unidadNegocio: '',
        ordenPublicidad: 'OP-2024-009',
        presupuesto: '6500000',
        cantidadProgramas: 4,
        programasDisponibles: ['Luzu Stream', 'Nadie Dice Nada', 'Después te explico', 'La Cruda'],
        sector: 'Implementación',
        rubroGasto: 'Gasto de venta',
        subRubro: 'Producción',
        nombreCampana: 'Campaña Mercado Libre',
        acuerdoPago: 'Pago anticipado',
        facturaEmitidaA: '',
        empresa: '',
        conceptoGasto: '',
        observaciones: '',
        importes: []
    },
    // GASTO ACTIVO
    {
        id: '5',
        estadoOP: 'activo',
        fechaRegistro: '2024-01-10',
        responsable: 'Laura Fernández',
        unidadNegocio: 'Experience',
        ordenPublicidad: 'OP-2024-002',
        presupuesto: '3500000',
        cantidadProgramas: 2,
        programasDisponibles: ['Programa 4', 'Programa 5'],
        sector: 'Implementación',
        rubroGasto: 'Gasto de venta',
        subRubro: 'Producción',
        nombreCampana: 'Evento Samsung',
        acuerdoPago: '30 días',
        facturaEmitidaA: 'Luzu TV SA',
        empresa: 'Luzu TV SA',
        conceptoGasto: 'Organización de evento experiencial',
        observaciones: 'Requiere coordinación con equipo de producción',
        importes: [
            {
                id: '1',
                programa: 'Programa 4',
                empresaPgm: 'Samsung Argentina',
                fechaComprobante: '2024-01-12',
                proveedor: 'Producciones XYZ',
                razonSocial: 'Producciones XYZ SRL',
                condicionPago: '30',
                neto: '1500000',
                documentoAdjunto: 'factura_001.pdf',
                estadoPgm: 'pendiente-pago'
            }
        ]
    },
    // GASTO CERRADO
    {
        id: '6',
        estadoOP: 'cerrado',
        fechaRegistro: '2023-12-20',
        responsable: 'Carlos Ruiz',
        unidadNegocio: 'Media',
        categoriaNegocio: 'Branded Content',
        ordenPublicidad: 'OP-2023-099',
        presupuesto: '2000000',
        cantidadProgramas: 1,
        programasDisponibles: ['Programa 6'],
        sector: 'Implementación',
        rubroGasto: 'Gasto de venta',
        subRubro: 'Producción',
        nombreCampana: 'Content Pepsi',
        acuerdoPago: '45 días',
        facturaEmitidaA: 'Luzu TV',
        empresa: 'Luzu TV',
        conceptoGasto: 'Producción de branded content',
        observaciones: 'Proyecto finalizado exitosamente',
        importes: [
            {
                id: '1',
                programa: 'Programa 6',
                empresaPgm: 'Pepsi Argentina',
                fechaComprobante: '2023-12-22',
                proveedor: 'Estudio Creativo ABC',
                razonSocial: 'ABC Creativos SA',
                condicionPago: '45',
                neto: '1800000',
                estadoPgm: 'pagado'
            }
        ]
    }
];

export function ImplementacionProvider({ children }: { children: ReactNode }) {
    const [gastos, setGastos] = useState<GastoImplementacion[]>(MOCK_GASTOS);

    const addGasto = (gasto: GastoImplementacion) => {
        setGastos((prev) => [...prev, gasto]);
    };

    const updateGasto = (id: string, updates: Partial<GastoImplementacion>) => {
        setGastos((prev) =>
            prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
        );
    };

    const deleteGasto = (id: string) => {
        setGastos((prev) => prev.filter((g) => g.id !== id));
    };

    const getGastoById = (id: string) => {
        return gastos.find((g) => g.id === id);
    };

    return (
        <ImplementacionContext.Provider
            value={{
                gastos,
                addGasto,
                updateGasto,
                deleteGasto,
                getGastoById,
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
