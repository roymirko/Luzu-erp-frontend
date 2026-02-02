-- ============================================
-- SEED DATA
-- ============================================

-- 1. ROLES
INSERT INTO public.roles (name, description, permissions)
VALUES
  ('Administrador', 'Control total del sistema, puede crear, editar y eliminar usuarios y áreas',
   '[
      {"resource": "users", "actions": ["create", "read", "update", "delete"]},
      {"resource": "areas", "actions": ["create", "read", "update", "delete"]},
      {"resource": "roles", "actions": ["read"]},
      {"resource": "logs", "actions": ["read"]},
      {"resource": "forms", "actions": ["create", "read", "update", "delete"]},
      {"resource": "tasks", "actions": ["create", "read", "update", "delete"]}
    ]'::jsonb),
  ('Editor', 'Puede editar contenido y gestionar tareas, pero no usuarios ni áreas',
   '[
      {"resource": "users", "actions": ["read"]},
      {"resource": "areas", "actions": ["read"]},
      {"resource": "forms", "actions": ["create", "read", "update"]},
      {"resource": "tasks", "actions": ["create", "read", "update", "delete"]}
    ]'::jsonb),
  ('Visualizador', 'Solo puede ver información, sin permisos de edición',
   '[
      {"resource": "users", "actions": ["read"]},
      {"resource": "areas", "actions": ["read"]},
      {"resource": "forms", "actions": ["read"]},
      {"resource": "tasks", "actions": ["read"]}
    ]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- 2. USUARIOS
INSERT INTO public.usuarios (email, first_name, last_name, active, creado_por, metadata)
VALUES
  ('gaby@luzutv.com.ar', 'Gabriela', 'Riero', true, 'system', '{"position": "CEO"}'::jsonb),
  ('gestion@luzutv.com.ar', 'Felicitas', 'Carelli', true, 'system', '{"position": "Project Manager"}'::jsonb)
ON CONFLICT (email) DO NOTHING;

-- 3. AREAS
INSERT INTO public.areas (name, code, description, active, creado_por, metadata)
VALUES
  ('Comercial', 'COM', 'Gestión de propuestas y estrategias comerciales', true, 'system', '{"color": "#fb2c36", "icon": "Briefcase"}'::jsonb),
  ('Implementación', 'IMP', 'Implementación y gestión de proyectos técnicos', true, 'system', '{"color": "#3b82f6", "icon": "Settings"}'::jsonb),
  ('Dir. de Programación', 'PRG', 'Planificación y dirección de programación de contenidos', true, 'system', '{"color": "#10b981", "icon": "TrendingUp"}'::jsonb),
  ('Master', 'MST', 'Super administradores del sistema', true, 'system', '{"color": "#8b5cf6", "icon": "Users"}'::jsonb)
ON CONFLICT (code) DO NOTHING;

-- 4. ASSIGNMENTS via DO block to lookup IDs
DO $$
DECLARE
  v_role_admin uuid;
  v_user_gaby uuid;
  v_user_feli uuid;
  v_area_com uuid;
  v_area_imp uuid;
  v_area_prg uuid;
  v_area_mst uuid;
BEGIN
  -- Get IDs
  SELECT id INTO v_role_admin FROM public.roles WHERE name = 'Administrador';

  SELECT id INTO v_user_gaby FROM public.usuarios WHERE email = 'gaby@luzutv.com.ar';
  SELECT id INTO v_user_feli FROM public.usuarios WHERE email = 'gestion@luzutv.com.ar';

  SELECT id INTO v_area_com FROM public.areas WHERE code = 'COM';
  SELECT id INTO v_area_imp FROM public.areas WHERE code = 'IMP';
  SELECT id INTO v_area_prg FROM public.areas WHERE code = 'PRG';
  SELECT id INTO v_area_mst FROM public.areas WHERE code = 'MST';

  -- Assignments for Gabriela (CEO) - Admin in all areas
  IF v_user_gaby IS NOT NULL AND v_role_admin IS NOT NULL THEN
    INSERT INTO public.usuario_area_roles (usuario_id, area_id, rol_id, assigned_by)
    VALUES
      (v_user_gaby, v_area_com, v_role_admin, 'system'),
      (v_user_gaby, v_area_imp, v_role_admin, 'system'),
      (v_user_gaby, v_area_prg, v_role_admin, 'system'),
      (v_user_gaby, v_area_mst, v_role_admin, 'system')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Assignments for Felicitas (PM) - Admin in all except Master
  IF v_user_feli IS NOT NULL AND v_role_admin IS NOT NULL THEN
    INSERT INTO public.usuario_area_roles (usuario_id, area_id, rol_id, assigned_by)
    VALUES
      (v_user_feli, v_area_com, v_role_admin, 'system'),
      (v_user_feli, v_area_imp, v_role_admin, 'system'),
      (v_user_feli, v_area_prg, v_role_admin, 'system')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ============================================
