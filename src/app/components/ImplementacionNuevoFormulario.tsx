import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useFormularios } from '../contexts/FormulariosContext';
import { supabase } from '../services/supabase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { ProveedorSelector } from './ProveedorSelector';
import { mapImplementationExpenseFromDB, mapImplementationExpenseToDB, type ImplementationExpense } from '../utils/supabaseMappers';

interface Props {
  formId?: string;
  itemId?: string;
}

export function ImplementacionNuevoFormulario({ formId, itemId }: Props) {
  const { isDark } = useTheme();
  const { formularios } = useFormularios();
  const [expenses, setExpenses] = useState<ImplementationExpense[]>([]);
  const [expenseHeaderId, setExpenseHeaderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Find base form
  const form = useMemo(() => formularios.find((f) => f.id === formId), [formularios, formId]);
  const selectedItem = useMemo(() => form?.importeRows?.find((r) => r.id === itemId), [form, itemId]);

  useEffect(() => {
    const ensureHeaderAndFetchItems = async () => {
      if (!formId || !itemId) return;
      setLoading(true);
      // 1) Ensure header exists
        const { data: headers, error: headerErr } = await supabase
        .from('gastos_implementacion')
        .select('id')
        .eq('orden_publicidad_id', formId)
        .eq('item_orden_publicidad_id', itemId)
        .limit(1);
      if (headerErr) {
        console.error('Error fetching implementation_expenses header:', headerErr);
        setLoading(false);
        return;
      }
      let headerId = headers && headers.length ? headers[0].id : null;
      if (!headerId) {
        const today = new Date();
        const { data: inserted, error: insertErr } = await supabase
          .from('gastos_implementacion')
          .insert({
            orden_publicidad_id: formId,
            item_orden_publicidad_id: itemId,
            fecha_registro: today.toISOString().slice(0, 10),
            orden_publicidad: form?.ordenPublicidad || '',
            responsable: form?.responsable || '',
            unidad_negocio: form?.unidadNegocio || '',
            categoria_negocio: form?.categoriaNegocio || null,
            nombre_campana: form?.nombreCampana || '',
            anio: today.getFullYear(),
            mes: today.getMonth() + 1,
            estado: 'pendiente'
          })
          .select('id')
          .single();
        if (insertErr) {
          console.error('Error inserting implementation_expenses header:', insertErr);
          setLoading(false);
          return;
        }
        headerId = inserted?.id || null;
      }
      setExpenseHeaderId(headerId);

      // 2) Fetch items for this header
      if (headerId) {
        const { data: items, error: itemsErr } = await supabase
          .from('items_gasto_implementacion')
          .select('*')
          .eq('gasto_id', headerId)
          .order('fecha_creacion', { ascending: true });
        if (itemsErr) {
          console.error('Error fetching implementation_expense_items:', itemsErr);
        } else if (items) {
          setExpenses(items.map(mapImplementationExpenseFromDB));
        }
      }
      setLoading(false);
    };
    ensureHeaderAndFetchItems();
  }, [formId, itemId, form]);

  const addExpense = async () => {
    if (!expenseHeaderId) return;
    const payload: Partial<ImplementationExpense> = {
      expenseId: expenseHeaderId,
      proveedor: '',
      razonSocial: '',
      condicionPago: '',
      neto: 0,
      fechaComprobante: ''
    };
    const { data, error } = await supabase
      .from('items_gasto_implementacion')
      .insert(mapImplementationExpenseToDB(payload))
      .select('*')
      .single();
    if (error) {
      console.error('Error inserting implementation_expense_item:', error);
      return;
    }
    setExpenses((prev) => [...prev, mapImplementationExpenseFromDB(data)]);
  };

  const saveExpenseField = async (id: string, patch: Partial<ImplementationExpense>) => {
    const { error } = await supabase
      .from('items_gasto_implementacion')
      .update(mapImplementationExpenseToDB(patch))
      .eq('id', id);
    if (error) console.error('Error updating implementation_expense_item:', error);
  };

  const sectionCls = `rounded-lg border ${isDark ? 'bg-[#141414] border-gray-800' : 'bg-white border-gray-200'}`;
  const fieldsetTitle = `text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`;
  const muted = isDark ? 'text-gray-500' : 'text-gray-600';

  return (
    <div className="space-y-6">
      {/* Breadcrumbs are rendered by App.tsx */}

      {/* Carga de datos */}
      <div className={sectionCls}>
        <div className="p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}">
          <h3 className={fieldsetTitle}>Carga de datos</h3>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className={muted}>Factura emitida a*</Label>
            <Input placeholder="LZU TV SA" value={form?.empresaAgencia || ''} readOnly className={isDark ? 'bg-[#1e1e1e] border-gray-800 text-white' : ''} />
          </div>
          <div>
            <Label className={muted}>Empresa*</Label>
            <Input placeholder="LZU TV SA" value={form?.empresaAgencia || ''} readOnly className={isDark ? 'bg-[#1e1e1e] border-gray-800 text-white' : ''} />
          </div>
          <div>
            <Label className={muted}>Unidad de negocio*</Label>
            <Input placeholder="Experience" value={form?.unidadNegocio || ''} readOnly className={isDark ? 'bg-[#1e1e1e] border-gray-800 text-white' : ''} />
          </div>
          <div>
            <Label className={muted}>Categoría de negocio*</Label>
            <Input placeholder="Media" value={form?.categoriaNegocio || ''} readOnly className={isDark ? 'bg-[#1e1e1e] border-gray-800 text-white' : ''} />
          </div>
          <div>
            <Label className={muted}>Sector</Label>
            <Input placeholder="Implementación" value="Implementación" readOnly className={isDark ? 'bg-[#1e1e1e] border-gray-800 text-white' : ''} />
          </div>
          <div>
            <Label className={muted}>Rubro de gasto</Label>
            <Input placeholder="Gasto de venta" className={isDark ? 'bg-[#1e1e1e] border-gray-800 text-white' : ''} />
          </div>
          <div>
            <Label className={muted}>Sub rubro</Label>
            <Input placeholder="Producción" className={isDark ? 'bg-[#1e1e1e] border-gray-800 text-white' : ''} />
          </div>
          <div>
            <Label className={muted}>Nombre de la campaña*</Label>
            <Input placeholder="Mercado Libre" value={form?.nombreCampana || ''} readOnly className={isDark ? 'bg-[#1e1e1e] border-gray-800 text-white' : ''} />
          </div>
          <div className="md:col-span-2">
            <Label className={muted}>Detalle/campaña*</Label>
            <Input placeholder="Conceptos de gasto" className={isDark ? 'bg-[#1e1e1e] border-gray-800 text-white' : ''} />
          </div>
        </div>
      </div>

      {/* Carga de importes */}
      <div className={sectionCls}>
        <div className="p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}">
          <h3 className={fieldsetTitle}>Carga de importes</h3>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className={muted}>Orden de publicidad</Label>
            <Input placeholder="10398701" value={form?.ordenPublicidad || ''} readOnly className={isDark ? 'bg-[#1e1e1e] border-gray-800 text-white' : ''} />
          </div>
          <div>
            <Label className={muted}>Presupuesto</Label>
            <Input placeholder="$5.000.000" value={form?.totalVenta || ''} readOnly className={isDark ? 'bg-[#1e1e1e] border-gray-800 text-white' : ''} />
            <p className={`mt-1 text-xs ${muted}`}>El total de importes cargados supera el presupuesto asignado</p>
          </div>
        </div>

        {/* Gasto 1 - resumen */}
        <div className="px-4 pb-4">
          <Card className={isDark ? 'bg-[#121212] border-gray-800' : ''}>
            <div className="p-4 flex items-center justify-between">
              <span className={isDark ? 'text-white font-medium' : 'text-gray-900 font-medium'}>Gasto #1</span>
              <div className="flex items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-yellow-400"></span>
                  <span className={muted}>Pendiente de pago</span>
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Gasto 2 - formulario */}
        <div className="px-4 pb-4">
          <Card className={isDark ? 'bg-[#121212] border-gray-800' : ''}>
            <div className="p-4">
              <div className="mb-3 font-medium ${isDark ? 'text-white' : 'text-gray-900'}">Gasto #2</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className={muted}>Empresa/PGM*</Label>
                  <Input placeholder="NDN" value={selectedItem?.programa || ''} readOnly className={isDark ? 'bg-[#1e1e1e] border-gray-800 text-white' : ''} />
                </div>
                <div>
                  <Label className={muted}>Fecha comprobante*</Label>
                  <Input placeholder="01/01/2025" className={isDark ? 'bg-[#1e1e1e] border-gray-800 text-white' : ''} />
                </div>
                <div>
                  <Label className={muted}>Proveedor*</Label>
                  <Input placeholder="KLM COMPANY S.A" className={isDark ? 'bg-[#1e1e1e] border-gray-800 text-white' : ''} />
                </div>
                <div>
                  <Label className={muted}>Razón social*</Label>
                  <Input placeholder="KLM COMPANY S.A" className={isDark ? 'bg-[#1e1e1e] border-gray-800 text-white' : ''} />
                </div>
                <div>
                  <Label className={muted}>Condición de pago*</Label>
                  <Input placeholder="10 días" className={isDark ? 'bg-[#1e1e1e] border-gray-800 text-white' : ''} />
                </div>
                <div>
                  <Label className={muted}>Neto</Label>
                  <Input placeholder="$50.000" className={isDark ? 'bg-[#1e1e1e] border-gray-800 text-white' : ''} />
                </div>
              </div>
              <div className="mt-2 text-xs">
                <button className="text-[#0ea5e9] hover:underline">1 adjunto agregado</button>
              </div>
            </div>
          </Card>
        </div>

        {/* Gastos dinámicos: lista + agregar */}
        <div className="px-4 pb-4">
          <Card className={isDark ? 'bg-[#121212] border-gray-800' : ''}>
            <div className="p-4">
              <div className="mb-3 font-medium ${isDark ? 'text-white' : 'text-gray-900'}">Gastos</div>
              {expenses.map((g, idx) => (
                <div key={g.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label className={muted}>Empresa/PGM*</Label>
                    <Input value={selectedItem?.programa || ''} readOnly className={isDark ? 'bg-[#1e1e1e] border-gray-800 text-white' : ''} />
                  </div>
                  <div>
                    <Label className={muted}>Fecha comprobante*</Label>
                    <Input
                      placeholder="__/__/____"
                      value={g.fechaComprobante || ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        setExpenses((prev) => prev.map((x) => (x.id === g.id ? { ...x, fechaComprobante: v } : x)));
                      }}
                      onBlur={() => saveExpenseField(g.id, { fechaComprobante: g.fechaComprobante })}
                      className={isDark ? 'bg-[#1e1e1e] border-gray-800 text-white' : ''}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className={muted}>Proveedor y Razón social*</Label>
                    <ProveedorSelector
                      value={{ proveedor: g.proveedor || '', razonSocial: g.razonSocial || '', proveedorId: g.proveedorId || null }}
                      onChange={(next) => {
                        setExpenses((prev) => prev.map((x) => (
                          x.id === g.id ? { ...x, proveedor: next.proveedor, razonSocial: next.razonSocial, proveedorId: next.proveedorId || null } : x
                        )));
                         saveExpenseField(g.id, { proveedor: next.proveedor, razonSocial: next.razonSocial, proveedorId: next.proveedorId || null });
                      }}
                    />
                  </div>
                  <div>
                    <Label className={muted}>Condición de pago*</Label>
                    <Input
                      placeholder="Seleccionar"
                      value={g.condicionPago || ''}
                      onChange={(e) => setExpenses((prev) => prev.map((x) => (x.id === g.id ? { ...x, condicionPago: e.target.value } : x)))}
                      onBlur={() => saveExpenseField(g.id, { condicionPago: g.condicionPago })}
                      className={isDark ? 'bg-[#1e1e1e] border-gray-800 text-white' : ''}
                    />
                  </div>
                  <div>
                    <Label className={muted}>Neto</Label>
                    <Input
                      placeholder="$90.000"
                      value={g.neto !== undefined ? String(g.neto) : ''}
                      onChange={(e) => {
                        const v = Number(e.target.value.replace(/[^0-9.-]/g, ''));
                        setExpenses((prev) => prev.map((x) => (x.id === g.id ? { ...x, neto: isNaN(v) ? 0 : v } : x)));
                      }}
                      onBlur={() => saveExpenseField(g.id, { neto: g.neto })}
                      className={isDark ? 'bg-[#1e1e1e] border-gray-800 text-white' : ''}
                    />
                  </div>
                  <div className="md:col-span-2 text-xs">
                    <button className="text-[#0ea5e9] hover:underline">Agregar adjuntos</button>
                  </div>
                </div>
              ))}
              <div className="mt-2">
                <Button variant="outline" onClick={addExpense} className={isDark ? 'border-gray-800 text-gray-300' : ''}>+ Agregar importe</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Observaciones */}
      <div className={sectionCls}>
        <div className="p-4">
          <Label className={muted}>Observaciones</Label>
          <Textarea placeholder="Type here" className={`mt-2 ${isDark ? 'bg-[#1e1e1e] border-gray-800 text-white' : ''}`} />
        </div>
      </div>

      {/* Resumen presupuesto */}
      <div className="space-y-4">
        <h3 className={fieldsetTitle}>Resumen Presupuesto</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className={`p-4 ${isDark ? 'bg-[#121212] border-gray-800' : ''}`}>
            <div className="text-sm ${muted}">Asignado</div>
            <div className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>$5.000.000</div>
          </Card>
          <Card className={`p-4 ${isDark ? 'bg-[#121212] border-gray-800' : ''}`}>
            <div className="text-sm ${muted}">Ejecutado</div>
            <div className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>$5.500.000</div>
          </Card>
          <Card className={`p-4 ${isDark ? 'bg-[#121212] border-gray-800' : ''}`}>
            <div className="text-sm ${muted}">Excedente</div>
            <div className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>-$500.000</div>
          </Card>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button variant="ghost" className={isDark ? 'text-gray-400 hover:text-white hover:bg-[#1e1e1e]' : ''}>Cancelar</Button>
        <Button className="bg-[#fb2c36] hover:bg-[#fb2c36]/90">Guardar</Button>
      </div>
    </div>
  );
}
