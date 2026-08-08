# Depuración del módulo Valora

> Archivo generado a partir del análisis del código fuente del frontend (`src/features/finance/valora`) y del backend (`plataformas-financieras-api`) en agosto 2026.
> Describe exactamente qué hace el flujo de Valora en este momento, qué modifica en el Excel y qué envía finalmente al backend en el JSON.
>
> **Última actualización:** correcciones en backend para escritura correcta de años y eliminación de escritura sobre celdas calculadas.
> - `app/api/main/calculations/excel_engine.py`
> - `app/core/constants.py`

---

## 1. Vista general del flujo

1. El usuario entra a `/valora` o `/valora/:code`.
2. `ValoraPage` monta el formulario a través de `useValoraForm`.
3. El usuario:
   - Selecciona fecha, país, moneda, sector, subsector, etc.
   - Descarga o sube la **Plantilla de Estados Financieros**.
4. Si sube un archivo Excel, se parsea en el navegador (`valoraFileParsing.ts`).
5. El usuario presiona **Calcular**.
6. `useValoraCalculation` construye el payload y envía un `POST /api/v1/main/calculations` (o `PUT` si ya hay cálculo).
7. El backend **clona la plantilla maestra** a una **copia de trabajo en OneDrive** (`PLATAFORMAS_FINANCIERAS/{env}/valora/`).
8. El backend abre la copia en Excel Online, escribe los inputs en las celdas configuradas, fuerza el recálculo y lee los resultados.
9. El backend guarda `inputs`, `resultados` y `file` (metadata de la copia de OneDrive) en `main_calculations`.
10. El backend responde con la entidad `Calculation` y el frontend muestra la sección de resultados.

> **Importante:** la **plantilla maestra** (`main_master_templates.is_default = true`) **nunca se modifica**; cada cálculo Valora trabaja sobre su propia copia.

---

## 2. Estado del formulario (`FormData`)

Campos controlados que el usuario rellena o que se autocompletan:

| Campo | Origen | Uso |
|-------|--------|-----|
| `date` | Input select | Fecha del periodo de análisis |
| `country` | Input select | País |
| `currency` | Input select | Moneda (USD por defecto) |
| `sector` | Input select | Sector de Damodaran |
| `subsector` | Input select | Subsector |
| `tickers_subsector` | Texto | Tickers del subsector (desde Boa) |
| `beta_unlevered_industry` | Autocalculado | Beta desapalancado de la industria |
| `beta_subsector` | Input | Beta del subsector ingresado |
| `shares` | Excel / Form | Número de acciones |
| `kd` | Excel / Form | Costo de deuda (%) |
| `debt` | Excel / Form | % de deuda |
| `capital` | Excel / Form | % de capital (100 - debt) |
| `instrument`, `bono` | Selects | Instrumento / bono para la tasa |
| `devaluation` | Autocompletado | Devaluación anual (%) |
| `tax` | Autocompletado | Tasa impositiva IR (%) |
| `fileUsername` | Archivo subido | Nombre del archivo Excel |
| `action`, `longgrowth`, `capitalcost`, `revenuegrowth` | Form / Free inputs | Inputs libres del usuario |
| `dc_ratio`, `effective_tax_rate`, `beta_levered`, `beta_unlevered` | Form | Disponibles para análisis manual |
| `revenue_forecast_rate`, `fdc_forecast_rate`, `perpetual_growth_rate`, `beta_unlevered_sensitivity` | Form | Proyección y sensibilidad |
| `typeId`, `useFinancialData` | Checkboxes | Banderas del formulario |

---

## 3. Autocompletados dinámicos

### 3.1 Fechas y sectores

Al montar la página, `useValoraForm` hace dos requests simultáneos:

```
GET /api/v1/main/template-complements/by-name/damodaran?only-name=true
GET /api/v1/main/template-complements/by-name/rf?only-date=true
```

