# Plan de calidad y pruebas

Fecha: 2026-05-26
Proyecto: Tiendas Mass Admin (backend + frontend)

## 1. Objetivo
Definir el enfoque de calidad y pruebas para asegurar que el sistema cumple requisitos funcionales y no funcionales, y reducir riesgos en despliegue.

## 2. Alcance
Incluye:
- Backend: API, persistencia, seguridad, integraciones.
- Frontend: UI admin, flujos de usuario, validaciones.
- Integracion end-to-end entre frontend y backend.
- Modulos criticos: checkout, autenticacion/sesiones, catalogo/productos, pagos.

Excluye:
- Pruebas de infraestructura externa fuera del entorno controlado.
- Pruebas de compatibilidad con navegadores no soportados por el negocio.
- Integracion con ERP o sistemas internos reales (no aplica en proyecto academico).
- Logistica y despacho fisico con terceros.

## 3. Referencias del repositorio
- Backend: [TiendasMassBack-main](TiendasMassBack-main)
- Frontend: [TiendasMassFront-main](TiendasMassFront-main)
- Colecciones Postman: [postman_tests](postman_tests)
- Resultados de pruebas: [test-results](test-results)

## 4. Criterios de calidad
- Funcionalidad correcta segun historias/requirements.
- Seguridad basica (auth, permisos, datos sensibles).
- Rendimiento aceptable en operaciones criticas.
- Usabilidad y consistencia visual en UI admin.
- Mantenibilidad y trazabilidad de pruebas.

### 4.1 Enfoque ISO 25010
Se adoptan las caracteristicas de calidad del modelo ISO 25010 como guia para la cobertura:
- Adecuacion funcional: casos de negocio completos y validaciones.
- Eficiencia de desempeno: API < 200 ms en endpoints clave y flujos < 3 s.
- Compatibilidad: integracion entre modulos y servicios.
- Usabilidad: flujos claros, consistencia UI y accesibilidad (WCAG 2.1).
- Fiabilidad: estabilidad, manejo de errores y recuperacion.
- Seguridad: autenticacion, autorizacion, proteccion de datos.
- Mantenibilidad: legibilidad, pruebas unitarias y modularidad.
- Portabilidad: configuracion para despliegue en ambientes objetivo.

## 5. Roles y responsabilidades
- QA Lead: define estrategia, criterios de entrada/salida, reportes.
- QA Engineer: disena casos, ejecuta pruebas, registra defectos.
- Dev Backend/Frontend: corrige defectos, revisa cobertura.
- Product Owner: valida alcance y criterios de aceptacion.

## 6. Estrategia de pruebas
### 6.1 Tipos de pruebas
- Unitarias: funciones, servicios, validaciones.
- Integracion: endpoints, DB, servicios internos.
- API: colecciones Postman con datos de prueba.
- UI: flujos en UI admin, validaciones de formularios.
- End-to-end: flujos completos (auth, CRUD, pedidos, pagos).
- Regresion: smoke + casos criticos por release.
- Rendimiento basico: latencia, carga limitada en endpoints clave.
- Seguridad basica: autenticacion, autorizacion, input validation.

### 6.2 Niveles y herramientas
- Unitarias backend: Vitest (checkout con 47 casos).
- Unitarias frontend: tests unitarios existentes.
- TDD: validacion de precios en productos.
- API: Postman/Newman (colecciones encadenadas).
- UI/E2E: pruebas manuales + automatizacion gradual.
- UAT: criterios de aceptacion por casos practicos.

## 7. Ambientes de prueba
- Local: ejecucion de unitarias e integracion con DB local.
- Staging: entorno similar a produccion con datos controlados.
- Produccion academica: VPS con HTTPS y restricciones de plan gratuito.

## 8. Datos de prueba
- Datos semilla con scripts existentes.
- Datos anonimizados para pruebas sensibles.
- Se define set minimo para smoke y regresion.
- Pagos en modo sandbox (Mercado Pago).

## 9. Criterios de entrada y salida
### Entrada
- Requisitos aprobados.
- Build estable disponible.
- Datos de prueba listos.

### Salida
- 0 defectos criticos/altos.
- Cobertura minima alcanzada.
- Reporte de pruebas aprobado.

## 10. Matriz de riesgos
| Riesgo | Impacto | Probabilidad | Mitigacion | Pruebas |
|---|---|---|---|---|
| Fallos de autenticacion | Alto | Medio | Validar login, tokens, expiracion | API, E2E |
| Permisos incorrectos | Alto | Medio | Matriz de roles y permisos | API, UI |
| Errores en pedidos | Alto | Medio | Validar estados, stock, totales | API, E2E |
| Integracion pagos | Alto | Bajo | Mock + pruebas controladas | Integracion |
| Data corruption en DB | Alto | Bajo | Migraciones y constraints | Integracion |
| UI inconsistentes | Medio | Medio | Guia visual y smoke UI | UI |
| Baja performance en listados | Medio | Medio | Pruebas de carga basica | Rendimiento |
| Accesibilidad insuficiente | Medio | Medio | Validar WCAG 2.1 y UserWay | UI |

## 11. Matriz de cobertura
| Modulo | Backend | Frontend | E2E | Prioridad |
|---|---|---|---|---|
| Auth y usuarios | API + unit | UI + unit | Si | Alta |
| Roles y permisos | API | UI | Si | Alta |
| Productos y categorias | API | UI | Si | Alta |
| Carrito y checkout | API + unit | UI | Si | Alta |
| Pedidos y pagos | API | UI | Si | Alta |
| Clientes y direcciones | API | UI | Si | Media |
| Reportes | API | UI | No | Media |

## 12. Plan de ejecucion
- Smoke diario: auth, CRUD producto, carrito/checkout basico.
- Regresion semanal: casos criticos por modulo.
- Release: E2E completo + rendimiento basico.

## 13. Gestion de defectos
- Severidad: Critico, Alto, Medio, Bajo.
- Prioridad: P0, P1, P2, P3.
- Flujo: Nuevo -> Asignado -> En progreso -> Listo QA -> Cerrado.

## 14. Metricas y reportes
- % cobertura (unit + API + UI).
- Numero de defectos por severidad.
- Tasa de re-apertura.
- Tiempo medio de correccion.
- Cumplimiento de umbrales de rendimiento (API < 200 ms, flujos < 3 s).

## 15. Plan de mejora continua
- Revisar flujos fallidos por release.
- Automatizar casos repetitivos.
- Ajustar datos de prueba.

## 16. Anexos: listas iniciales de pruebas
- Casos criticos API: login, roles, productos, pedidos.
- Casos criticos UI: login, CRUD productos, ver pedidos.
- Casos E2E: registro, compra, pago, confirmacion.