-- 5. ENTIDADES (proveedores + clientes)
-- ============================================
INSERT INTO public.entidades (razon_social, cuit, tipo_entidad, condicion_iva, empresa, direccion, activo, created_by)
VALUES
  ('Producciones Audiovisuales S.A.', '30712345678', 'proveedor', 'responsable_inscripto', 'Producciones Audiovisuales', 'Av. Corrientes 1234, CABA', true, 'system'),
  ('Media Tech Argentina S.R.L.', '30723456789', 'proveedor', 'responsable_inscripto', 'Media Tech', 'Av. del Libertador 5678, CABA', true, 'system'),
  ('Servicios de Contenido Digital S.A.', '30734567890', 'proveedor', 'responsable_inscripto', 'Contenido Digital', 'Av. Santa Fe 910, CABA', true, 'system'),
  ('Talentos y Producción S.A.', '30745678901', 'proveedor', 'responsable_inscripto', 'Talentos', 'Av. Cabildo 1112, CABA', true, 'system'),
  ('Equipamiento Técnico S.R.L.', '30756789012', 'proveedor', 'monotributista', 'Equipamiento', 'Av. Belgrano 1314, CABA', true, 'system'),
  ('Estudio Creativo Buenos Aires S.A.', '30767890123', 'proveedor', 'responsable_inscripto', 'Estudio Creativo', 'Av. Rivadavia 2000, CABA', true, 'system'),
  ('Logística Medios S.R.L.', '30778901234', 'proveedor', 'monotributista', 'Logística Medios', 'Av. Callao 500, CABA', true, 'system'),
  ('Post Producción Argentina S.A.', '30789012345', 'proveedor', 'responsable_inscripto', 'Post Producción', 'Av. Córdoba 3000, CABA', true, 'system'),
  ('Sonido Profesional S.R.L.', '30790123456', 'proveedor', 'monotributista', 'Sonido Pro', 'Av. Pueyrredón 800, CABA', true, 'system'),
  ('Iluminación y Escenografía S.A.', '30801234567', 'proveedor', 'responsable_inscripto', 'Iluminación', 'Av. Las Heras 1500, CABA', true, 'system')
ON CONFLICT (cuit) DO NOTHING;

-- ============================================
-- 6. ORDENES DE PUBLICIDAD + ITEMS (6 orders)
-- ============================================
DO $$
DECLARE
  v_orden1 uuid; v_orden2 uuid; v_orden3 uuid;
  v_orden4 uuid; v_orden5 uuid; v_orden6 uuid;
BEGIN
  -- Orden 1: Coca Cola - Verano 2024
  INSERT INTO public.ordenes_publicidad (
    fecha, mes_servicio, responsable, orden_publicidad, total_venta,
    unidad_negocio, razon_social, marca, nombre_campana, tipo_importe, acuerdo_pago
  ) VALUES (
    '2024-01-15', '2024-01', 'Gabriela Riero', 'OP-2024-001', '150000',
    'Media', 'Coca Cola Argentina', 'Coca Cola', 'Verano 2024', 'factura', '30 días'
  ) RETURNING id INTO v_orden1;

  INSERT INTO public.items_orden_publicidad (orden_publicidad_id, programa, monto, implementacion, talentos, tecnica)
  VALUES
    (v_orden1, 'Nadie Dice Nada', '50000', '10000', '5000', '2000'),
    (v_orden1, 'Antes Que Nadie', '50000', '8000', '4000', '1500'),
    (v_orden1, 'Se Fue Larga', '50000', '7000', '3000', '1000');

  -- Orden 2: Movistar - Conectados
  INSERT INTO public.ordenes_publicidad (
    fecha, mes_servicio, responsable, orden_publicidad, total_venta,
    unidad_negocio, razon_social, marca, nombre_campana, tipo_importe, acuerdo_pago
  ) VALUES (
    '2024-01-20', '2024-01', 'Gabriela Riero', 'OP-2024-002', '80000',
    'Digital', 'Telefónica de Argentina', 'Movistar', 'Conectados', 'factura', '45 días'
  ) RETURNING id INTO v_orden2;

  INSERT INTO public.items_orden_publicidad (orden_publicidad_id, programa, monto, implementacion, talentos, tecnica)
  VALUES
    (v_orden2, 'Nadie Dice Nada', '40000', '6000', '3000', '1000'),
    (v_orden2, 'Patria y Familia', '40000', '5000', '2500', '800');

  -- Orden 3: MercadoPago - Cashback
  INSERT INTO public.ordenes_publicidad (
    fecha, mes_servicio, responsable, orden_publicidad, total_venta,
    unidad_negocio, razon_social, marca, nombre_campana, tipo_importe, acuerdo_pago
  ) VALUES (
    '2024-02-01', '2024-02', 'Gabriela Riero', 'OP-2024-003', '200000',
    'Media', 'Mercado Libre', 'MercadoPago', 'Cashback', 'factura', '30 días'
  ) RETURNING id INTO v_orden3;

  INSERT INTO public.items_orden_publicidad (orden_publicidad_id, programa, monto, implementacion, talentos, tecnica)
  VALUES
    (v_orden3, 'Nadie Dice Nada', '80000', '15000', '8000', '3000'),
    (v_orden3, 'La Novela', '60000', '10000', '5000', '2000'),
    (v_orden3, 'Algo de Música', '60000', '10000', '5000', '2000');

  -- Orden 4: YPF - Energía Argentina
  INSERT INTO public.ordenes_publicidad (
    fecha, mes_servicio, responsable, orden_publicidad, total_venta,
    unidad_negocio, razon_social, marca, nombre_campana, tipo_importe, acuerdo_pago
  ) VALUES (
    '2024-02-10', '2024-02', 'Gabriela Riero', 'OP-2024-004', '120000',
    'Streaming', 'YPF S.A.', 'YPF', 'Energía Argentina', 'factura', '60 días'
  ) RETURNING id INTO v_orden4;

  INSERT INTO public.items_orden_publicidad (orden_publicidad_id, programa, monto, implementacion, talentos, tecnica)
  VALUES
    (v_orden4, 'Antes Que Nadie', '60000', '9000', '4000', '1500'),
    (v_orden4, 'Se Fue Larga', '60000', '9000', '4000', '1500');

  -- Orden 5: Quilmes - Amigos
  INSERT INTO public.ordenes_publicidad (
    fecha, mes_servicio, responsable, orden_publicidad, total_venta,
    unidad_negocio, razon_social, marca, nombre_campana, tipo_importe, acuerdo_pago
  ) VALUES (
    '2024-03-01', '2024-03', 'Gabriela Riero', 'OP-2024-005', '180000',
    'Media', 'Cervecería Quilmes', 'Quilmes', 'Amigos', 'factura', '30 días'
  ) RETURNING id INTO v_orden5;

  INSERT INTO public.items_orden_publicidad (orden_publicidad_id, programa, monto, implementacion, talentos, tecnica)
  VALUES
    (v_orden5, 'Nadie Dice Nada', '70000', '12000', '6000', '2500'),
    (v_orden5, 'Patria y Familia', '55000', '8000', '4000', '1500'),
    (v_orden5, 'La Novela', '55000', '8000', '4000', '1500');

  -- Orden 6: Galicia - Digital
  INSERT INTO public.ordenes_publicidad (
    fecha, mes_servicio, responsable, orden_publicidad, total_venta,
    unidad_negocio, razon_social, marca, nombre_campana, tipo_importe, acuerdo_pago
  ) VALUES (
    '2024-03-15', '2024-03', 'Gabriela Riero', 'OP-2024-006', '90000',
    'Digital', 'Banco Galicia', 'Galicia', 'Digital', 'factura', '45 días'
  ) RETURNING id INTO v_orden6;

  INSERT INTO public.items_orden_publicidad (orden_publicidad_id, programa, monto, implementacion, talentos, tecnica)
  VALUES
    (v_orden6, 'Algo de Música', '45000', '7000', '3500', '1200'),
    (v_orden6, 'Antes Que Nadie', '45000', '7000', '3500', '1200');