- `damodaran?only-name=true` trae la lista de sectores/industrias.
- `rf?only-date=true` trae la lista de fechas disponibles.

### 3.2 Beta desapalancado de la industria

Cuando cambian `date` o `sector`, se ejecuta:

```
GET /api/v1/main/template-complements/by-name/damodaran
GET /api/v1/main/template-complements/by-name/tax
```

El frontend busca la fila del año del sector elegido y aplica la fórmula:

```text
beta_unlevered = beta / (1 + (1 - tax_rate) * (d_sobre_def / e_sobre_de))
```

Donde `beta`, `d_sobre_def` y `e_sobre_de` vienen del complemento Damodaran y `tax_rate` del complemento Tax.

El resultado se guarda en `formData.beta_unlevered_industry` con 2 decimales.

### 3.3 IR y devaluación

Cuando cambian `date` o `country`, se hacen:

```
GET /api/v1/main/template-complements/by-name/ir?year={year}&country={country}
GET /api/v1/main/template-complements/by-name/devaluacion?year={year}&country={country}&period={quarter}
```

Si `valor` existe, se multiplica por 100 y se guarda con 2 decimales en `tax` o `devaluation`.

### 3.4 Relación deuda / capital

- Si se edita `debt`, se completa `capital = 100 - debt`.
- Si se edita `capital`, se completa `debt = 100 - capital`.

---

## 4. Descarga de la plantilla

El botón de descarga llama a:

```
GET /api/v1/main/valora-template
```

La respuesta contiene un array `templates` con `url`, `filename`, `original_name`, `is_current`.

El frontend elige la plantilla con `is_current === true` o la primera del array y descarga el archivo directamente desde el navegador con `<a href={url} download={original_name} />`.

**No modifica nada del Excel**; solo lo pone en la carpeta de descargas del usuario.

---

## 5. Backend — Procesamiento del cálculo Valora

### 5.1 Clonación de la plantilla maestra

Al crear un cálculo nuevo (POST `/main/calculations`), si el `calc_type` es `valora`, el backend ejecuta `_clone_default_template_for_calculation` (`app/api/main/calculations/macros_service.py`):

1. Busca `main_master_templates` donde `is_default = true` (fallback a la más reciente).
2. Valida que tenga `onedrive_item_id` configurado.
3. Crea la estructura de carpetas en OneDrive: `PLATAFORMAS_FINANCIERAS/{env}/valora/`.
4. Copia el archivo de la plantilla maestra a `valora/{valora-uuid}.xlsx` usando Graph API (`/drive/items/{id}/copy`).
5. Devuelve metadata con `onedrive_item_id` de la copia.

**La plantilla maestra original permanece intacta.** En un PUT se reutiliza la copia anterior (`calculation.data.file.onedrive_item_id`) en lugar de clonar de nuevo.

### 5.2 Sesión de Excel Online

Función `_enrich_payload_with_valora_excel` (`app/api/main/calculations/excel_engine.py`):

```python
session_id = await service._create_workbook_session(item_id, persist_changes=True)
```

- `persist_changes=True` garantiza que los cambios se guarden en la copia de OneDrive.
- Si ya existe `active_session_id`, intenta reutilizarla; si falla, crea una nueva.

### 5.3 Escritura de inputs en la copia de trabajo

Función `_write_valora_inputs_to_excel` (`app/api/main/calculations/excel_engine.py`):

#### Años

Ahora se escriben los años **reales del Excel del usuario** en:

- `C2:L2` (años del Balance / Proyección)
- `C37:L37` (años del Estado de Resultados)

Reglas:

- Se toman los años del `balance_table` o `results_table`.
- Se asume orden descendente (mayor a menor) desde el frontend.
- Se alinean de **derecha a izquierda**: el año mayor va en la columna L, el siguiente en K, etc.
- Se escriben máximo 8 años.
- **No se rellenan celdas sobrantes con vacíos**; las celdas que no tienen año simplemente no se tocan.

#### Balance General y Estado de Resultados

