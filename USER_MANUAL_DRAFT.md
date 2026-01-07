# Manual de Usuario - ERP Luzu TV

## 1. Introducción
Bienvenido al ERP de Luzu TV. Este sistema está diseñado para la gestión integral de operaciones comerciales, programación e implementación. Este manual le guiará a través de las funcionalidades principales y le ayudará a comprender las reglas de negocio y flujos de trabajo.

## 2. Acceso y Seguridad (Login)
Para ingresar al sistema, diríjase a la pantalla de inicio de sesión.
El sistema admite dos métodos de autenticación:
1.  **Google Login (Recomendado):** Haga clic en "Use another account" y seleccione su cuenta corporativa de Google (`@luzutv.com.ar`).
2.  **Acceso Directo (Demo/Admin):** Puede seleccionar un perfil existente (ej. Gabriela Rivero) si está habilitado en su entorno.

> [!NOTE]
> Si no está autenticado, será redirigido automáticamente a la pantalla de Login.

## 3. Navegación Principal
Una vez dentro, verá la interfaz principal dividida en dos secciones:

### Barra Lateral (Sidebar)
Ubicada a la izquierda (en escritorio, colapsada por defecto en móvil), permite navegar entre módulos:
-   **Comercial:** Gestión de órdenes de publicidad y propuestas.
-   **Implementación:** (En desarrollo) Gestión de la puesta en marcha de campañas.
-   **Dir. de Programación:** (En desarrollo) Visualización y gestión de la parrilla de programación.
-   **Backoffice:** Configuración avanzada (solo usuarios habilitados).

### Dashboard (Inicio)
Es la pantalla por defecto al ingresar. Muestra métricas clave:
-   **Presupuesto Mensual:** Comparativa con el mes anterior.
-   **Ventas del Período:** Total acumulado de ventas.
-   **Audiencia Promedio:** Tendencias de audiencia.
-   **Bandeja de Entrada:** Tareas pendientes y órdenes por revisar.
-   **Programación de Hoy:** Eventos 'En Vivo' y próximos programas.

## 4. Módulo Comercial (Gestión de Órdenes)

### 4.1. Crear una Nueva Orden
1.  En el menú lateral, seleccione **"Comercial"**.
2.  Haga clic en el botón **"Nuevo Formulario"** (icono de maletín).
3.  Se abrirá el **Formulario Inteligente**.

### 4.2. Llenado del Formulario Inteligente
El formulario valida automáticamente muchas reglas de negocio para evitar errores. A continuación se detallan los campos:

#### Datos Básicos
-   **Orden de Publicidad:** Identificador único de la orden (Obligatorio).
-   **Total de Venta:** Monto total acordado.
-   **Mes de Servicio:** Año y Mes de la campaña. (Al crear, solo permite meses actuales o futuros).
-   **Unidad de Negocio:** Define el tipo de venta (Media, Experience, etc.).
-   **Categoría de Negocio:** Se habilita según la Unidad de Negocio elegida.
-   **Proyecto:** Se habilita solo para ciertas unidades.
-   **Cliente/Marca:** Razón Social, Empresa, Categoría y Marca (Obligatorios).

#### Carga de Importes (Programas)
Aquí desglosa el "Total de Venta" entre los diferentes programas y conceptos.
-   **Programa:** Seleccione el programa (ej. "Nadie Dice Nada").
-   **Monto:** Importe asignado a ese programa.
-   **Desglose:** Puede especificar porcentajes para NC (Nota Crédito), Fee, Implementación, Talentos y Técnica.

> [!IMPORTANT]
> **Validaciones Críticas:**
> *   **Control de Presupuesto:** El sistema le alertará si la suma de los programas supera el "Total de Venta".
> *   **Duplicados:** No puede agregar el mismo programa dos veces en una misma orden.
> *   **Campos Condicionales:** Si cambia la Unidad de Negocio, los campos dependientes se limpiarán automáticamente.