END $$;

-- ============================================
-- 7. COMPROBANTES DE PROGRAMACIÓN
-- 4 formularios con 2 comprobantes cada uno = 8 comprobantes totales
-- ============================================
DO $$
DECLARE
  v_form1 uuid; v_form2 uuid; v_form3 uuid; v_form4 uuid;
  v_comprobante uuid;
BEGIN
  -- Formulario 1: Nadie Dice Nada - Enero 2024
  INSERT INTO public.programacion_formularios (
    mes_gestion, unidad_negocio, programa, ejecutivo, sub_rubro_empresa, detalle_campana, estado, created_by
  ) VALUES (
    '2024-01', 'Media', 'Nadie Dice Nada', 'Gabriela Riero', 'Entretenimiento', 'Campaña NDD Enero', 'activo', 'system'
  ) RETURNING id INTO v_form1;

  -- Comprobante 1.1: Producción general
  INSERT INTO public.comprobantes (
    tipo_movimiento, entidad_nombre, entidad_cuit, neto, iva_alicuota, iva_monto, total, moneda, empresa, estado, estado_pago, created_by
  ) VALUES (
    'egreso', 'Producciones Audiovisuales S.A.', '30712345678',
    25000, 21, 5250, 30250, 'ARS', 'Luzu TV', 'activo', 'pendiente', 'system'
  ) RETURNING id INTO v_comprobante;
  INSERT INTO public.programacion_comprobantes (comprobante_id, formulario_id, categoria, monto, factura_emitida_a, acuerdo_pago, forma_pago)
  VALUES (v_comprobante, v_form1, 'FM Luzu', 30250, 'Luzu TV', '30', 'transferencia');

  -- Comprobante 1.2: Equipamiento técnico
  INSERT INTO public.comprobantes (
    tipo_movimiento, entidad_nombre, entidad_cuit, neto, iva_alicuota, iva_monto, total, moneda, empresa, estado, estado_pago, created_by
  ) VALUES (
    'egreso', 'Equipamiento Técnico S.R.L.', '30756789012',
    18000, 21, 3780, 21780, 'ARS', 'Luzu TV SA', 'activo', 'pagado', 'system'
  ) RETURNING id INTO v_comprobante;
  INSERT INTO public.programacion_comprobantes (comprobante_id, formulario_id, categoria, monto, factura_emitida_a, acuerdo_pago, forma_pago)
  VALUES (v_comprobante, v_form1, 'Antes Que Nadie', 21780, 'Luzu TV SA', '45', 'cheque');

  -- Formulario 2: Antes Que Nadie - Enero 2024
  INSERT INTO public.programacion_formularios (
    mes_gestion, unidad_negocio, programa, ejecutivo, sub_rubro_empresa, detalle_campana, estado, created_by
  ) VALUES (
    '2024-01', 'Media', 'Antes Que Nadie', 'Gabriela Riero', 'Noticias', 'Campaña AQN Enero', 'activo', 'system'
  ) RETURNING id INTO v_form2;

  -- Comprobante 2.1: Talentos
  INSERT INTO public.comprobantes (
    tipo_movimiento, entidad_nombre, entidad_cuit, neto, iva_alicuota, iva_monto, total, moneda, empresa, estado, estado_pago, created_by
  ) VALUES (
    'egreso', 'Talentos y Producción S.A.', '30745678901',
    35000, 21, 7350, 42350, 'ARS', 'Luzu TV', 'activo', 'pendiente', 'system'
  ) RETURNING id INTO v_comprobante;
  INSERT INTO public.programacion_comprobantes (comprobante_id, formulario_id, categoria, monto, factura_emitida_a, acuerdo_pago, forma_pago)
  VALUES (v_comprobante, v_form2, 'Nadie Dice Nada', 42350, 'Luzu TV', '30', 'transferencia');

  -- Comprobante 2.2: Post producción
  INSERT INTO public.comprobantes (
    tipo_movimiento, entidad_nombre, entidad_cuit, neto, iva_alicuota, iva_monto, total, moneda, empresa, estado, estado_pago, created_by
  ) VALUES (
    'egreso', 'Post Producción Argentina S.A.', '30789012345',
    22000, 21, 4620, 26620, 'ARS', 'Luzu TV SA', 'activo', 'pagado', 'system'
  ) RETURNING id INTO v_comprobante;
  INSERT INTO public.programacion_comprobantes (comprobante_id, formulario_id, categoria, monto, factura_emitida_a, acuerdo_pago, forma_pago)
  VALUES (v_comprobante, v_form2, 'Patria y Familia', 26620, 'Luzu TV SA', '60', 'efectivo');

  -- Formulario 3: Se Fue Larga - Febrero 2024
  INSERT INTO public.programacion_formularios (
    mes_gestion, unidad_negocio, programa, ejecutivo, sub_rubro_empresa, detalle_campana, estado, created_by
  ) VALUES (
    '2024-02', 'Media', 'Se Fue Larga', 'Gabriela Riero', 'Deportes', 'Campaña SFL Febrero', 'activo', 'system'
  ) RETURNING id INTO v_form3;

  -- Comprobante 3.1: Sonido
  INSERT INTO public.comprobantes (
    tipo_movimiento, entidad_nombre, entidad_cuit, neto, iva_alicuota, iva_monto, total, moneda, empresa, estado, estado_pago, created_by
  ) VALUES (
    'egreso', 'Sonido Profesional S.R.L.', '30790123456',
    28000, 21, 5880, 33880, 'ARS', 'Luzu TV', 'activo', 'pendiente', 'system'
  ) RETURNING id INTO v_comprobante;
  INSERT INTO public.programacion_comprobantes (comprobante_id, formulario_id, categoria, monto, factura_emitida_a, acuerdo_pago, forma_pago)
  VALUES (v_comprobante, v_form3, 'Se Fue Larga', 33880, 'Luzu TV', '45', 'transferencia');

  -- Comprobante 3.2: Iluminación
  INSERT INTO public.comprobantes (
    tipo_movimiento, entidad_nombre, entidad_cuit, neto, iva_alicuota, iva_monto, total, moneda, empresa, estado, estado_pago, created_by
  ) VALUES (
    'egreso', 'Iluminación y Escenografía S.A.', '30801234567',
    32000, 21, 6720, 38720, 'ARS', 'Luzu TV SA', 'activo', 'pendiente', 'system'
  ) RETURNING id INTO v_comprobante;
  INSERT INTO public.programacion_comprobantes (comprobante_id, formulario_id, categoria, monto, factura_emitida_a, acuerdo_pago, forma_pago)
  VALUES (v_comprobante, v_form3, 'La Novela', 38720, 'Luzu TV SA', '30', 'cheque');

  -- Formulario 4: Patria y Familia - Febrero 2024
  INSERT INTO public.programacion_formularios (
    mes_gestion, unidad_negocio, programa, ejecutivo, sub_rubro_empresa, detalle_campana, estado, created_by
  ) VALUES (
    '2024-02', 'Media', 'Patria y Familia', 'Gabriela Riero', 'Entretenimiento', 'Campaña PyF Febrero', 'activo', 'system'
  ) RETURNING id INTO v_form4;

  -- Comprobante 4.1: Contenido digital
  INSERT INTO public.comprobantes (
    tipo_movimiento, entidad_nombre, entidad_cuit, neto, iva_alicuota, iva_monto, total, moneda, empresa, estado, estado_pago, created_by
  ) VALUES (
    'egreso', 'Servicios de Contenido Digital S.A.', '30734567890',
    45000, 21, 9450, 54450, 'ARS', 'Luzu TV', 'activo', 'pendiente', 'system'
  ) RETURNING id INTO v_comprobante;
  INSERT INTO public.programacion_comprobantes (comprobante_id, formulario_id, categoria, monto, factura_emitida_a, acuerdo_pago, forma_pago)
  VALUES (v_comprobante, v_form4, 'Algo Va A Picar', 54450, 'Luzu TV', '30', 'transferencia');

  -- Comprobante 4.2: Logística
  INSERT INTO public.comprobantes (
    tipo_movimiento, entidad_nombre, entidad_cuit, neto, iva_alicuota, iva_monto, total, moneda, empresa, estado, estado_pago, created_by
  ) VALUES (
    'egreso', 'Logística Medios S.R.L.', '30778901234',
    15000, 21, 3150, 18150, 'ARS', 'Luzu TV SA', 'activo', 'pagado', 'system'
  ) RETURNING id INTO v_comprobante;
  INSERT INTO public.programacion_comprobantes (comprobante_id, formulario_id, categoria, monto, factura_emitida_a, acuerdo_pago, forma_pago)
  VALUES (v_comprobante, v_form4, 'Los No Talentos', 18150, 'Luzu TV SA', '5', 'efectivo');
