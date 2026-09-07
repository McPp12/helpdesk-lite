# HelpDesk Lite

Sistema de gestión de tickets de soporte técnico construido con HTML5, CSS3 y JavaScript Vanilla (sin frameworks, sin backend). Proyecto académico para la materia **Aplicaciones de Internet**.

## Cómo ejecutarlo

No requiere instalación ni servidor.

1. Descarga o clona el repositorio.
2. Abre `index.html` directamente en el navegador, o usa la extensión **Live Server** de VS Code para recargarlo automáticamente al guardar cambios.
3. Los datos se guardan en el `localStorage` del navegador, así que persisten entre recargas (pero son locales a ese navegador/equipo).

## Funcionalidades

- **Crear tickets** mediante un formulario con validación de campos obligatorios (título, descripción, categoría y prioridad).
- **Folio automático** con formato `HD-0001`, `HD-0002`, ... generado con un contador persistente y `padStart(4, '0')`.
- **Tarjetas de ticket** con folio, prioridad, categoría, fecha de creación y estado, con color diferenciado por prioridad y estado.
- **Búsqueda en tiempo real** por folio, título o descripción (evento `input`).
- **Filtros combinables** por estado y por prioridad, que funcionan junto con la búsqueda sobre el mismo arreglo de datos.
- **Flujo de estados controlado**:
  - `Nuevo` → `En proceso` o `Cancelado`
  - `En proceso` → `Resuelto` o `Cancelado`
  - `Resuelto` → `Cerrado`
  - `Cerrado` y `Cancelado` son estados finales
  - Cualquier transición fuera de estas reglas es rechazada por `isValidTransition()`.
- **Dashboard dinámico** (Total, Nuevos, En proceso, Resueltos) recalculado desde el arreglo de tickets después de cada cambio.
- **Estado vacío** cuando la búsqueda o los filtros no encuentran resultados.
- **Persistencia en `localStorage`** de los tickets y del contador de folios.
- **Diseño responsive**, probado en escritorio y en móvil.

## Estructura del proyecto

```
helpdesk-lite/
│
├── css/
│   └── styles.css
├── js/
│   └── app.js
├── docs/
│   └── evidencias/
├── index.html
└── README.md
```

## Modelo de datos de un ticket

```js
{
    id: 5,
    folio: 'HD-0005',
    title: 'Internet caído en laboratorio',
    description: 'No existe conexión en los equipos...',
    category: 'Red',
    priority: 'Crítica',
    status: 'Nuevo',
    createdAt: '2026-09-02T10:35:00'
}
```

## Flujo de trabajo con Git

El proyecto se desarrolló con un GitFlow simplificado: cada funcionalidad nació desde `feature/base-layout` , se integró de vuelta con merge, y la versión estable se publicó en `feature/base-layout` a través de `release/1.0.0` con el tag `v1.0.0`.

Consulta `docs/evidencias/` para las capturas del funcionamiento y del historial de Git (`git log --graph --oneline --decorate --all`).