- Balance General: `E4:L35` (32 filas × 8 columnas).
- Estado de Resultados: `E38:L51` (14 filas × 8 columnas).
- Los valores se alinean a la derecha, coincidiendo con el año mayor en L.

#### Inputs simples (no deben tocar fórmulas internas)

| Mapa | Hoja | Celdas | Contenido |
|------|------|--------|-----------|
| `VALORA_INPUT_CELL_MAP` | `Plantilla Usuario` | C2..C10 | fecha, país, moneda, industria, tasa libre riesgo, año bono, shares, costo deuda, % deuda |
| `VALORA_PROJECTION_INPUT_CELL_MAP` | `Proyección` | M91, F81 | `revenue_forecast_rate`, `perpetual_growth_rate` |
| `VALORA_INTEGRATED_INPUT_CELL_MAP` | `Integrado` | *(vacío)* | `fdc_forecast_rate` fue deshabilitado intencionalmente |
| `KAPITAL_INPUT_WACC` y mapas macro | `WACC` | varias | datos de `rf`, `embi`, `prima`, `riesgo`, `tax`, `damodaran` |

> **Celdas que NO se escriben** (reservadas para cálculo interno de la plantilla):
> - `Proyección!M89`
> - `Integrado!M7`
> - `Integrado!M10` (`fdc_forecast_rate` deshabilitado)

### 5.4 Recálculo y reparación de forecast

```python
await service.force_calculate_excel(item_id, session_id=session_id)

if await _repair_valora_annual_forecasts(item_id, session_id=session_id):
    await service.force_calculate_excel(item_id, session_id=session_id)
```

- `force_calculate_excel` ejecuta `application/calculate` con `calculationType: "fullRebuild"`.
- `_repair_valora_annual_forecasts` revisa si hay errores tipo `#N/A`, `#REF!`, etc. en celdas de proyección y, solo en ese caso, reescribe fórmulas de crecimiento.

### 5.5 Lectura de resultados

Se lee `VALORA_RESULTS_CELL_MAP` (`app/core/constants.py`):

```python
{
  "wacc": ("Conceptos", "C23"),
  "balance": {
    "activo": ("Proyección", "L18"),
    "pasivo": ("Proyección", "L29"),
    "patrimonio": ("Proyección", "L34"),
  },
  "conceptos": {
    "activo": ("Conceptos", "Q24"),
    "pasivo": ("Conceptos", "Q26"),
    "empresa": ("Conceptos", "Q25"),
    "patrimonio": ("Conceptos", "Q27"),
    "precio_accion": ("Conceptos", "Q28"),
    "tasa_forecast": ("Conceptos", "T30"),
    "tasa_perpetua": ("Conceptos", "T31"),
  },
  "integrado": {
    "activo": ("Integrado", "P34"),
    "pasivo": ("Integrado", "P36"),
    "empresa": ("Integrado", "P35"),
    "patrimonio": ("Integrado", "P37"),
    "precio_accion": ("Integrado", "P38"),
    "tasa_forecast": ("Integrado", "S40"),
    "tasa_perpetua": ("Integrado", "S41"),
  },
}
```

Los valores se guardan en `payload_data["resultados"]` y posteriormente en BD.

### 5.6 Error silencioso conocido

En `app/api/main/calculations/router.py`:

```python
try:
    payload_data = await _enrich_payload_with_valora_excel(
        payload_data, master_item_id, existing_session_id=None
    )
except Exception as exc:
    logger.warning(f"Error procesando Valora en RAM: {exc}")
```

Si Excel Online, Graph API o cualquier paso de escritura/lectura falla:

- El error solo se loguea como `warning`.
- El flujo **continúa**.
- El cálculo se guarda en base de datos, pero podría tener `resultados` vacíos o incompletos.
- Para el usuario parece que el cálculo se guardó correctamente, aunque los resultados no reflejan el modelo.

