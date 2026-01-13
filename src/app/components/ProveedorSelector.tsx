import { useEffect, useState } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Search, Plus } from 'lucide-react';
import { supabase } from '../services/supabase';
import { DialogNuevoProveedor } from './DialogNuevoProveedor';

export interface Proveedor {
  id: string;
  razon_social: string;
  empresa: string | null;
  cuit: string;
  direccion?: string | null;
  activo: boolean;
}

export interface ProveedorSelectorValue {
  proveedor?: string;
  razonSocial?: string;
  proveedorId?: string | null;
}

interface ProveedorSelectorProps {
  value?: ProveedorSelectorValue;
  onChange: (next: { proveedor: string; razonSocial: string; proveedorId: string | null; proveedorData?: Proveedor }) => void;
  disabled?: boolean;
  allowCreate?: boolean;
  className?: string;
}

export function ProveedorSelector({ value, onChange, disabled, allowCreate = true, className }: ProveedorSelectorProps) {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [localProveedor, setLocalProveedor] = useState<string>(value?.proveedor || '');
  const [localRazonSocial, setLocalRazonSocial] = useState<string>(value?.razonSocial || '');

  useEffect(() => {
    const fetchProveedores = async () => {
      const { data, error } = await supabase
        .from('proveedores')
        .select('*')
        .eq('activo', true)
        .order('razon_social');
      if (error) {
        console.error('Fetch proveedores error:', error);
        return;
      }
      if (data) setProveedores(data as Proveedor[]);
    };
    fetchProveedores();
  }, []);

  useEffect(() => {
    setLocalProveedor(value?.proveedor || '');
    setLocalRazonSocial(value?.razonSocial || '');
  }, [value?.proveedor, value?.razonSocial]);

  const selectByRazonSocial = (razon: string) => {
    const found = proveedores.find(p => p.razon_social === razon);
    const proveedorName = found?.empresa ?? found?.razon_social ?? razon;
    onChange({ proveedor: proveedorName, razonSocial: razon, proveedorId: found?.id || null, proveedorData: found });
  };

  const selectByEmpresa = (empresa: string) => {
    const found = proveedores.find(p => (p.empresa ?? '') === empresa) || proveedores.find(p => p.razon_social === empresa);
    const razon = found?.razon_social ?? localRazonSocial;
    onChange({ proveedor: empresa, razonSocial: razon, proveedorId: found?.id || null, proveedorData: found });
  };

  const onCreatedProveedor = async (created?: Proveedor) => {
    setShowCreate(false);
    // Refresh list
    const { data, error } = await supabase
      .from('proveedores')
      .select('*')
      .eq('activo', true)
      .order('razon_social');
    if (!error && data) setProveedores(data as Proveedor[]);
    if (created) {
      const proveedorName = created.empresa ?? created.razon_social;
      onChange({ proveedor: proveedorName, razonSocial: created.razon_social, proveedorId: created.id, proveedorData: created });
    }
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-1">Proveedor</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={localProveedor}
              onChange={(e) => {
                const v = e.target.value;
                setLocalProveedor(v);
              }}
              onBlur={(e) => selectByEmpresa(e.target.value)}
              placeholder="Buscar proveedor (empresa)"
              list="proveedores-empresas"
              disabled={disabled}
              className="pl-10"
            />
            <datalist id="proveedores-empresas">
              {[...new Set(proveedores.map(p => p.empresa || p.razon_social))].map((empresa) => (
                <option key={empresa} value={empresa} />
              ))}
            </datalist>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-1">Razón Social</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={localRazonSocial}
              onChange={(e) => {
                const v = e.target.value;
                setLocalRazonSocial(v);
              }}
              onBlur={(e) => selectByRazonSocial(e.target.value)}
              placeholder="Buscar razón social"
              list="proveedores-razon-social"
              disabled={disabled}
              className="pl-10"
            />
            <datalist id="proveedores-razon-social">
              {proveedores.map((p) => (
                <option key={p.id} value={p.razon_social} />
              ))}
            </datalist>
          </div>
        </div>
      </div>

      {allowCreate && (
        <div className="mt-3">
          <Button onClick={() => setShowCreate(true)} size="icon" className="bg-[#0070ff] hover:bg-[#0060dd] text-white">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

       {showCreate && (
         <DialogNuevoProveedor
           open={showCreate}
           onOpenChange={setShowCreate}
           onProveedorCreado={(created) => onCreatedProveedor(created)}
         />
       )}
    </div>
  );
}
