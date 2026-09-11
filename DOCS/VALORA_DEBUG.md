# Depuración del módulo Valora

> Guía del flujo nativo actual del frontend y `plataformas-financieras-api`.
> Describe qué datos construye Valora, cómo se persisten y cómo se generan las recomendaciones y reportes.
>
> **Última actualización:** migración desde el flujo legacy de Excel remoto a datos JSON y almacenamiento S3.

---

## 1. Vista general del flujo

1. El usuario entra a `/valora` o `/valora/:code`.
2. `ValoraPage` monta el formulario mediante `useValoraForm`.
3. El usuario selecciona fecha, país, moneda, sector, subsector y datos financieros.
4. Si carga un Excel, `valoraFileParsing.ts` lo lee en memoria del navegador.
5. `useValoraCalculation` construye `inputs`, `resultados` y `sensibilizacion`.
6. El frontend usa `POST /api/v1/main/calculations/native` para crear o `PUT /api/v1/main/calculations/{id}/native` para actualizar.
7. El backend persiste el cálculo y genera `template_values` para los reportes.
8. Plantillas, códigos y gráficos se identifican mediante claves S3.

> **Importante:** el flujo actual no clona plantillas ni abre sesiones de workbook externo.

---

## 2. Estado del formulario (`FormData`)

Los campos controlados incluyen fecha, país, moneda, sector, subsector, deuda, capital, tasas, tablas financieras, proyecciones y sensibilización. Los datos extraídos de un archivo cargado se normalizan en memoria y se envían como JSON.

---

## 3. Autocompletados dinámicos

El frontend consulta `template-complements` para obtener sectores, fechas, impuestos, tasas libres de riesgo, IR y devaluación. Los valores seleccionados se incorporan a `inputs` antes de persistir el cálculo.

---

## 4. Descarga de la plantilla

La plantilla actual se obtiene desde el endpoint de plantillas maestras y se entrega desde S3 mediante su `s3_object_key` o una URL firmada. La descarga no crea copias de trabajo ni modifica la plantilla maestra.

---

## 5. Backend — Procesamiento del cálculo Valora

### 5.1 Creación y actualización nativas

```text
POST /api/v1/main/calculations/native
PUT  /api/v1/main/calculations/{id}/native
```

El backend valida el tipo de cálculo, persiste `data` y completa `template_values` desde los códigos de la plantilla maestra.

### 5.2 Estructura persistida

El payload puede contener `inputs`, `resultados`, `sensibilizacion`, `template_values`, tablas financieras y contexto de la empresa. No guarda metadata de copias remotas.

### 5.3 Recomendaciones Valora

`POST /api/v1/main/analytics/valora-recommendations` procesa el payload nativo, calcula tasas históricas, construye el contexto macro y solicita estimaciones a Gemini cuando está configurado.

La recomendación no lee ni escribe hojas de cálculo.

---

## 6. Persistencia y recarga

```text
GET /api/v1/main/calculations/by-code/{code}
```

El frontend reconstruye el formulario desde `data`; resultados y sensibilizaciones permanecen en el cálculo nativo.

---

## 7. Reportes

Los reportes reemplazan códigos usando `template_values` y rutas nativas como `inputs.*` y `resultados.*`. Las imágenes se obtienen desde S3 mediante `storage_path` o URLs firmadas.

---

## 8. Gráficos

Los gráficos extraídos de la plantilla maestra se almacenan como objetos S3. Cada archivo se identifica con una clave S3; no se usa un identificador de almacenamiento legacy.

---

## 9. Qué modifica exactamente Valora

### Frontend (navegador)

1. Lee el archivo cargado en memoria.
2. Extrae tablas y datos relevantes.
3. Normaliza valores numéricos.
4. Envía un payload JSON a los endpoints nativos.

### Backend

1. Valida y persiste el cálculo nativo.
2. Genera los valores de códigos del reporte.
3. Conserva las claves S3 de archivos y gráficos.
4. Entrega datos para reportes y recomendaciones.

La plantilla maestra permanece intacta.

---

## 10. Endpoints involucrados

| Método | Endpoint | Propósito |
|--------|----------|-----------|
| GET | `/api/v1/main/template-complements/by-name/...` | Obtener complementos financieros |
| GET | `/api/v1/main/valora-template` | Obtener la plantilla actual |
| POST | `/api/v1/main/calculations/native` | Crear cálculo nativo |
| PUT | `/api/v1/main/calculations/{id}/native` | Actualizar cálculo nativo |
| GET | `/api/v1/main/calculations/by-code/{code}` | Recargar cálculo |
| POST | `/api/v1/main/analytics/valora-recommendations` | Generar recomendaciones nativas |
| GET | `/api/v1/main/reports/{id}/generate` | Generar reporte PDF |

---

## 11. Cambios recientes aplicados

| Área | Cambio |
|------|--------|
| Cálculos | Kapital y Valora usan endpoints nativos |
| Persistencia | Datos financieros estructurados en `calculation.data` |
| Plantillas | Archivos maestros identificados por `s3_object_key` |
| Gráficos | Imágenes almacenadas en S3 mediante `storage_path` |
| Reportes | Códigos resueltos desde `template_values` y rutas nativas |
| Recomendaciones | Valora procesa JSON nativo y contexto macro |

---

## 12. Consideraciones / pendientes observados

1. Mantener sincronizados los códigos de la plantilla y los `source_path` nativos.
2. Verificar que cada plantilla y gráfico tenga una clave S3 válida.
3. Mantener pruebas de creación, actualización, recarga y reportes.
4. Validar pagos y webhooks antes de liberar descargas protegidas.
5. Mantener las migraciones históricas de Alembic sin modificarlas.
