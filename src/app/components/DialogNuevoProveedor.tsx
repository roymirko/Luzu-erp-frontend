import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import * as proveedoresService from '../services/proveedoresService';
import type { Proveedor } from '../types/proveedores';

interface DialogNuevoProveedorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onProveedorCreado: (created?: Proveedor) => void;
}

export function DialogNuevoProveedor({ open, onOpenChange, onProveedorCreado }: DialogNuevoProveedorProps) {
    const [razonSocial, setRazonSocial] = useState('');
    const [empresa, setEmpresa] = useState('');
    const [cuit, setCuit] = useState('');

    const handleGuardar = async () => {
        const validation = proveedoresService.validateCreate({
            razonSocial,
            empresa: empresa || razonSocial,
            cuit,
        });

        if (!validation.valid) {
            validation.errors.forEach(err => toast.error(err.message));
            return;
        }

        const { data: created, error } = await proveedoresService.create({
            razonSocial,
            empresa: empresa || razonSocial,
            cuit,
        });

        if (error) {
            if (error.includes('CUIT')) {
                toast.error('El CUIT ya existe. Verifique los datos.');
            } else {
                toast.error(error);
            }
            return;
        }

        onProveedorCreado(created || undefined);
        toast.success('Proveedor creado correctamente');

        setRazonSocial('');
        setEmpresa('');
        setCuit('');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Nuevo Proveedor</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <p className="text-sm text-muted-foreground">
                        Ingrese los datos del proveedor.
                    </p>
                    <div className="grid gap-2">
                        <Label htmlFor="razonSocial">Razon Social *</Label>
                        <Input
                            id="razonSocial"
                            placeholder="Ingrese la razon social"
                            value={razonSocial}
                            onChange={(e) => setRazonSocial(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="empresa">Nombre Comercial (Empresa)</Label>
                        <Input
                            id="empresa"
                            placeholder="Ingrese el nombre comercial (opcional)"
                            value={empresa}
                            onChange={(e) => setEmpresa(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="cuit">CUIT *</Label>
                        <Input
                            id="cuit"
                            placeholder="XX-XXXXXXXX-X"
                            maxLength={13}
                            value={cuit}
                            onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9-]/g, '');
                                setCuit(val);
                            }}
                        />
                    </div>

                    <div className="rounded-lg p-3 bg-blue-50 border border-blue-200">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-semibold text-blue-800">Info</span>
                            <span className="text-xs text-blue-700">Los datos son provisorios hasta validacion de Administracion.</span>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleGuardar} className="bg-[#fb2c36] hover:bg-[#fb2c36]/90 text-white">
                        Guardar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
