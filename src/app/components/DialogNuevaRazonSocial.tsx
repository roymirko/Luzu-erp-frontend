import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';

interface DialogNuevaRazonSocialProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onRazonSocialCreada: (razonSocial: string) => void;
}

export function DialogNuevaRazonSocial({ open, onOpenChange, onRazonSocialCreada }: DialogNuevaRazonSocialProps) {
    const [nombreLegal, setNombreLegal] = useState('');
    const [cuit, setCuit] = useState('');
    const [condicionIva, setCondicionIva] = useState('');

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
        if (!nombreLegal.trim()) {
            toast.error('El nombre legal es obligatorio');
            return;
        }
        // Simple validation for CUIT length, more complex regex can be added if needed
        if (cuit.length < 13) {
            toast.error('El CUIT debe estar completo');
            return;
        }
        if (!condicionIva) {
            toast.error('Debe seleccionar una condición de IVA');
            return;
        }

        onRazonSocialCreada(nombreLegal);
        toast.success('Razón Social creada correctamente (pendiente de verificación)');

        setNombreLegal('');
        setCuit('');
        setCondicionIva('');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Nueva Razón Social</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <p className="text-sm text-muted-foreground">
                        Complete los campos para crear una nueva Razón Social.
                    </p>
                    <div className="grid gap-2">
                        <Label htmlFor="nombreLegal">Nombre Legal (Razón Social) *</Label>
                        <Input
                            id="nombreLegal"
                            placeholder="Ingrese la razón social completa"
                            value={nombreLegal}
                            onChange={(e) => setNombreLegal(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="cuitRS">CUIT *</Label>
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
                        <Label>Condición de IVA *</Label>
                        <Select value={condicionIva} onValueChange={setCondicionIva}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Monotributo">Monotributo</SelectItem>
                                <SelectItem value="Responsable Inscripto">Responsable Inscripto</SelectItem>
                                <SelectItem value="Exento">Exento</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="rounded-lg p-3 bg-blue-50 border border-blue-200">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-semibold text-blue-800">ℹ️ Información importante</span>
                            <span className="text-xs text-blue-700">La Razón Social será verificada con Finanzas para alta Finegans.</span>
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