> **Impacto:** genera cálculos que guardan los inputs pero no el output, dificultando la depuración.
>
> **Recomendación pendiente de revisión:** decidir si Valora debe fallar visiblemente (HTTP 5xx) o continuar con un flag de error.

---

## 6. Subida y parseo del Excel

### 5.1 Archivo seleccionado

Cuando el usuario sube un archivo:

```ts
setFormData((prev) => ({ ...prev, fileUsername: file.name }));
setFileUploaded(true);
```

Se invoca `parseFinancialTables(file)`.

### 5.2 Proceso de lectura del Excel

Archivo: `src/features/finance/valora/types/valoraFileParsing.ts`

1. Lee el archivo con `file.arrayBuffer()`.
2. Abre el workbook con `XLSX.read(buffer, { type: "array" })`.
3. Recorre todas las hojas del workbook.

#### 5.2.1 Extracción de celdas C3, C4 y C5

Para la primera hoja encontrada:

| Celda | Significado | Campo del formulario | Parser |
|-------|-------------|----------------------|--------|
| C3 | Costo de deuda (%) | `kd` | `parsePercentageValue` |
| C4 | % de deuda | `debt` | `parsePercentageValue` |
| C5 | Número de acciones | `shares` | `parseNumberValue` |

**`parsePercentageValue`**:
- Si el formato de celda incluye `%`, lo quita y lo trata como porcentaje ya en escala 0-100.
- Si el valor numérico está entre 0 y 1 y empieza con `0.`, lo multiplica por 100.
- Cualquier otro número se devuelve tal cual.
- Devuelve `string`.

**`parseNumberValue`**:
- Exige número > 0.
- Quita comas y fija 2 decimales.
- Devuelve `string`.

Estos valores se inyectan en `formData`:

```ts
updates.kd = customInputs.kd;
updates.debt = customInputs.debt;        // y si es número, capital = 100 - debt
updates.shares = customInputs.shares;
```

#### 5.2.2 Extracción de tablas financieras

Busca dos tablas dentro del Excel:

- **BALANCE GENERAL**
- **ESTADO DE RESULTADOS**

La función `parseTable(data, title, stopTitle)` hace:

1. Normaliza el título quitando acentos y espacios extras.
2. Busca la primera fila cuya celda coincida con el título.
3. Busca la fila de años dentro de las 5 filas siguientes al título.
   - Necesita al menos 2 años (números entre 1900 y 2100).
   - Si no encuentra años, genera columnas genéricas (`Col1`, `Col2`, ...).
4. Recorre filas hasta encontrar el título de la siguiente sección (`stopTitle`) o hasta 8 filas vacías consecutivas.
5. Para cada fila:
   - Extrae la etiqueta (label) en las columnas previas al primer año.
   - Extrae los valores numéricos de las columnas correspondientes a cada año.
   - Limpia `$`, `S`, `/`, comas y espacios.
   - Si el número está entre paréntesis `(123)` se convierte en `-123`.

Resultado financial table:

```ts
{
  title: "BALANCE GENERAL",
  years: ["2024", "2023", "2022"],   // el frontend mantiene orden descendente
  rows: [
    { label: "Caja", values: [1500, 1200, 1000] },
    { label: "Deuda corto plazo", values: [300, 400, 500] },
  ]
}
```

> El backend de Valora espera que `years` venga en orden **descendente** (mayor a menor). Al escribir en la copia de Excel Online, alinea el año mayor a la derecha (columna L) y continúa hacia la izquierda.

#### 5.2.3 Normalización de separadores de miles

Tanto `parseFinancialTablesFromFile` como `useValoraCalculation` aplican la misma normalización:

```ts
if (Number.isFinite(value) && !Number.isInteger(value) && Math.abs(value) < 10_000) {
  return Math.round(value * 1_000);
}
```

> **Nota**: Esto quiere decir que si Excel interpretó "1500.50" como `1500.5`, el valor se deja igual. Solo valores decimales pequeños (menores a 10 000) se asumen separadores de miles y se multiplican por 1 000.

