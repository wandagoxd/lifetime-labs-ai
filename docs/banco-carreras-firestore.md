# Banco de Carreras Uniandes - Arquitectura funcional y Firestore

## 1) Objetivo funcional
Disenar un Banco de Carreras para aspirantes y estudiantes Uniandes que combine:

- Vocacional: ajuste realista entre perfil y carrera.
- Academico: materias filtro, carga real, dificultad y cultura de facultad.
- Estrategico: transferencia interna, recalculo de promedio, doble programa y alternativas.
- Normativo: simulacion "Borron y Cuenta Nueva", rutas EDIR/CLE/CBU.
- Financiero: elegibilidad dinamica para becas y apoyos de permanencia.

La propuesta utiliza los patrones identificados en `estudio.txt` (movilidad, riesgo, permanencia y becas) y el inventario de `src/carreras.txt` (areas y oferta base).

## 2) Colecciones Firestore (implementacion directa)

### `carreras/{careerId}`
Documento principal por carrera. Incluye campos operativos para filtros, simuladores y comparadores:

- `nombre`, `area`, `facultad`, `creditos_totales`
- `descripcion_realista`, `perfil_estudiante_ideal`
- `habilidades_necesarias[]`, `tipo_pensamiento_requerido[]`
- `carga_academica_estimada`, `carga_academica_nivel`
- `dificultad_percibida`, `carga_matematica`, `carga_laboratorio`, `carga_teorica`
- `cultura_academica_facultad`, `testimonios_simulados_realistas[]`
- `materias_filtro[]`
- `materias_filtro_detalle[]` (nombre, semestre_tipico, nivel_riesgo_academico)
- `promedio_transferencia` (PGA minimo, ruta alterna, regla de recalculo)
- `recalculo_disponible`
- `disponibilidad_edir`
- `rutas_aterrizaje_suave` (CBU, CLE, EDIR, exploratorias)
- `compatibilidad_doble_programa` (detalle)
- `compatibilidad_doble_programa_aplica` (bool para query)
- `opciones_alternativas` (minors, opciones, enfasis, certificaciones, rutas)
- `posibilidad_extracreditacion`
- `opciones_posgrado_relacionadas` (coterminales, opcion de grado, aceleradas)
- `becas_especificas[]`
- `financiacion_apoyos` (becas, parcial, completa, permanencia)
- `riesgo_desercion` (nivel, factores)
- `intereses[]`, `estilo_aprendizaje[]`, `tolerancia_carga_recomendada`

### `users/{uid}/career_bank_profiles/{profileId}`
Preferencias y contexto del estudiante:

- tipo_usuario: `aspirante | activo | riesgo`
- intereses, habilidades, estilo_aprendizaje, tolerancia_carga
- promedio_actual, necesidad_financiera
- carrera_actual (si aplica)

### `users/{uid}/career_bank_simulations/{simulationId}`
Historial de simulaciones:

- `tipo`: `recalculo | borron_cuenta_nueva | financiero`
- `input` (materias, notas, homologables, problematicas)
- `resultado` (promedio_actual, promedio_transferencia, promedio_borron)
- `career_target_id`
- `created_at`

### `users/{uid}/career_bank_recommendations/{recommendationId}`
Resultado de motor de recomendacion:

- carreras sugeridas (top N)
- score por carrera
- justificacion por factores
- timestamp

## 3) Estructura de filtros inteligentes

### Academicos
- `area`
- `carga_matematica` (min/max)
- `carga_laboratorio` (min/max)
- `dificultad_percibida`
- `materias_filtro` (match por texto)
- `compatibilidad_doble_programa_aplica`
- `disponibilidad_edir`

### Vocacionales
- `intereses` (array)
- `habilidades_necesarias` (match parcial)
- `estilo_aprendizaje`
- `tolerancia_carga_recomendada`

### Estrategicos
- `recalculo_disponible`
- `posibilidad_extracreditacion`
- `opciones_posgrado_relacionadas.maestrias_coterminales` (existencia)
- `riesgo_desercion.nivel`

### Financieros
- `becas_especificas` (array contains)
- `financiacion_apoyos.financiacion_parcial_disponible`
- `financiacion_apoyos.financiacion_completa_disponible`
- `financiacion_apoyos.apoyos_permanencia_academica`

## 4) Ejemplo JSON expandido (documento `carreras/diseno`)

