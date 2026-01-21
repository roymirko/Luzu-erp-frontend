-- ============================================
-- SEED DATA
-- ============================================

-- 1. ROLES
-- We use static UUIDs or let them generate, but for foreign keys in seed, variables or returning clauses are needed.
-- Since this is a raw SQL script for the SQL editor, we will try to use DO block or specific static IDs if possible, 
-- but `uuid_generate_v4()` is random. 
-- STRATEGY: We will insert and assume the names are unique, then look them up for relations.

-- Insert Roles
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
-- 5. PROVEEDORES (10 vendors)
-- ============================================
INSERT INTO public.proveedores (razon_social, cuit, empresa, direccion, activo, creado_por)
VALUES
  ('Producciones Audiovisuales S.A.', '30712345678', 'Producciones Audiovisuales', 'Av. Corrientes 1234, CABA', true, 'system'),
  ('Media Tech Argentina S.R.L.', '30723456789', 'Media Tech', 'Av. del Libertador 5678, CABA', true, 'system'),
  ('Servicios de Contenido Digital S.A.', '30734567890', 'Contenido Digital', 'Av. Santa Fe 910, CABA', true, 'system'),
  ('Talentos y Producción S.A.', '30745678901', 'Talentos', 'Av. Cabildo 1112, CABA', true, 'system'),
  ('Equipamiento Técnico S.R.L.', '30756789012', 'Equipamiento', 'Av. Belgrano 1314, CABA', true, 'system'),
  ('Estudio Creativo Buenos Aires S.A.', '30767890123', 'Estudio Creativo', 'Av. Rivadavia 2000, CABA', true, 'system'),
  ('Logística Medios S.R.L.', '30778901234', 'Logística Medios', 'Av. Callao 500, CABA', true, 'system'),
  ('Post Producción Argentina S.A.', '30789012345', 'Post Producción', 'Av. Córdoba 3000, CABA', true, 'system'),
  ('Sonido Profesional S.R.L.', '30790123456', 'Sonido Pro', 'Av. Pueyrredón 800, CABA', true, 'system'),
  ('Iluminación y Escenografía S.A.', '30801234567', 'Iluminación', 'Av. Las Heras 1500, CABA', true, 'system')
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
-- 7. GASTOS DE PROGRAMACIÓN (Unified Architecture)
-- 4 formularios con 2 gastos cada uno = 8 gastos totales
-- ============================================
DO $$
DECLARE
  v_form1 uuid; v_form2 uuid; v_form3 uuid; v_form4 uuid;
  v_gasto uuid;