---

## 6. Envío del cálculo (`handleSubmit`)

### 6.1 Validaciones previas

Campos obligatorios antes de enviar:

- `date`
- `country`
- `currency`
- `sector`
- Archivo subido (`fileUploaded`, `hasCalculated` o `fileUsername`)

Si falta alguno, muestra toast de advertencia y no envía nada.

### 6.2 Construcción del payload

```ts
const inputPayload = {
  ...formData,
  balance_table: normalizedBalanceTable,
  results_table: normalizedResultsTable,
};
```

Es decir, **mecla todos los campos del formulario con las dos tablas parseadas**.

### 6.3 Creación / actualización en el backend

Si no hay un cálculo cargado (`currentCalculation` es null), hace:

```
POST /api/v1/main/calculations
```

Con body:

```json
{
  "calculation_file_id": null,
  "user_id": 1,
  "code": "<hash-generado>",
  "type": "valora",
  "data": {
    "inputs": [inputPayload]
  }
}
```

Si ya existe un cálculo, hace:

```
PUT /api/v1/main/calculations/{id}
```

Con body:

```json
{
  "data": {
    "inputs": [inputPayload]
  }
}
```

Luego actualiza la URL del navegador:

```ts
window.history.pushState({}, "", `/valora/${persistedCalculation.code}`);
```

---

## 7. Contenido exacto del JSON enviado

El JSON final enviado a `POST /api/v1/main/calculations` se ve así (ejemplo ilustrativo, datos reales dependen del usuario):

```json
{
  "calculation_file_id": null,
  "user_id": 1,
  "code": "a3f9c2...",
  "type": "valora",
  "data": {
    "inputs": [
      {
        "date": "2024-Q4",
        "country": "PE",
        "currency": "USD",
        "sector": "Tecnología",
        "subsector": "Software",
        "tickers_subsector": "MSFT, AAPL",
        "beta_unlevered_industry": "0.95",
        "beta_subsector": "",
        "fileUsername": "EEFF_Empresa.xlsx",
        "action": "",
        "longgrowth": "",
        "capitalcost": "",
        "revenuegrowth": "",
        "shares": "1000000",
        "instrument": "",
        "bono": "",
        "devaluation": "3.50",
        "tax": "29.50",
        "kd": "5.20",
        "debt": "40",
        "capital": "60",
        "typeId": false,
        "useFinancialData": false,
        "dc_ratio": "",
        "effective_tax_rate": "",
        "beta_levered": "",
        "beta_unlevered": "",
        "revenue_forecast_rate": "",
        "fdc_forecast_rate": "",
        "perpetual_growth_rate": "",
        "beta_unlevered_sensitivity": "",
        "balance_table": {
          "title": "BALANCE GENERAL",
          "years": ["2022", "2023", "2024"],
          "rows": [
            {
              "label": "Caja",
              "values": [1000, 1200, 1500]
            },
            {
              "label": "Deuda corto plazo",
              "values": [500, 400, 300]
            }
          ]
        },
        "results_table": {
          "title": "ESTADO DE RESULTADOS",
          "years": ["2022", "2023", "2024"],
          "rows": [
            {
              "label": "Ventas",
              "values": [10000, 12000, 15000]
            },
            {
              "label": "Utilidad neta",
              "values": [1000, 1500, 2000]
            }
          ]
        }
      }
    ]
  }
}
```

Puntos clave:

- Todos los campos del formulario viajan como strings (excepto `typeId` y `useFinancialData` que son booleanos).
- `balance_table` y `results_table` solo se adjuntan si se subió un archivo Excel.
- Si no se subió archivo, ambos valores son `null` o `undefined`, pero el resto del formulario sí se envía.
- El backend espera `data.inputs` como array y toma el último elemento al recargar (`latestInput`).

---

## 8. Recarga desde URL (`loadFromUrl`)

Cuando se accede a `/valora/{code}`, el frontend:

