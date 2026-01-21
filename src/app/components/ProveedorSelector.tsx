import { useEffect, useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search, Plus } from 'lucide-react';
import { DialogNuevoProveedor } from './DialogNuevoProveedor';
import * as proveedoresService from '../services/proveedoresService';
import type { Proveedor } from '../types/proveedores';

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

  const fetchProveedores = async () => {
    const { data, error } = await proveedoresService.getActive();
    if (error) {
      console.error('Fetch proveedores error:', error);
      return;
    }
    setProveedores(data);
  };

  useEffect(() => {
    fetchProveedores();
  }, []);

  useEffect(() => {
    setLocalProveedor(value?.proveedor || '');
    setLocalRazonSocial(value?.razonSocial || '');
  }, [value?.proveedor, value?.razonSocial]);

  const selectByRazonSocial = (razon: string) => {
    const found = proveedores.find(p => p.razonSocial === razon);
    const proveedorName = found?.empresa ?? found?.razonSocial ?? razon;
    onChange({ proveedor: proveedorName, razonSocial: razon, proveedorId: found?.id || null, proveedorData: found });
  };

  const selectByEmpresa = (empresa: string) => {
    const found = proveedores.find(p => (p.empresa ?? '') === empresa) || proveedores.find(p => p.razonSocial === empresa);
    const razon = found?.razonSocial ?? localRazonSocial;
    onChange({ proveedor: empresa, razonSocial: razon, proveedorId: found?.id || null, proveedorData: found });
  };

  const onCreatedProveedor = async (created?: Proveedor) => {
    setShowCreate(false);
    await fetchProveedores();
    if (created) {
      const proveedorName = created.empresa ?? created.razonSocial;
      onChange({ proveedor: proveedorName, razonSocial: created.razonSocial, proveedorId: created.id, proveedorData: created });
    }
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left half: Razón Social + Plus button */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={localRazonSocial}
              onChange={(e) => {
                const v = e.target.value;
                setLocalRazonSocial(v);
              }}
              onBlur={(e) => selectByRazonSocial(e.target.value)}
              placeholder="Buscar por nombre o cuit"
              list="proveedores-razon-social"
              disabled={disabled}
              className="pl-10 h-10 bg-white border border-[#d1d5db]"
            />
            <datalist id="proveedores-razon-social">
              {proveedores.map((p) => (
                <option key={p.id} value={p.razonSocial} />
              ))}
            </datalist>
          </div>
          {allowCreate && (
            <Button
              onClick={() => setShowCreate(true)}
              size="icon"
              className="h-10 w-10 bg-[#0070ff] hover:bg-[#0060dd] text-white rounded-lg shrink-0"
            >
              <Plus className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Right half: Proveedor */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={localProveedor}
            onChange={(e) => {
              const v = e.target.value;
              setLocalProveedor(v);
            }}
            onBlur={(e) => selectByEmpresa(e.target.value)}
            placeholder="Buscar proveedor"
            list="proveedores-empresas"
            disabled={disabled}
            className="pl-10 h-10 bg-white border border-[#d1d5db]"
          />
          <datalist id="proveedores-empresas">
            {[...new Set(proveedores.map(p => p.empresa || p.razonSocial))].map((empresa) => (
              <option key={empresa} value={empresa} />
            ))}
          </datalist>
        </div>
      </div>

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