BEGIN
  -- Formulario 1: Nadie Dice Nada - Enero 2024
  INSERT INTO public.programacion_formularios (
    mes_gestion, unidad_negocio, programa, ejecutivo, estado, created_by
  ) VALUES (
    '2024-01', 'Media', 'Nadie Dice Nada', 'Gabriela Riero', 'activo', 'system'
  ) RETURNING id INTO v_form1;

  -- Gasto 1.1: Producción general
  INSERT INTO public.gastos (
    proveedor, razon_social, neto, iva, importe_total, moneda, estado, estado_pago, created_by
  ) VALUES (
    'Producciones Audiovisuales S.A.', 'Producciones Audiovisuales S.A.',
    25000, 21, 30250, 'ARS', 'activo', 'pendiente', 'system'
  ) RETURNING id INTO v_gasto;
  INSERT INTO public.programacion_gastos (gasto_id, formulario_id, categoria, monto)
  VALUES (v_gasto, v_form1, 'Producción', 30250);

  -- Gasto 1.2: Equipamiento técnico
  INSERT INTO public.gastos (
    proveedor, razon_social, neto, iva, importe_total, moneda, estado, estado_pago, created_by
  ) VALUES (
    'Equipamiento Técnico S.R.L.', 'Equipamiento Técnico S.R.L.',
    18000, 21, 21780, 'ARS', 'activo', 'pagado', 'system'
  ) RETURNING id INTO v_gasto;
  INSERT INTO public.programacion_gastos (gasto_id, formulario_id, categoria, monto)
  VALUES (v_gasto, v_form1, 'Técnico', 21780);

  -- Formulario 2: Antes Que Nadie - Enero 2024
  INSERT INTO public.programacion_formularios (
    mes_gestion, unidad_negocio, programa, ejecutivo, estado, created_by
  ) VALUES (
    '2024-01', 'Media', 'Antes Que Nadie', 'Gabriela Riero', 'activo', 'system'
  ) RETURNING id INTO v_form2;

  -- Gasto 2.1: Talentos
  INSERT INTO public.gastos (
    proveedor, razon_social, neto, iva, importe_total, moneda, estado, estado_pago, created_by
  ) VALUES (
    'Talentos y Producción S.A.', 'Talentos y Producción S.A.',
    35000, 21, 42350, 'ARS', 'activo', 'pendiente', 'system'
  ) RETURNING id INTO v_gasto;
  INSERT INTO public.programacion_gastos (gasto_id, formulario_id, categoria, monto)
  VALUES (v_gasto, v_form2, 'Talentos', 42350);

  -- Gasto 2.2: Post producción
  INSERT INTO public.gastos (
    proveedor, razon_social, neto, iva, importe_total, moneda, estado, estado_pago, created_by
  ) VALUES (
    'Post Producción Argentina S.A.', 'Post Producción Argentina S.A.',
    22000, 21, 26620, 'ARS', 'activo', 'pagado', 'system'
  ) RETURNING id INTO v_gasto;
  INSERT INTO public.programacion_gastos (gasto_id, formulario_id, categoria, monto)
  VALUES (v_gasto, v_form2, 'Post Producción', 26620);

  -- Formulario 3: Se Fue Larga - Febrero 2024
  INSERT INTO public.programacion_formularios (
    mes_gestion, unidad_negocio, programa, ejecutivo, estado, created_by
  ) VALUES (
    '2024-02', 'Media', 'Se Fue Larga', 'Gabriela Riero', 'activo', 'system'
  ) RETURNING id INTO v_form3;

  -- Gasto 3.1: Sonido
  INSERT INTO public.gastos (
    proveedor, razon_social, neto, iva, importe_total, moneda, estado, estado_pago, created_by
  ) VALUES (
    'Sonido Profesional S.R.L.', 'Sonido Profesional S.R.L.',
    28000, 21, 33880, 'ARS', 'activo', 'pendiente', 'system'
  ) RETURNING id INTO v_gasto;
  INSERT INTO public.programacion_gastos (gasto_id, formulario_id, categoria, monto)
  VALUES (v_gasto, v_form3, 'Sonido', 33880);

  -- Gasto 3.2: Iluminación
  INSERT INTO public.gastos (
    proveedor, razon_social, neto, iva, importe_total, moneda, estado, estado_pago, created_by
  ) VALUES (
    'Iluminación y Escenografía S.A.', 'Iluminación y Escenografía S.A.',
    32000, 21, 38720, 'ARS', 'activo', 'parcial', 'system'
  ) RETURNING id INTO v_gasto;
  INSERT INTO public.programacion_gastos (gasto_id, formulario_id, categoria, monto)
  VALUES (v_gasto, v_form3, 'Escenografía', 38720);

  -- Formulario 4: Patria y Familia - Febrero 2024
  INSERT INTO public.programacion_formularios (
    mes_gestion, unidad_negocio, programa, ejecutivo, estado, created_by
  ) VALUES (
    '2024-02', 'Media', 'Patria y Familia', 'Gabriela Riero', 'activo', 'system'
  ) RETURNING id INTO v_form4;

  -- Gasto 4.1: Contenido digital
  INSERT INTO public.gastos (
    proveedor, razon_social, neto, iva, importe_total, moneda, estado, estado_pago, created_by
  ) VALUES (
    'Servicios de Contenido Digital S.A.', 'Servicios de Contenido Digital S.A.',
    45000, 21, 54450, 'ARS', 'activo', 'pendiente', 'system'
  ) RETURNING id INTO v_gasto;
  INSERT INTO public.programacion_gastos (gasto_id, formulario_id, categoria, monto)
  VALUES (v_gasto, v_form4, 'Contenido Digital', 54450);

  -- Gasto 4.2: Logística
  INSERT INTO public.gastos (
    proveedor, razon_social, neto, iva, importe_total, moneda, estado, estado_pago, created_by
  ) VALUES (
    'Logística Medios S.R.L.', 'Logística Medios S.R.L.',
    15000, 21, 18150, 'ARS', 'activo', 'pagado', 'system'
  ) RETURNING id INTO v_gasto;
  INSERT INTO public.programacion_gastos (gasto_id, formulario_id, categoria, monto)
  VALUES (v_gasto, v_form4, 'Logística', 18150);
