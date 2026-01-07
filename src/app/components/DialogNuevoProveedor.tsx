import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';

interface DialogNuevoProveedorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onProveedorCreado: (nombre: string) => void;
}

export function DialogNuevoProveedor({ open, onOpenChange, onProveedorCreado }: DialogNuevoProveedorProps) {
    const [nombreComercial, setNombreComercial] = useState('');
    const [cuit, setCuit] = useState('');
    const [email, setEmail] = useState('');

    const handleGuardar = () => {
        // Validar campos
        if (!nombreComercial.trim()) {
            toast.error('El nombre comercial es obligatorio');
            return;
        }
        if (!cuit.trim()) {
            toast.error('El CUIT es obligatorio');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim() || !emailRegex.test(email)) {
            toast.error('El formato del email no es válido');
            return;
        }

        // Callback al componente padre
        onProveedorCreado(nombreComercial);

        // Toast de éxito
        toast.success('Proveedor creado correctamente (pendiente de validación)');

        // Reset y cerrar
        setNombreComercial('');
        setCuit('');
        setEmail('');
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
                        <Label htmlFor="nombreComercial">Nombre Comercial *</Label>
                        <Input
                            id="nombreComercial"
                            placeholder="Ingrese el nombre comercial"
                            value={nombreComercial}
                            onChange={(e) => setNombreComercial(e.target.value)}
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
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email de contacto comercial *</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="contacto@proveedor.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="rounded-lg p-3 bg-blue-50 border border-blue-200">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-semibold text-blue-800">ℹ️ Información importante</span>
                            <span className="text-xs text-blue-700">Los datos son provisorios hasta validación de Administración.</span>
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
