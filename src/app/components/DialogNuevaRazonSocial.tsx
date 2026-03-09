import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';

interface DialogNuevaRazonSocialProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onRazonSocialCreada: (razonSocial: string) => void;
}

export function DialogNuevaRazonSocial({ open, onOpenChange, onRazonSocialCreada }: DialogNuevaRazonSocialProps) {
    const [razonSocial, setRazonSocial] = useState('');
    const [cuit, setCuit] = useState('');
    const [direccion, setDireccion] = useState('');
    const [proveedor, setProveedor] = useState('');

    const formatCuit = (value: string) => {
        const numbers = value.replace(/\D/g, '');

        if (numbers.length <= 2) {
            return numbers;
        } else if (numbers.length <= 10) {
            return `${numbers.slice(0, 2)}-${numbers.slice(2)}`;
        } else {
            return `${numbers.slice(0, 2)}-${numbers.slice(2, 10)}-${numbers.slice(10, 11)}`;
        }
    };

    const handleGuardar = () => {
        if (!razonSocial.trim()) {
            toast.error('La razón social es obligatoria');
            return;
        }
        if (cuit.length < 13) {
            toast.error('El CUIT debe estar completo');
            return;
        }

        onRazonSocialCreada(razonSocial);
        toast.success('Razón Social creada correctamente (pendiente de verificación)');

        setRazonSocial('');
        setCuit('');
        setDireccion('');
        setProveedor('');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Nueva Razón Social</DialogTitle>
                    <DialogDescription>Complete los datos de la nueva razón social</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="razonSocial" className="font-semibold text-sm">Razón Social *</Label>
                        <Input
                            id="razonSocial"
                            placeholder="Ingrese la razón social"
                            value={razonSocial}
                            onChange={(e) => setRazonSocial(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="cuitRS" className="font-semibold text-sm">CUIT *</Label>
                        <Input
                            id="cuitRS"
                            placeholder="XX-XXXXXXXX-X"
                            maxLength={13}
                            value={cuit}
                            onChange={(e) => {
                                const formatted = formatCuit(e.target.value);
                                setCuit(formatted);
                            }}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="direccion" className="font-semibold text-sm">Dirección</Label>
                        <Input
                            id="direccion"
                            placeholder="Ingrese la dirección legal"
                            value={direccion}
                            onChange={(e) => setDireccion(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="proveedor" className="font-semibold text-sm">Proveedor</Label>
                        <Input
                            id="proveedor"
                            placeholder="Ingrese nombre del proveedor"
                            value={proveedor}
                            onChange={(e) => setProveedor(e.target.value)}
                        />
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