END $$;

-- ============================================
-- 8. GASTOS DE IMPLEMENTACIÓN (Unified Architecture)
-- 6 gastos vinculados a órdenes OP-2024-001, OP-2024-003, y OP-2024-005
-- factura_emitida_a debe ser 'Luzu TV' o 'Luzu TV SA' (valores del dropdown)
-- sector debe ser el nombre del programa (ej: 'Nadie Dice Nada')
-- ============================================
DO $$
DECLARE
  v_orden1 uuid; v_orden3 uuid; v_orden5 uuid;
  v_item1 uuid; v_item3 uuid; v_item5 uuid;
  v_programa1 text; v_programa3 text; v_programa5 text;
  v_gasto uuid;
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
    -- Gasto Impl 1: Producción para Coca Cola (pendiente)
    INSERT INTO public.gastos (
      proveedor, razon_social, neto, iva, importe_total, moneda,
      empresa, concepto_gasto, estado, estado_pago, created_by
    ) VALUES (
      'Producciones Audiovisuales S.A.', 'Producciones Audiovisuales S.A.',
      30000, 21, 36300, 'ARS',
      'Luzu TV', 'Producción audiovisual campaña Verano 2024',
      'pendiente', 'pendiente', 'system'
    ) RETURNING id INTO v_gasto;
    INSERT INTO public.implementacion_gastos (
      gasto_id, orden_publicidad_id, item_orden_publicidad_id,
      factura_emitida_a, sector, rubro_gasto, sub_rubro, condicion_pago
    ) VALUES (
      v_gasto, v_orden1, v_item1,
      'Luzu TV', v_programa1, 'Gasto de venta', 'Producción', '30'
    );

    -- Gasto Impl 2: Media Tech para Coca Cola (activo, pagado)
    INSERT INTO public.gastos (
      proveedor, razon_social, neto, iva, importe_total, moneda,
      empresa, concepto_gasto, estado, estado_pago, created_by
    ) VALUES (
      'Media Tech Argentina S.R.L.', 'Media Tech Argentina S.R.L.',
      20000, 21, 24200, 'ARS',
      'Luzu TV', 'Servicios técnicos de streaming',
      'activo', 'pagado', 'system'
    ) RETURNING id INTO v_gasto;
    INSERT INTO public.implementacion_gastos (
      gasto_id, orden_publicidad_id, item_orden_publicidad_id,
      factura_emitida_a, sector, rubro_gasto, sub_rubro, condicion_pago
    ) VALUES (
      v_gasto, v_orden1, v_item1,
      'Luzu TV SA', v_programa1, 'Gasto de venta', 'Técnico', '30'
    );
  END IF;

  IF v_orden3 IS NOT NULL AND v_item3 IS NOT NULL THEN
    -- Gasto Impl 3: Talentos para MercadoPago (activo, pendiente)
    INSERT INTO public.gastos (
      proveedor, razon_social, neto, iva, importe_total, moneda,
      empresa, concepto_gasto, estado, estado_pago, created_by
    ) VALUES (
      'Talentos y Producción S.A.', 'Talentos y Producción S.A.',
      45000, 21, 54450, 'ARS',
      'Luzu TV', 'Talentos para campaña Cashback',
      'activo', 'pendiente', 'system'
    ) RETURNING id INTO v_gasto;
    INSERT INTO public.implementacion_gastos (
      gasto_id, orden_publicidad_id, item_orden_publicidad_id,
      factura_emitida_a, sector, rubro_gasto, sub_rubro, condicion_pago
    ) VALUES (
      v_gasto, v_orden3, v_item3,
      'Luzu TV', v_programa3, 'Gasto de venta', 'Talentos', '45'
    );

    -- Gasto Impl 4: Equipamiento para MercadoPago (activo, pendiente)
    INSERT INTO public.gastos (
      proveedor, razon_social, neto, iva, importe_total, moneda,
      empresa, concepto_gasto, estado, estado_pago, created_by
    ) VALUES (
      'Equipamiento Técnico S.R.L.', 'Equipamiento Técnico S.R.L.',
      25000, 21, 30250, 'ARS',
      'Luzu TV', 'Equipamiento técnico para grabación',
      'activo', 'pendiente', 'system'
    ) RETURNING id INTO v_gasto;
    INSERT INTO public.implementacion_gastos (
      gasto_id, orden_publicidad_id, item_orden_publicidad_id,
      factura_emitida_a, sector, rubro_gasto, sub_rubro, condicion_pago
    ) VALUES (
      v_gasto, v_orden3, v_item3,
      'Luzu TV SA', v_programa3, 'Gasto de venta', 'Equipamiento', '30'
    );
  END IF;

  IF v_orden5 IS NOT NULL AND v_item5 IS NOT NULL THEN
    -- Gasto Impl 5: Estudio Creativo para Quilmes (pendiente)
    INSERT INTO public.gastos (
      proveedor, razon_social, neto, iva, importe_total, moneda,
      empresa, concepto_gasto, estado, estado_pago, created_by
    ) VALUES (
      'Estudio Creativo Buenos Aires S.A.', 'Estudio Creativo Buenos Aires S.A.',
      38000, 21, 45980, 'ARS',
      'Luzu TV', 'Diseño creativo campaña Amigos',
      'pendiente', 'pendiente', 'system'
    ) RETURNING id INTO v_gasto;
    INSERT INTO public.implementacion_gastos (
      gasto_id, orden_publicidad_id, item_orden_publicidad_id,
      factura_emitida_a, sector, rubro_gasto, sub_rubro, condicion_pago
    ) VALUES (
      v_gasto, v_orden5, v_item5,
      'Luzu TV', v_programa5, 'Gasto de venta', 'Creatividad', '30'
    );

    -- Gasto Impl 6: Post Producción para Quilmes (activo, pagado)
    INSERT INTO public.gastos (
      proveedor, razon_social, neto, iva, importe_total, moneda,
      empresa, concepto_gasto, estado, estado_pago, created_by
    ) VALUES (
      'Post Producción Argentina S.A.', 'Post Producción Argentina S.A.',
      22000, 21, 26620, 'ARS',
      'Luzu TV', 'Post producción spots publicitarios',
      'activo', 'pagado', 'system'
    ) RETURNING id INTO v_gasto;
    INSERT INTO public.implementacion_gastos (
      gasto_id, orden_publicidad_id, item_orden_publicidad_id,
      factura_emitida_a, sector, rubro_gasto, sub_rubro, condicion_pago
    ) VALUES (
      v_gasto, v_orden5, v_item5,
      'Luzu TV SA', v_programa5, 'Gasto de venta', 'Post Producción', '45'
    );
  END IF;
