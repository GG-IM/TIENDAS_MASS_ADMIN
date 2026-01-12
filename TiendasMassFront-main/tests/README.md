# Directorio de Pruebas Automatizadas

Este directorio contiene todas las pruebas automatizadas del proyecto Tiendas Mass.

## Estructura de Directorios

```
tests/
├── setup/                      # Configuración global de pruebas
│   └── vitest.setup.js        # Configuración de Vitest y jest-dom
│
└── unit/                       # Pruebas unitarias
    └── checkout-validations.test.js  # Pruebas del módulo de checkout
```

## Tipos de Pruebas

### Pruebas Unitarias (`unit/`)
Pruebas que verifican el funcionamiento de componentes individuales de manera aislada.

**Archivo:** `checkout-validations.test.js`
- **Propósito:** Validar las funciones de validación del módulo de checkout
- **Cobertura:** 48 pruebas que cubren 6 categorías de validaciones
- **Tecnología:** Vitest + Jest-DOM matchers

## Convenciones de Nomenclatura

- Archivos de prueba: `*.test.js` o `*.spec.js`
- Estructura: `describe` → `it` → `expect`
- Nombres descriptivos sin emojis
- Comentarios JSDoc en funciones importantes

## Comandos de Testing

Ver `package.json` para la lista completa de scripts disponibles.

## Documentación Adicional

Para información detallada sobre la implementación y uso de las pruebas, consultar:
- `DOCUMENTACION_TESTING.md` - Guía completa de testing
- `REPORTE_PRUEBAS_AUTOMATIZADAS.md` - Resultados y análisis