1. Extrae el `code` del pathname o query param.
2. Hace:

```
GET /api/v1/main/calculations/by-code/{code}
```

3. Si el `type` es `"valora"`, toma el último `input` del array `data.inputs` y:
   - Restaura el formulario con `setFormData`.
   - Restaura `balance_table` y `results_table`.
   - Marca `fileUploaded = true` si existen `fileUsername` o `balance_table`.
   - Abre la sección de resultados.

---

## 9. Qué modifica exactamente Valora en el Excel

### Frontend (navegador)

**No escribe ni modifica ningún archivo Excel.**

Solo:

1. Lee el workbook en memoria con `xlsx`.
2. Extrae los valores de las celdas C3, C4 y C5.
3. Extrae las tablas "BALANCE GENERAL" y "ESTADO DE RESULTADOS".
4. Aplica normalizaciones numéricas en memoria.
5. Envía esos datos planos como JSON al backend.

No hay llamadas a `XLSX.write`, `XLSX.writeFile` ni a ningún endpoint de subida/escritura de Excel.

### Backend (OneDrive / Excel Online)

**La plantilla maestra (`main_master_templates.is_default = true`) nunca se modifica.**

Para cada cálculo Valora el backend:

1. **Clona** la plantilla maestra a una copia de trabajo en `PLATAFORMAS_FINANCIERAS/{env}/valora/`.
2. **Escribe** en esa copia los años, el balance, el estado de resultados y los inputs simples.
3. **No toca** las celdas internas de fórmula: `Proyección!M89`, `Integrado!M7` e `Integrado!M10`.
4. **Recalcula**, lee los resultados y guarda la metadata en BD.

| Archivo | ¿Se modifica? | Ubicación / identificador |
|---------|---------------|---------------------------|
| Plantilla maestra | **No** | OneDrive `.../plantillas_maestras/`; `main_master_templates` |
| Copia de trabajo por cálculo | **Sí** | OneDrive `.../valora/{uuid}.xlsx`; guardada en `calculation.data.file` |

---

## 10. Endpoints involucrados

| Método | Endpoint | Propósito |
|--------|----------|-----------|
| GET | `/api/v1/main/template-complements/by-name/damodaran?only-name=true` | Listar sectores |
| GET | `/api/v1/main/template-complements/by-name/rf?only-date=true` | Listar fechas |
| GET | `/api/v1/main/template-complements/by-name/damodaran` | Data Damodaran completa |
| GET | `/api/v1/main/template-complements/by-name/tax` | Data de impuestos |
| GET | `/api/v1/main/template-complements/by-name/ir?year=&country=` | IR específico |
| GET | `/api/v1/main/template-complements/by-name/devaluacion?year=&country=&period=` | Devaluación específica |
| GET | `/api/v1/main/valora-template` | Plantilla actual a descargar |
| POST | `/api/v1/main/calculations` | Crear cálculo Valora |
| PUT | `/api/v1/main/calculations/{id}` | Actualizar cálculo existente |
| GET | `/api/v1/main/calculations/by-code/{code}` | Cargar cálculo por URL |
| GET | `/api/v1/main/master-templates/valora-copies?env={env}` | **Admin debug:** listar copias de trabajo Valora en OneDrive |
| GET | `/api/v1/main/master-templates/valora-copies/{item_id}/download-url` | **Admin debug:** URL temporal de una copia |
| DELETE | `/api/v1/main/master-templates/valora-copies/{item_id}` | **Admin debug:** eliminar una copia |
| POST | `/api/v1/main/master-templates/valora-copies/delete-batch` | **Admin debug:** eliminar copias en lote |

---

## 11. Cambios recientes aplicados (agosto 2026)