### 4.3. Guardado
Para guardar, haga clic en el botón de confirmación. El sistema verificará que todos los campos obligatorios estén completos y que los montos cuadren.

### 4.4. Edición
Desde la vista "Comercial", puede ver una tabla con los formularios existentes. Haga clic en el icono de "Lápiz" para editar un formulario. En modo edición, se permite seleccionar fechas históricas (años anteriores).

## 5. Perfil de Usuario
En la esquina superior derecha, encontrará su menú de usuario.
-   Haga clic en su avatar/nombre para ver opciones.
-   **Perfil:** Permite actualizar su foto, nombre y rol dentro de la empresa.
-   **Cerrar Sesión:** Sale del sistema de forma segura.

## 6. Reglas de Negocio y Lógica
Aspectos importantes que el sistema controla automáticamente:
-   **Unicidad de Datos:** No se pueden repetir códigos de áreas ni emails de usuarios.
-   **Integridad:** No se puede eliminar al último administrador del sistema.
-   **Auditoría:** Todas las acciones críticas (crear, editar, borrar) quedan registradas en un log de auditoría.
-   **Calculos de Utilidad:** El sistema calcula automáticamente la Utilidad del Proyecto restando Fees, Notas de Crédito y Gastos al Total de Venta.

## 7. Backoffice y Administración
El módulo de Backoffice es exclusivo para usuarios con permisos elevados (Administradores/Editores) y permite gestionar la configuración vital del sistema.

### 7.1. Gestión de Campos y Opciones
Permite mantener actualizados los listados desplegables del sistema sin necesidad de modificar código.
1.  **Seleccionar Área:** Elija el módulo (ej. "Comercial").
2.  **Seleccionar Campo:** Elija el campo a editar (ej. "Unidad de Negocio" o "Proyecto").
3.  **Agregar Opción:** Escriba el nombre de la nueva opción y haga clic en "Agregar".
4.  **Desactivar/Eliminar:** Puede ocultar opciones obsoletas para que ya no aparezcan en nuevos formularios, o eliminarlas si no fueron usadas.

### 7.2. Áreas y Departamentos
Gestión de la estructura organizacional.
-   **Nueva Área:** Permite crear un área definiendo su Código (único) y Nombre.
-   **Estado:** Las áreas pueden desactivarse, lo que oculta sus opciones asociadas en el resto del sistema.
-   **Lógica:** Al eliminar un área, se eliminan sus asignaciones de roles pero los usuarios permanecen en el sistema.

### 7.3. Gestión de Usuarios
Control total sobre el acceso al sistema.
-   **Nuevo Usuario:** Requiere Nombre, Email y Rol inicial. El email debe ser único.
-   **Roles:**
    *   **Administrador:** Acceso total (CRUD usuarios, áreas, logs).
    *   **Editor:** Gestión de formularios y tareas, pero solo lectura en usuarios.
    *   **Visualizador:** Solo lectura general.
-   **Bloqueo:** Puede desactivar el acceso de un usuario sin eliminar su historial de acciones.

### 7.4. Auditoría (Logs)
El sistema registra automáticamente acciones sensibles como creación de usuarios o eliminación de registros. Estos logs son inmutables y sirven para trazabilidad.

## 8. Preguntas Frecuentes (FAQ)

**P: ¿Por qué no puedo seleccionar un mes pasado al crear una orden?**
R: Por regla de negocio, las nuevas órdenes deben ser para el mes en curso o futuro. Si necesita cargar un histórico, debe contactar a un administrador o usar un flujo de migración.

**P: ¿Qué hago si la suma de mis programas no coincide con el Total de Venta?**
R: El sistema no le permitirá guardar si hay discrepancias. Ajuste los montos de los programas o corrija el Total de Venta inicial.

**P: ¿Cómo agrego una Razón Social que no aparece en la lista?**
R: En el campo "Razón Social" del formulario, haga clic en el botón "+" azul. Alternativamente, un administrador puede cargarla desde el Backoffice si se configura como campo gestionable.