END $$;

-- ============================================
-- 8. COMPROBANTES DE IMPLEMENTACIÓN
-- 6 comprobantes vinculados a órdenes OP-2024-001, OP-2024-003, y OP-2024-005
-- ============================================
DO $$
DECLARE
  v_orden1 uuid; v_orden3 uuid; v_orden5 uuid;
  v_item1 uuid; v_item3 uuid; v_item5 uuid;
  v_programa1 text; v_programa3 text; v_programa5 text;
  v_comprobante uuid;
BEGIN
  -- Buscar orden OP-2024-001 (Coca Cola) y su primer item con programa
  SELECT id INTO v_orden1 FROM public.ordenes_publicidad WHERE orden_publicidad = 'OP-2024-001';
  SELECT id, programa INTO v_item1, v_programa1 FROM public.items_orden_publicidad WHERE orden_publicidad_id = v_orden1 LIMIT 1;

  -- Buscar orden OP-2024-003 (MercadoPago) y su primer item con programa
  SELECT id INTO v_orden3 FROM public.ordenes_publicidad WHERE orden_publicidad = 'OP-2024-003';
  SELECT id, programa INTO v_item3, v_programa3 FROM public.items_orden_publicidad WHERE orden_publicidad_id = v_orden3 LIMIT 1;

  -- Buscar orden OP-2024-005 (Quilmes) y su primer item con programa
  SELECT id INTO v_orden5 FROM public.ordenes_publicidad WHERE orden_publicidad = 'OP-2024-005';
  SELECT id, programa INTO v_item5, v_programa5 FROM public.items_orden_publicidad WHERE orden_publicidad_id = v_orden5 LIMIT 1;

  -- Solo insertar si encontramos las órdenes
  IF v_orden1 IS NOT NULL AND v_item1 IS NOT NULL THEN
    -- Comprobante Impl 1: Producción para Coca Cola (activo, pendiente)
    INSERT INTO public.comprobantes (
      tipo_movimiento, entidad_nombre, entidad_cuit, neto, iva_alicuota, iva_monto, total, moneda,
      empresa, concepto, estado, estado_pago, created_by
    ) VALUES (
      'egreso', 'Producciones Audiovisuales S.A.', '30712345678',
      30000, 21, 6300, 36300, 'ARS',
      'Luzu TV', 'Producción audiovisual campaña Verano 2024',
      'activo', 'pendiente', 'system'
    ) RETURNING id INTO v_comprobante;
    INSERT INTO public.implementacion_comprobantes (
      comprobante_id, orden_publicidad_id, item_orden_publicidad_id,
      factura_emitida_a, sector, rubro_gasto, sub_rubro, condicion_pago, forma_pago
    ) VALUES (
      v_comprobante, v_orden1, v_item1,
      'Luzu TV', v_programa1, 'Gasto de venta', 'Producción', '30', 'transferencia'
    );

    -- Comprobante Impl 2: Media Tech para Coca Cola (activo, pagado)
    INSERT INTO public.comprobantes (
      tipo_movimiento, entidad_nombre, entidad_cuit, neto, iva_alicuota, iva_monto, total, moneda,
      empresa, concepto, estado, estado_pago, created_by
    ) VALUES (
      'egreso', 'Media Tech Argentina S.R.L.', '30723456789',
      20000, 21, 4200, 24200, 'ARS',
      'Luzu TV', 'Servicios técnicos de streaming',
      'activo', 'pagado', 'system'
    ) RETURNING id INTO v_comprobante;
    INSERT INTO public.implementacion_comprobantes (
      comprobante_id, orden_publicidad_id, item_orden_publicidad_id,
      factura_emitida_a, sector, rubro_gasto, sub_rubro, condicion_pago, forma_pago
    ) VALUES (
      v_comprobante, v_orden1, v_item1,
      'Luzu TV SA', v_programa1, 'Gasto de venta', 'Técnico', '30', 'cheque'
    );
  END IF;

  IF v_orden3 IS NOT NULL AND v_item3 IS NOT NULL THEN
    -- Comprobante Impl 3: Talentos para MercadoPago (activo, pendiente)
    INSERT INTO public.comprobantes (
      tipo_movimiento, entidad_nombre, entidad_cuit, neto, iva_alicuota, iva_monto, total, moneda,
      empresa, concepto, estado, estado_pago, created_by
    ) VALUES (
      'egreso', 'Talentos y Producción S.A.', '30745678901',
      45000, 21, 9450, 54450, 'ARS',
      'Luzu TV', 'Talentos para campaña Cashback',
      'activo', 'pendiente', 'system'
    ) RETURNING id INTO v_comprobante;
    INSERT INTO public.implementacion_comprobantes (
      comprobante_id, orden_publicidad_id, item_orden_publicidad_id,
      factura_emitida_a, sector, rubro_gasto, sub_rubro, condicion_pago, forma_pago
    ) VALUES (
      v_comprobante, v_orden3, v_item3,
      'Luzu TV', v_programa3, 'Gasto de venta', 'Talentos', '45', 'transferencia'
    );

    -- Comprobante Impl 4: Equipamiento para MercadoPago (activo, pendiente)
    INSERT INTO public.comprobantes (
      tipo_movimiento, entidad_nombre, entidad_cuit, neto, iva_alicuota, iva_monto, total, moneda,
      empresa, concepto, estado, estado_pago, created_by
    ) VALUES (
      'egreso', 'Equipamiento Técnico S.R.L.', '30756789012',
      25000, 21, 5250, 30250, 'ARS',
      'Luzu TV', 'Equipamiento técnico para grabación',
      'activo', 'pendiente', 'system'
    ) RETURNING id INTO v_comprobante;
    INSERT INTO public.implementacion_comprobantes (
      comprobante_id, orden_publicidad_id, item_orden_publicidad_id,
      factura_emitida_a, sector, rubro_gasto, sub_rubro, condicion_pago, forma_pago
    ) VALUES (
      v_comprobante, v_orden3, v_item3,
      'Luzu TV SA', v_programa3, 'Gasto de venta', 'Equipamiento', '30', 'efectivo'
    );
  END IF;

  IF v_orden5 IS NOT NULL AND v_item5 IS NOT NULL THEN
    -- Comprobante Impl 5: Estudio Creativo para Quilmes (activo, pendiente)
    INSERT INTO public.comprobantes (
      tipo_movimiento, entidad_nombre, entidad_cuit, neto, iva_alicuota, iva_monto, total, moneda,
      empresa, concepto, estado, estado_pago, created_by
    ) VALUES (
      'egreso', 'Estudio Creativo Buenos Aires S.A.', '30767890123',
      38000, 21, 7980, 45980, 'ARS',
      'Luzu TV', 'Diseño creativo campaña Amigos',
      'activo', 'pendiente', 'system'
    ) RETURNING id INTO v_comprobante;
    INSERT INTO public.implementacion_comprobantes (
      comprobante_id, orden_publicidad_id, item_orden_publicidad_id,
      factura_emitida_a, sector, rubro_gasto, sub_rubro, condicion_pago, forma_pago
    ) VALUES (
      v_comprobante, v_orden5, v_item5,
      'Luzu TV', v_programa5, 'Gasto de venta', 'Creatividad', '30', 'transferencia'
    );

    -- Comprobante Impl 6: Post Producción para Quilmes (activo, pagado)
    INSERT INTO public.comprobantes (
      tipo_movimiento, entidad_nombre, entidad_cuit, neto, iva_alicuota, iva_monto, total, moneda,
      empresa, concepto, estado, estado_pago, created_by
    ) VALUES (
      'egreso', 'Post Producción Argentina S.A.', '30789012345',
      22000, 21, 4620, 26620, 'ARS',
      'Luzu TV', 'Post producción spots publicitarios',
      'activo', 'pagado', 'system'
    ) RETURNING id INTO v_comprobante;
    INSERT INTO public.implementacion_comprobantes (
      comprobante_id, orden_publicidad_id, item_orden_publicidad_id,
      factura_emitida_a, sector, rubro_gasto, sub_rubro, condicion_pago, forma_pago
    ) VALUES (
      v_comprobante, v_orden5, v_item5,
      'Luzu TV SA', v_programa5, 'Gasto de venta', 'Post Producción', '45', 'cheque'
    );
  END IF;