| Fecha | Archivo | Cambio |
|-------|---------|--------|
| 2026-08-06 | `app/api/main/calculations/excel_engine.py` | Los años se escriben en un rango dinámico que depende de N (ej: 8 años -> `E2:L2`, 5 años -> `H2:L2`), nunca como strings. Se alinean a la derecha, año mayor en L. |
| 2026-08-06 | `app/api/main/calculations/excel_engine.py` | Valores de balance y estado de resultados se parsean con `_extract_number`; si no son numéricos se envía `None` en lugar del string original. |
| 2026-08-06 | `app/api/main/calculations/excel_engine.py` | Eliminada la escritura de `Proyección!M89`, `Integrado!M7` y reparación de fórmulas internas. `M89` nunca se pisa, preservando `FORECAST.ETS` / `PRONOSTICO.ETS`. |
| 2026-08-06 | `app/api/main/calculations/excel_engine.py` | Nueva función `_rewrite_valora_forecast_formulas` que reescribe explícitamente fórmulas `FORECAST.ETS` en M105, M120, M137 y M170 tras cambiar datos históricos. El primer argumento es el período de la misma fila (M102, M118, M134, M167). Incluye fallback a `FORECAST.LINEAR` si ETS falla. |
| 2026-08-06 | `app/api/main/calculations/excel_engine.py` | Agregada espera de 1s después de escritura y antes de recálculo; se cierra la sesión de Excel Online al final para asegurar persistencia. |
| 2026-08-06 | `app/core/constants.py` | Deshabilitados `revenue_forecast_rate` → `M91` y `fdc_forecast_rate` → `M10`; `perpetual_growth_rate` → `F81` mantiene escala directa. |
| 2026-08-06 | `app/services/onedrive/excel_mixin.py` | Confirmado: `_create_workbook_session(..., persist_changes=True)` en cálculos Valora. |
| 2026-08-06 | `app/api/main/master_templates/router.py` | Nuevos endpoints para listar/eliminar copias de trabajo Valora en OneDrive (`/valora-copies`). Listado ordenado por fecha de modificación descendente (más reciente primero). |
| 2026-08-06 | `src/shared/services/main.service.ts` | Agregados métodos para consumir endpoints de copias Valora. |
| 2026-08-06 | `src/features/admin/pages/PlantillasMaestrasPage.tsx` | Nueva pestaña "Copias Valora — Debug" con listado, vista previa, descarga y eliminación individual/masiva. |
| 2026-08-06 | `plataformas-financieras/DOCS/VALORA_DEBUG.md` | Documentado el error silencioso del POST de Valora y el flujo de clonación de plantilla maestra. |

## 12. Consideraciones / pendientes observados

1. **Sensibilidad aún no habilitada**: `hasSensitized` está hardcodeado a `false` en `ValoraPage`.
2. **Formato de Fecha**: `getYearAndQuarter(formData.date)` espera un string con formato tipo `"2024-Q4"`.
3. **Moneda local**: Cuando el usuario cambia de país, si la moneda actual no es USD ni la moneda local del país, se resetea a USD.
4. **Normalización de separadores de miles**: La lógica `value * 1_000` para números no enteros menores a 10 000 puede ser agresiva si los datos reales sí son decimales legítimos menores a 10 000.
5. **Error silencioso en POST**: si Excel Online falla, Valora guarda el cálculo sin resultados. Pendiente decidir si se debe propagar el error al usuario.
6. **Refresh one-off**: No se observa un endpoint `refreshCalculation` siendo llamado automáticamente; el cálculo propiamente dicho parece ejecutarse solo del lado del backend cuando carga el JSON de inputs.
7. **Celdas internas protegidas**: `M89` (Proyección), `M7` y `M10` (Integrado) contienen fórmulas nativas de la plantilla y nunca deben sobreescribirse. El rate `perpetual_growth_rate` en `F81` se escribe en escala directa.
8. **Vista previa de copias**: El iframe de OneDrive/Excel Online puede requerir autenticación adicional o no permitir incrustar (`X-Frame-Options`). En ese caso, el botón "Abrir en pestaña" usa `webUrl` o `downloadUrl` directamente.