END $$;

-- ============================================
-- VERIFICATION QUERIES (run after seeding)
-- ============================================
-- Uncomment and run these queries to verify seed data:

-- Verificar proveedores (should be >= 10)
-- SELECT COUNT(*) AS proveedores_count FROM proveedores;

-- Verificar órdenes de publicidad (should be >= 6)
-- SELECT COUNT(*) AS ordenes_count FROM ordenes_publicidad;
-- SELECT COUNT(*) AS items_count FROM items_orden_publicidad;

-- Verificar gastos programación - unified (should be >= 4 forms, >= 8 gastos)
-- SELECT COUNT(*) AS formularios_count FROM programacion_formularios;
-- SELECT COUNT(*) AS prog_gastos_count FROM programacion_gastos;

-- Verificar gastos implementación - unified (should be >= 6)
-- SELECT COUNT(*) AS impl_gastos_count FROM implementacion_gastos;

-- Verificar tabla base gastos (should be >= 14: 8 prog + 6 impl)
-- SELECT COUNT(*) AS gastos_total FROM gastos;

-- Verificar vista unificada
-- SELECT tipo_gasto, COUNT(*) FROM gastos_full GROUP BY tipo_gasto;

-- Verificar detalle programación usando la vista
-- SELECT programa, mes_gestion, proveedor, importe_total, estado, estado_pago
-- FROM programacion_gastos_full
-- ORDER BY created_at DESC;

-- Verificar detalle implementación usando la vista
-- SELECT orden_publicidad, nombre_campana, proveedor, neto, importe_total,
--        empresa, concepto_gasto, estado, estado_pago, factura_emitida_a
-- FROM implementacion_gastos_full
-- ORDER BY created_at DESC;

-- Verificar gastos por orden de publicidad
-- SELECT orden_publicidad, COUNT(*) as total_gastos, SUM(neto) as total_neto
-- FROM implementacion_gastos_full
-- GROUP BY orden_publicidad;

-- Verificar estados de gastos
-- SELECT estado, estado_pago, COUNT(*)
-- FROM gastos
-- GROUP BY estado, estado_pago;