```json
{
  "id": "diseno",
  "nombre": "Diseno",
  "area": "Creativa",
  "facultad": "Arquitectura y Diseno",
  "creditos_totales": 128,
  "descripcion_realista": "Programa exigente en tiempo de taller. Se avanza con proyectos semanales, iteracion constante y retroalimentacion critica.",
  "perfil_estudiante_ideal": "Persona curiosa, tolerante a la ambiguedad, con disciplina para prototipar y argumentar decisiones.",
  "habilidades_necesarias": ["Comunicacion visual", "Gestion del tiempo", "Trabajo colaborativo", "Pensamiento sistemico"],
  "tipo_pensamiento_requerido": ["Creativo", "Analitico", "Iterativo"],
  "carga_academica_estimada": "Alta (46-54 horas semanales incluyendo taller)",
  "dificultad_percibida": "Alta",
  "carga_matematica": 2,
  "carga_laboratorio": 2,
  "carga_teorica": 3,
  "cultura_academica_facultad": "Cultura de critica abierta, trabajo en estudio y fuerte colaboracion entre pares.",
  "testimonios_simulados_realistas": [
    "S1 me exigio mas horas de las que esperaba, pero aprendi a justificar cada decision de diseno.",
    "La carga sube en entregas finales; planear tiempos es clave para no quemarse."
  ],
  "materias_filtro": ["Taller S1", "Representacion", "Historia del Diseno"],
  "materias_filtro_detalle": [
    { "nombre": "Taller S1", "semestre_tipico": 1, "nivel_riesgo_academico": "Alto" },
    { "nombre": "Representacion", "semestre_tipico": 1, "nivel_riesgo_academico": "Medio" },
    { "nombre": "Historia del Diseno", "semestre_tipico": 2, "nivel_riesgo_academico": "Medio" }
  ],
  "promedio_transferencia": {
    "pga_minimo_general": 3.5,
    "ruta_alternativa_creditos": "45 creditos con PGA >= 3.75",
    "regla_recalculo": "Solo permanecen en el promedio las materias homologables en el nuevo plan."
  },
  "recalculo_disponible": true,
  "posibilidad_extracreditacion": true,
  "compatibilidad_doble_programa_aplica": true,
  "compatibilidad_doble_programa": {
    "aplica": true,
    "dobles_programas_frecuentes": ["Arquitectura", "Ingenieria Industrial"],
    "compatibilidad_ciclo_basico": "Media",
    "tiempo_adicional_estimado_semestres": 3,
    "dificultad_combinada": "Alta"
  },
  "opciones_alternativas": {
    "minors": ["Innovacion", "Mercadeo"],
    "opciones_academicas": ["Gestion de Proyectos Creativos"],
    "enfasis": ["Experiencia de Usuario"],
    "certificaciones_interdisciplinarias": ["Design Thinking"],
    "rutas_flexibles_recomendadas": ["Diseno + minor en Gestion"]
  },
  "becas_especificas": ["Beca Preferente", "Fondo Quiero Estudiar", "Vamos Pa'lante"],
  "riesgo_desercion": {
    "nivel": "Medio",
    "factores": ["Sobrecarga de entregas en semestres iniciales", "Ajuste a cultura de critica continua"]
  }
}
```

## 5) UX del sistema (implementado en `career-bank`)

- Flujo por perfil: Aspirante / Activo / Riesgo academico.
- Filtros navegables de 4 capas: academicos, vocacionales, estrategicos, financieros.
- Vista detallada por carrera con:
  - Materias filtro y nivel de riesgo.
  - Movilidad academica (recalculo y ruta alternativa).
  - Rutas CBU/CLE/EDIR.
  - Doble programa y alternativas (minors/enfasis/certificaciones).
  - Coterminales y rutas aceleradas.
- Simulador "Borron y Cuenta Nueva" editable por materia.
- Sugeridor dinamico de apoyos financieros.
- Comparador de carreras.
- Recomendador automatico base para evolucion IA.

## 6) Indices recomendados

Se recomienda crear indices compuestos para:

1. `area` + `dificultad_percibida` + `carga_matematica`
2. `recalculo_disponible` + `posibilidad_extracreditacion` + `compatibilidad_doble_programa_aplica`
3. `becas_especificas` (array) + `area`
4. `riesgo_desercion.nivel` + `disponibilidad_edir`

## 7) Escalabilidad para futuras universidades

1. Multi-tenant por institucion:
   - `instituciones/{institucionId}/carreras/{careerId}`
2. Motor normativo por universidad:
   - reglas de transferencia y recalculo desacopladas en `normativas/{institucionId}`
3. Capa financiera por entidad:
   - `apoyos_financieros/{institucionId}/convocatorias/{id}`
4. IA explicable:
   - guardar razones de recomendacion y features usadas para auditoria.

Con esto, el Banco de Carreras mantiene la experiencia Uniandes y queda listo para expansion interuniversitaria sin redisenar la base.