END $$;

-- ============================================
-- 9. COMPROBANTES DE EXPERIENCE
-- 4 formularios con 2 comprobantes cada uno = 8 comprobantes totales
-- ============================================
DO $$
DECLARE
  v_form1 uuid; v_form2 uuid; v_form3 uuid; v_form4 uuid;
  v_comprobante uuid;
  v_user_email text;
BEGIN
  -- Get first user email for created_by
  SELECT email INTO v_user_email FROM public.usuarios ORDER BY fecha_creacion LIMIT 1;
  IF v_user_email IS NULL THEN
    v_user_email := 'gaby@luzutv.com.ar';
  END IF;

  -- Formulario 1: Campaña Experiencia Verano - Enero 2024
  INSERT INTO public.experience_formularios (
    mes_gestion, nombre_campana, detalle_campana, subrubro, estado, created_by
  ) VALUES (
    '2024-01', 'Experiencia Verano Luzu', 'Activaciones en playas y eventos de verano', 'produccion', 'activo', v_user_email
  ) RETURNING id INTO v_form1;

  -- Comprobante 1.1: Producción evento playa
  INSERT INTO public.comprobantes (
    tipo_movimiento, entidad_nombre, entidad_cuit, tipo_comprobante, punto_venta, numero_comprobante, fecha_comprobante,
    neto, iva_alicuota, iva_monto, total, moneda, estado, estado_pago, created_by
  ) VALUES (
    'egreso', 'Producciones Audiovisuales S.A.', '30712345678',
    'FA', '0001', '00001234', '2024-01-10',
    40000, 21, 8400, 48400, 'ARS', 'activo', 'pendiente', v_user_email
  ) RETURNING id INTO v_comprobante;
  INSERT INTO public.experience_comprobantes (
    comprobante_id, formulario_id, factura_emitida_a, empresa, empresa_programa,
    fecha_comprobante, acuerdo_pago, forma_pago, pais
  ) VALUES (
    v_comprobante, v_form1, 'Luzu TV', 'Luzu TV', 'nadie-dice-nada',
    '2024-01-10', '30', 'transferencia', 'argentina'
  );

  -- Comprobante 1.2: Catering evento
  INSERT INTO public.comprobantes (
    tipo_movimiento, entidad_nombre, entidad_cuit, tipo_comprobante, punto_venta, numero_comprobante, fecha_comprobante,
    neto, iva_alicuota, iva_monto, total, moneda, estado, estado_pago, created_by
  ) VALUES (
    'egreso', 'Logística Medios S.R.L.', '30778901234',
    'FA', '0001', '00005678', '2024-01-12',
    15000, 21, 3150, 18150, 'ARS', 'activo', 'pagado', v_user_email
  ) RETURNING id INTO v_comprobante;
  INSERT INTO public.experience_comprobantes (
    comprobante_id, formulario_id, factura_emitida_a, empresa, empresa_programa,
    fecha_comprobante, acuerdo_pago, forma_pago, pais
  ) VALUES (
    v_comprobante, v_form1, 'Luzu TV SA', 'Luzu TV SA', 'fm-luzu',
    '2024-01-12', '5', 'transferencia', 'argentina'
  );

  -- Formulario 2: Campaña Lanzamiento Producto - Febrero 2024
  INSERT INTO public.experience_formularios (
    mes_gestion, nombre_campana, detalle_campana, subrubro, estado, created_by
  ) VALUES (
    '2024-02', 'Lanzamiento Sponsor Tech', 'Evento de lanzamiento de producto tecnológico', 'diseno', 'activo', v_user_email
  ) RETURNING id INTO v_form2;

  -- Comprobante 2.1: Escenografía
  INSERT INTO public.comprobantes (
    tipo_movimiento, entidad_nombre, entidad_cuit, tipo_comprobante, punto_venta, numero_comprobante, fecha_comprobante,
    neto, iva_alicuota, iva_monto, total, moneda, estado, estado_pago, created_by
  ) VALUES (
    'egreso', 'Iluminación y Escenografía S.A.', '30801234567',
    'FA', '0002', '00001111', '2024-02-05',
    55000, 21, 11550, 66550, 'ARS', 'activo', 'pendiente', v_user_email
  ) RETURNING id INTO v_comprobante;
  INSERT INTO public.experience_comprobantes (
    comprobante_id, formulario_id, factura_emitida_a, empresa, empresa_programa,
    fecha_comprobante, acuerdo_pago, forma_pago, pais
  ) VALUES (
    v_comprobante, v_form2, 'Luzu TV', 'Luzu TV', 'antes-que-nadie',
    '2024-02-05', '45', 'cheque', 'argentina'
  );

  -- Comprobante 2.2: Equipamiento técnico
  INSERT INTO public.comprobantes (
    tipo_movimiento, entidad_nombre, entidad_cuit, tipo_comprobante, punto_venta, numero_comprobante, fecha_comprobante,
    neto, iva_alicuota, iva_monto, total, moneda, estado, estado_pago, created_by
  ) VALUES (
    'egreso', 'Equipamiento Técnico S.R.L.', '30756789012',
    'FA', '0002', '00002222', '2024-02-08',
    35000, 21, 7350, 42350, 'ARS', 'activo', 'pagado', v_user_email
  ) RETURNING id INTO v_comprobante;
  INSERT INTO public.experience_comprobantes (
    comprobante_id, formulario_id, factura_emitida_a, empresa, empresa_programa,
    fecha_comprobante, acuerdo_pago, forma_pago, pais
  ) VALUES (
    v_comprobante, v_form2, 'Luzu TV SA', 'Luzu TV SA', 'vuelta-y-media',
    '2024-02-08', '30', 'transferencia', 'argentina'
  );

  -- Formulario 3: Campaña Feria del Libro - Marzo 2024
  INSERT INTO public.experience_formularios (
    mes_gestion, nombre_campana, detalle_campana, subrubro, estado, created_by
  ) VALUES (
    '2024-03', 'Stand Feria del Libro', 'Presencia en Feria del Libro Buenos Aires', 'tecnica', 'activo', v_user_email
  ) RETURNING id INTO v_form3;

  -- Comprobante 3.1: Construcción stand
  INSERT INTO public.comprobantes (
    tipo_movimiento, entidad_nombre, entidad_cuit, tipo_comprobante, punto_venta, numero_comprobante, fecha_comprobante,
    neto, iva_alicuota, iva_monto, total, moneda, estado, estado_pago, created_by
  ) VALUES (
    'egreso', 'Estudio Creativo Buenos Aires S.A.', '30767890123',
    'FA', '0003', '00003333', '2024-03-01',
    70000, 21, 14700, 84700, 'ARS', 'activo', 'pendiente', v_user_email
  ) RETURNING id INTO v_comprobante;
  INSERT INTO public.experience_comprobantes (
    comprobante_id, formulario_id, factura_emitida_a, empresa, empresa_programa,
    fecha_comprobante, acuerdo_pago, forma_pago, pais
  ) VALUES (
    v_comprobante, v_form3, 'Luzu TV', 'Luzu TV', 'seria-increible',
    '2024-03-01', '60', 'transferencia', 'argentina'
  );

  -- Comprobante 3.2: Personal para stand
  INSERT INTO public.comprobantes (
    tipo_movimiento, entidad_nombre, entidad_cuit, tipo_comprobante, punto_venta, numero_comprobante, fecha_comprobante,
    neto, iva_alicuota, iva_monto, total, moneda, empresa, estado, estado_pago, created_by
  ) VALUES (
    'egreso', 'Talentos y Producción S.A.', '30745678901',
    'FA', '0003', '00004444', '2024-03-05',
    28000, 21, 5880, 33880, 'ARS', 'Luzu TV SA', 'activo', 'pendiente', v_user_email
  ) RETURNING id INTO v_comprobante;
  INSERT INTO public.experience_comprobantes (
    comprobante_id, formulario_id, factura_emitida_a, empresa, empresa_programa,
    fecha_comprobante, acuerdo_pago, forma_pago, pais
  ) VALUES (
    v_comprobante, v_form3, 'Luzu TV SA', 'Luzu TV SA', 'patria-y-familia',
    '2024-03-05', '30', 'efectivo', 'argentina'
  );

  -- Formulario 4: Campaña Evento Deportivo - Marzo 2024
  INSERT INTO public.experience_formularios (
    mes_gestion, nombre_campana, detalle_campana, subrubro, estado, created_by
  ) VALUES (
    '2024-03', 'Activación Maratón BA', 'Activación en Maratón de Buenos Aires', 'edicion', 'activo', v_user_email
  ) RETURNING id INTO v_form4;

  -- Comprobante 4.1: Producción móvil
  INSERT INTO public.comprobantes (
    tipo_movimiento, entidad_nombre, entidad_cuit, tipo_comprobante, punto_venta, numero_comprobante, fecha_comprobante,
    neto, iva_alicuota, iva_monto, total, moneda, estado, estado_pago, created_by
  ) VALUES (
    'egreso', 'Media Tech Argentina S.R.L.', '30723456789',
    'FA', '0004', '00005555', '2024-03-15',
    45000, 21, 9450, 54450, 'ARS', 'activo', 'pendiente', v_user_email
  ) RETURNING id INTO v_comprobante;
  INSERT INTO public.experience_comprobantes (
    comprobante_id, formulario_id, factura_emitida_a, empresa, empresa_programa,
    fecha_comprobante, acuerdo_pago, forma_pago, pais
  ) VALUES (
    v_comprobante, v_form4, 'Luzu TV', 'Luzu TV', 'podremos-hablar',
    '2024-03-15', '30', 'transferencia', 'argentina'
  );

  -- Comprobante 4.2: Sonido para evento
  INSERT INTO public.comprobantes (
    tipo_movimiento, entidad_nombre, entidad_cuit, tipo_comprobante, punto_venta, numero_comprobante, fecha_comprobante,
    neto, iva_alicuota, iva_monto, total, moneda, estado, estado_pago, created_by
  ) VALUES (
    'egreso', 'Sonido Profesional S.R.L.', '30790123456',
    'FA', '0004', '00006666', '2024-03-18',
    22000, 21, 4620, 26620, 'ARS', 'activo', 'pagado', v_user_email
  ) RETURNING id INTO v_comprobante;
  INSERT INTO public.experience_comprobantes (
    comprobante_id, formulario_id, factura_emitida_a, empresa, empresa_programa,
    fecha_comprobante, acuerdo_pago, forma_pago, pais
  ) VALUES (
    v_comprobante, v_form4, 'Luzu TV SA', 'Luzu TV SA', 'optimo',
    '2024-03-18', '5', 'cheque', 'argentina'
  );
END $$;

-- ============================================
-- VERIFICATION QUERIES (run after seeding)
-- ============================================
-- Uncomment and run these queries to verify seed data:

-- Verificar entidades (should be >= 10)
-- SELECT COUNT(*) AS entidades_count FROM entidades;

-- Verificar órdenes de publicidad (should be >= 6)
-- SELECT COUNT(*) AS ordenes_count FROM ordenes_publicidad;
-- SELECT COUNT(*) AS items_count FROM items_orden_publicidad;

-- Verificar comprobantes programación (should be >= 4 forms, >= 8 comprobantes)
-- SELECT COUNT(*) AS formularios_count FROM programacion_formularios;
-- SELECT COUNT(*) AS prog_comprobantes_count FROM programacion_comprobantes;

-- Verificar comprobantes implementación (should be >= 6)
-- SELECT COUNT(*) AS impl_comprobantes_count FROM implementacion_comprobantes;

-- Verificar tabla base comprobantes (should be >= 22: 8 prog + 6 impl + 8 exp)
-- SELECT COUNT(*) AS comprobantes_total FROM comprobantes;

-- Verificar vista unificada
-- SELECT tipo_gasto, COUNT(*) FROM comprobantes_full GROUP BY tipo_gasto;

-- Verificar vista legacy gastos funciona
-- SELECT COUNT(*) FROM gastos;
-- SELECT COUNT(*) FROM proveedores;
