const areaColors = {
    "Administrativa y Economica": "amber",
    "Cientifica": "cyan",
    "Creativa": "fuchsia",
    "Ingenio": "emerald",
    "Social": "indigo"
};

export const careerBankSeed = [
    {
        id: "diseno",
        nombre: "Diseno",
        area: "Creativa",
        facultad: "Arquitectura y Diseno",
        area_color: areaColors["Creativa"],
        creditos_totales: 128,
        descripcion_realista: "Programa exigente en tiempo de taller. Se avanza con proyectos semanales, iteracion constante y retroalimentacion critica.",
        perfil_estudiante_ideal: "Persona curiosa, tolerante a la ambiguedad, con disciplina para prototipar y argumentar decisiones.",
        habilidades_necesarias: ["Comunicacion visual", "Gestion del tiempo", "Trabajo colaborativo", "Pensamiento sistemico"],
        tipo_pensamiento_requerido: ["Creativo", "Analitico", "Iterativo"],
        carga_academica_estimada: "Alta (46-54 horas semanales incluyendo taller)",
        carga_academica_nivel: 5,
        dificultad_percibida: "Alta",
        carga_matematica: 2,
        carga_laboratorio: 2,
        carga_teorica: 3,
        cultura_academica_facultad: "Cultura de critica abierta, trabajo en estudio y fuerte colaboracion entre pares.",
        testimonios_simulados_realistas: [
            "S1 me exigio mas horas de las que esperaba, pero aprendi a justificar cada decision de diseno.",
            "La carga sube en entregas finales; planear tiempos es clave para no quemarse."
        ],
        materias_filtro: ["Taller S1", "Representacion", "Historia del Diseno"],
        materias_filtro_detalle: [
            { nombre: "Taller S1", semestre_tipico: 1, nivel_riesgo_academico: "Alto" },
            { nombre: "Representacion", semestre_tipico: 1, nivel_riesgo_academico: "Medio" },
            { nombre: "Historia del Diseno", semestre_tipico: 2, nivel_riesgo_academico: "Medio" }
        ],
        promedio_transferencia: {
            pga_minimo_general: 3.5,
            ruta_alternativa_creditos: "45 creditos con PGA >= 3.75",
            regla_recalculo: "Solo permanecen en el promedio las materias homologables en el nuevo plan."
        },
        recalculo_disponible: true,
        disponibilidad_edir: true,
        rutas_aterrizaje_suave: {
            cbu: ["Pensamiento Cientifico", "Cultura, Artes y Humanidades", "Curso Colombia"],
            cle: ["Fotografia Basica", "Narrativa Visual", "Introduccion a UX"],
            edir: ["Ruta Exploratoria Creativa", "Acompanamiento Vocacional"],
            materias_exploratorias_compatibles: ["Introduccion al Diseno", "Fundamentos de Arquitectura", "Narrativas Digitales I"]
        },
        compatibilidad_doble_programa: {
            aplica: true,
            dobles_programas_frecuentes: ["Arquitectura", "Ingenieria Industrial", "Narrativas Digitales"],
            compatibilidad_ciclo_basico: "Media",
            tiempo_adicional_estimado_semestres: 3,
            dificultad_combinada: "Alta"
        },
        compatibilidad_doble_programa_aplica: true,
        opciones_alternativas: {
            minors: ["Innovacion", "Mercadeo", "Produccion Audiovisual"],
            opciones_academicas: ["Gestion de Proyectos Creativos", "Emprendimiento"],
            enfasis: ["Experiencia de Usuario", "Servicios", "Producto"],
            certificaciones_interdisciplinarias: ["Design Thinking", "Visualizacion de Datos"],
            rutas_flexibles_recomendadas: ["Diseno + minor en Gestion", "Diseno + certificacion en Datos"]
        },
        posibilidad_extracreditacion: true,
        opciones_posgrado_relacionadas: {
            maestrias_coterminales: ["Maestria en Diseno", "Maestria en Humanidades Digitales"],
            opciones_de_grado: ["Proyecto aplicado", "Curso de maestria", "Investigacion"],
            rutas_academicas_aceleradas: ["Coterminal en Diseno", "Ruta Diseno + Innovacion"]
        },
        becas_especificas: ["Beca Preferente", "Fondo Quiero Estudiar", "Vamos Pa'lante"],
        financiacion_apoyos: {
            elegible_para_becas: true,
            financiacion_parcial_disponible: true,
            financiacion_completa_disponible: false,
            apoyos_permanencia_academica: true
        },
        riesgo_desercion: {
            nivel: "Medio",
            factores: ["Sobrecarga de entregas en semestres iniciales", "Ajuste a cultura de critica continua"]
        },
        intereses: ["creatividad", "impacto social", "tecnologia"],
        estilo_aprendizaje: ["proyectos", "colaborativo"],
        tolerancia_carga_recomendada: "Alta"
    },
    {
        id: "ingenieria-sistemas",
        nombre: "Ingenieria de Sistemas",
        area: "Ingenio",
        facultad: "Ingenieria",
        area_color: areaColors["Ingenio"],
        creditos_totales: 142,
        descripcion_realista: "Formacion intensa en programacion, arquitectura de software y matematicas aplicadas. Ritmo alto en primeros cuatro semestres.",
        perfil_estudiante_ideal: "Persona con gusto por resolver problemas abstractos y construir soluciones tecnicas de largo plazo.",
        habilidades_necesarias: ["Programacion", "Pensamiento logico", "Persistencia", "Lectura tecnica"],
        tipo_pensamiento_requerido: ["Computacional", "Analitico", "Sistemico"],
        carga_academica_estimada: "Alta (48-56 horas semanales)",
        carga_academica_nivel: 5,
        dificultad_percibida: "Alta",
        carga_matematica: 5,
        carga_laboratorio: 3,
        carga_teorica: 4,
        cultura_academica_facultad: "Ambiente competitivo, orientado a proyectos y aprendizaje autonomo.",
        testimonios_simulados_realistas: [
            "IP y estructuras de datos fueron el primer gran filtro; formar grupo de estudio hizo la diferencia.",
            "Cuando pasas la linea de matematicas temprano, el resto del plan se vuelve mucho mas manejable."
        ],
        materias_filtro: ["Introduccion a la Programacion", "Estructuras de Datos", "Calculo Diferencial"],
        materias_filtro_detalle: [
            { nombre: "Introduccion a la Programacion", semestre_tipico: 1, nivel_riesgo_academico: "Alto" },
            { nombre: "Estructuras de Datos", semestre_tipico: 2, nivel_riesgo_academico: "Alto" },
            { nombre: "Calculo Diferencial", semestre_tipico: 1, nivel_riesgo_academico: "Alto" }
        ],
        promedio_transferencia: {
            pga_minimo_general: 3.5,
            ruta_alternativa_creditos: "45 creditos con PGA >= 3.75",
            regla_recalculo: "Las materias no homologables se excluyen del promedio al aplicar recalculo."
        },
        recalculo_disponible: true,
        disponibilidad_edir: true,
        rutas_aterrizaje_suave: {
            cbu: ["Pensamiento Cientifico", "CBU Colombia"],
            cle: ["Pensamiento Computacional", "Introduccion a Ciencia de Datos"],
            edir: ["Ruta Exploratoria en Ingenieria"],
            materias_exploratorias_compatibles: ["IP para no ingenieros", "Matematicas discretas basicas"]
        },
        compatibilidad_doble_programa: {
            aplica: true,
            dobles_programas_frecuentes: ["Matematicas", "Economia", "Ciencia de Datos"],
            compatibilidad_ciclo_basico: "Alta",
            tiempo_adicional_estimado_semestres: 2,
            dificultad_combinada: "Muy alta"
        },
        compatibilidad_doble_programa_aplica: true,
        opciones_alternativas: {
            minors: ["Analitica", "Emprendimiento", "Finanzas"],
            opciones_academicas: ["Seguridad Informatica", "Desarrollo de Producto"],
            enfasis: ["IA", "Software Empresarial", "Infraestructura"],
            certificaciones_interdisciplinarias: ["Cloud", "Analitica de Negocio"],
            rutas_flexibles_recomendadas: ["Sistemas + minor en Analitica", "Sistemas + opcion en Producto"]
        },
        posibilidad_extracreditacion: true,
        opciones_posgrado_relacionadas: {
            maestrias_coterminales: ["Maestria en Ingenieria de Sistemas y Computacion", "Maestria en Analitica para Inteligencia de Negocios"],
            opciones_de_grado: ["Curso de maestria", "Proyecto de ingenieria"],
            rutas_academicas_aceleradas: ["Coterminal en Analitica", "Ruta IA aplicada"]
        },
        becas_especificas: ["Fondo Quiero Estudiar", "Vamos Pa'lante"],
        financiacion_apoyos: {
            elegible_para_becas: true,
            financiacion_parcial_disponible: true,
            financiacion_completa_disponible: false,
            apoyos_permanencia_academica: true
        },
        riesgo_desercion: {
            nivel: "Alto",
            factores: ["Cadena de prerrequisitos en matematicas", "Alta exigencia en programacion inicial"]
        },
        intereses: ["tecnologia", "datos", "resolucion de problemas"],
        estilo_aprendizaje: ["proyectos", "autonomo"],
        tolerancia_carga_recomendada: "Alta"
    },
    {
        id: "economia",
        nombre: "Economia",
        area: "Administrativa y Economica",
        facultad: "Economia",
        area_color: areaColors["Administrativa y Economica"],
        creditos_totales: 136,
        descripcion_realista: "Programa con fuerte base cuantitativa y teorica. Enfatiza econometria, analisis de datos y politica publica.",
        perfil_estudiante_ideal: "Persona analitica, interesada en comprender sistemas economicos y usar evidencia para decidir.",
        habilidades_necesarias: ["Modelacion", "Lectura critica", "Estadistica", "Comunicacion escrita"],
        tipo_pensamiento_requerido: ["Analitico", "Cuantitativo", "Critico"],
        carga_academica_estimada: "Media-alta (42-50 horas semanales)",
        carga_academica_nivel: 4,
        dificultad_percibida: "Alta",
        carga_matematica: 5,
        carga_laboratorio: 1,
        carga_teorica: 5,
        cultura_academica_facultad: "Discusion basada en evidencia y alto estandar en argumentacion.",
        testimonios_simulados_realistas: [
            "Calculo y microeconomia definen el ritmo de la carrera desde el inicio.",
            "Econometria cambia la forma de ver problemas reales; no es solo teoria."
        ],
        materias_filtro: ["Calculo Diferencial", "Microeconomia I", "Econometria I"],
        materias_filtro_detalle: [
            { nombre: "Calculo Diferencial", semestre_tipico: 1, nivel_riesgo_academico: "Alto" },
            { nombre: "Microeconomia I", semestre_tipico: 2, nivel_riesgo_academico: "Alto" },
            { nombre: "Econometria I", semestre_tipico: 4, nivel_riesgo_academico: "Alto" }
        ],
        promedio_transferencia: {
            pga_minimo_general: 3.5,
            ruta_alternativa_creditos: "45 creditos con PGA >= 3.75",
            regla_recalculo: "Se mantienen en promedio solo cursos homologados en Economia."
        },
        recalculo_disponible: true,
        disponibilidad_edir: true,
        rutas_aterrizaje_suave: {
            cbu: ["Pensamiento Cientifico", "CBU Colombia"],
            cle: ["Introduccion a Politica Publica", "Finanzas Personales"],
            edir: ["Ruta Exploratoria Economica"],
            materias_exploratorias_compatibles: ["Matematicas para Ciencias Sociales", "Fundamentos de Economia"]
        },
        compatibilidad_doble_programa: {
            aplica: true,
            dobles_programas_frecuentes: ["Ingenieria Industrial", "Ciencia Politica", "Matematicas"],
            compatibilidad_ciclo_basico: "Alta",
            tiempo_adicional_estimado_semestres: 2,
            dificultad_combinada: "Alta"
        },
        compatibilidad_doble_programa_aplica: true,
        opciones_alternativas: {
            minors: ["Politica Publica", "Finanzas", "Ciencia de Datos"],
            opciones_academicas: ["Analitica Economica", "Gerencia Publica"],
            enfasis: ["Economia aplicada", "Desarrollo", "Mercados financieros"],
            certificaciones_interdisciplinarias: ["Impacto Social", "Analitica"],
            rutas_flexibles_recomendadas: ["Economia + minor en Datos", "Economia + opcion en Politicas"]
        },
        posibilidad_extracreditacion: true,
        opciones_posgrado_relacionadas: {
            maestrias_coterminales: ["Maestria en Economia", "Maestria en Politica Publica"],
            opciones_de_grado: ["Monografia", "Curso de maestria", "Seminario avanzado"],
            rutas_academicas_aceleradas: ["Coterminal en Economia", "Ruta Economia + Politica Publica"]
        },
        becas_especificas: ["Fondo Quiero Estudiar", "Vamos Pa'lante"],
        financiacion_apoyos: {
            elegible_para_becas: true,
            financiacion_parcial_disponible: true,
            financiacion_completa_disponible: false,
            apoyos_permanencia_academica: true
        },
        riesgo_desercion: {
            nivel: "Medio",
            factores: ["Exigencia cuantitativa en primeros semestres", "Curva de aprendizaje en econometria"]
        },
        intereses: ["politica publica", "datos", "economia"],
        estilo_aprendizaje: ["teorico", "analitico"],
        tolerancia_carga_recomendada: "Media-Alta"
    },
    {
        id: "microbiologia",
        nombre: "Microbiologia",
        area: "Cientifica",
        facultad: "Ciencias",
        area_color: areaColors["Cientifica"],
        creditos_totales: 137,
        descripcion_realista: "Programa de ciencias con laboratorios frecuentes, reporte tecnico y practicas experimentales desde etapas tempranas.",
        perfil_estudiante_ideal: "Persona rigurosa en metodo cientifico, cuidadosa con procedimientos y motivada por investigacion aplicada.",
        habilidades_necesarias: ["Metodo cientifico", "Trabajo de laboratorio", "Redaccion tecnica", "Disciplina"],
        tipo_pensamiento_requerido: ["Experimental", "Analitico", "Sistemico"],
        carga_academica_estimada: "Alta (45-53 horas semanales)",
        carga_academica_nivel: 5,
        dificultad_percibida: "Alta",
        carga_matematica: 3,
        carga_laboratorio: 5,
        carga_teorica: 4,
        cultura_academica_facultad: "Ambiente centrado en evidencia, practicas de laboratorio y trabajo detallado.",
        testimonios_simulados_realistas: [
            "Los laboratorios marcan el ritmo semanal; no se pueden dejar reportes para el final.",
            "Cuando entiendes bioquimica y genetica, la carrera se vuelve mas disfrutable."
        ],
        materias_filtro: ["Biologia Celular y de Microorganismos", "Genetica y Evolucion", "Practicas de Laboratorio Avanzadas"],
        materias_filtro_detalle: [
            { nombre: "Biologia Celular y de Microorganismos", semestre_tipico: 1, nivel_riesgo_academico: "Alto" },
            { nombre: "Genetica y Evolucion", semestre_tipico: 2, nivel_riesgo_academico: "Medio" },
            { nombre: "Practicas de Laboratorio Avanzadas", semestre_tipico: 4, nivel_riesgo_academico: "Alto" }
        ],
        promedio_transferencia: {
            pga_minimo_general: 3.5,
            ruta_alternativa_creditos: "45 creditos con PGA >= 3.75",
            regla_recalculo: "Aplicable al migrar; se conservan solo asignaturas homologables."
        },
        recalculo_disponible: true,
        disponibilidad_edir: true,
        rutas_aterrizaje_suave: {
            cbu: ["Pensamiento Cientifico", "CBU Cultura"],
            cle: ["Introduccion a Biotecnologia", "Bioetica"],
            edir: ["Ruta Exploratoria Ciencias de la Vida"],
            materias_exploratorias_compatibles: ["Biologia General", "Quimica Basica", "Metodologia de Investigacion"]
        },
        compatibilidad_doble_programa: {
            aplica: true,
            dobles_programas_frecuentes: ["Biologia", "Ingenieria Biomedica", "Quimica"],
            compatibilidad_ciclo_basico: "Media",
            tiempo_adicional_estimado_semestres: 3,
            dificultad_combinada: "Muy alta"
        },
        compatibilidad_doble_programa_aplica: true,
        opciones_alternativas: {
            minors: ["Salud Publica", "Biotecnologia", "Analitica"],
            opciones_academicas: ["Microbiologia Ambiental", "Bioinformatica"],
            enfasis: ["Industrial", "Biomedica", "Ambiental"],
            certificaciones_interdisciplinarias: ["Bioetica", "Buenas Practicas de Laboratorio"],
            rutas_flexibles_recomendadas: ["Microbiologia + minor en Salud Publica"]
        },
        posibilidad_extracreditacion: true,
        opciones_posgrado_relacionadas: {
            maestrias_coterminales: ["Maestria en Ciencias Biologicas", "Maestria en Epidemiologia"],
            opciones_de_grado: ["Trabajo de investigacion", "Curso de maestria"],
            rutas_academicas_aceleradas: ["Coterminal en Ciencias Biologicas"]
        },
        becas_especificas: ["Beca Preferente", "Fondo Quiero Estudiar", "Vamos Pa'lante"],
        financiacion_apoyos: {
            elegible_para_becas: true,
            financiacion_parcial_disponible: true,
            financiacion_completa_disponible: false,
            apoyos_permanencia_academica: true
        },
        riesgo_desercion: {
            nivel: "Alto",
            factores: ["Carga de laboratorio", "Demanda de reportes tecnicos constantes"]
        },
        intereses: ["ciencia", "salud", "investigacion"],
        estilo_aprendizaje: ["experimental", "estructurado"],
        tolerancia_carga_recomendada: "Alta"
    },
    {
        id: "arquitectura",
        nombre: "Arquitectura",
        area: "Creativa",
        facultad: "Arquitectura y Diseno",
        area_color: areaColors["Creativa"],
        creditos_totales: 153,
        descripcion_realista: "Carrera de alto compromiso horario con fuerte componente de taller, teoria espacial y representacion tecnica.",
        perfil_estudiante_ideal: "Persona con interes en ciudad, espacio y diseño, con disciplina para trabajo continuo.",
        habilidades_necesarias: ["Visualizacion espacial", "Comunicacion grafica", "Gestion del tiempo", "Trabajo en equipo"],
        tipo_pensamiento_requerido: ["Espacial", "Proyectual", "Critico"],
        carga_academica_estimada: "Muy alta (50-58 horas semanales)",
        carga_academica_nivel: 5,
        dificultad_percibida: "Alta",
        carga_matematica: 3,
        carga_laboratorio: 2,
        carga_teorica: 4,
        cultura_academica_facultad: "Taller intensivo, critica publica y cultura de produccion constante.",
        testimonios_simulados_realistas: [
            "Estructuras fue un punto de quiebre, pero entenderla mejora todos los proyectos.",
            "La clave es distribuir entregas y no acumular planos para la ultima noche."
        ],
        materias_filtro: ["Taller de Proyectos I", "Estructuras I", "Representacion Arquitectonica"],
        materias_filtro_detalle: [
            { nombre: "Taller de Proyectos I", semestre_tipico: 1, nivel_riesgo_academico: "Alto" },
            { nombre: "Estructuras I", semestre_tipico: 3, nivel_riesgo_academico: "Alto" },
            { nombre: "Representacion Arquitectonica", semestre_tipico: 1, nivel_riesgo_academico: "Medio" }
        ],
        promedio_transferencia: {
            pga_minimo_general: 3.5,
            ruta_alternativa_creditos: "45 creditos con PGA >= 3.75",
            regla_recalculo: "Permite excluir del promedio las no homologables al migrar."
        },
        recalculo_disponible: true,
        disponibilidad_edir: true,
        rutas_aterrizaje_suave: {
            cbu: ["Cultura, Artes y Humanidades", "Curso Colombia"],
            cle: ["Urbanismo Basico", "Dibujo Arquitectonico"],
            edir: ["Ruta Exploratoria Creativa y Espacial"],
            materias_exploratorias_compatibles: ["Introduccion a Arquitectura", "Fundamentos de Diseno"]
        },
        compatibilidad_doble_programa: {
            aplica: true,
            dobles_programas_frecuentes: ["Diseno", "Ingenieria Civil", "Historia del Arte"],
            compatibilidad_ciclo_basico: "Media",
            tiempo_adicional_estimado_semestres: 3,
            dificultad_combinada: "Muy alta"
        },
        compatibilidad_doble_programa_aplica: true,
        opciones_alternativas: {
            minors: ["Ciudades", "Gestion", "Sostenibilidad"],
            opciones_academicas: ["Urbanismo", "Construccion sostenible"],
            enfasis: ["Habitat", "Patrimonio", "Tecnologia"],
            certificaciones_interdisciplinarias: ["BIM", "Diseno sostenible"],
            rutas_flexibles_recomendadas: ["Arquitectura + minor en Ciudades"]
        },
        posibilidad_extracreditacion: true,
        opciones_posgrado_relacionadas: {
            maestrias_coterminales: ["Maestria en Arquitectura", "Maestria en Planeacion Urbana y Regional"],
            opciones_de_grado: ["Proyecto", "Curso de maestria"],
            rutas_academicas_aceleradas: ["Coterminal en Arquitectura"]
        },
        becas_especificas: ["Beca Preferente", "Fondo Quiero Estudiar", "Vamos Pa'lante"],
        financiacion_apoyos: {
            elegible_para_becas: true,
            financiacion_parcial_disponible: true,
            financiacion_completa_disponible: false,
            apoyos_permanencia_academica: true
        },
        riesgo_desercion: {
            nivel: "Alto",
            factores: ["Carga de entregas", "Ajuste al ritmo de taller"]
        },
        intereses: ["creatividad", "ciudad", "impacto social"],
        estilo_aprendizaje: ["proyectos", "visual"],
        tolerancia_carga_recomendada: "Alta"
    },
    {
        id: "psicologia",
        nombre: "Psicologia",
        area: "Social",
        facultad: "Ciencias Sociales",
        area_color: areaColors["Social"],
        creditos_totales: 132,
        descripcion_realista: "Programa flexible con rutas clinica, social y psicobiologica; requiere lectura, metodo y practica supervisada.",
        perfil_estudiante_ideal: "Persona empatica con rigor conceptual y capacidad de observacion y escucha.",
        habilidades_necesarias: ["Escucha activa", "Lectura critica", "Analisis de evidencia", "Escritura argumentativa"],
        tipo_pensamiento_requerido: ["Critico", "Reflexivo", "Analitico"],
        carga_academica_estimada: "Media-alta (38-47 horas semanales)",
        carga_academica_nivel: 4,
        dificultad_percibida: "Media-Alta",
        carga_matematica: 2,
        carga_laboratorio: 2,
        carga_teorica: 4,
        cultura_academica_facultad: "Debate teorico, analisis de casos y enfoque en contexto social.",
        testimonios_simulados_realistas: [
            "El CISO ayuda a ver la carrera con mas contexto antes de elegir enfasis.",
            "La opcion de tomar cursos de maestria en ultimo tramo es una ventaja grande."
        ],
        materias_filtro: ["Metodos de Investigacion", "Psicometria", "Neurociencia Basica"],
        materias_filtro_detalle: [
            { nombre: "Metodos de Investigacion", semestre_tipico: 2, nivel_riesgo_academico: "Medio" },
            { nombre: "Psicometria", semestre_tipico: 4, nivel_riesgo_academico: "Medio" },
            { nombre: "Neurociencia Basica", semestre_tipico: 3, nivel_riesgo_academico: "Medio" }
        ],
        promedio_transferencia: {
            pga_minimo_general: 3.5,
            ruta_alternativa_creditos: "45 creditos con PGA >= 3.75",
            regla_recalculo: "Recalculo disponible para homologables al transferirse."
        },
        recalculo_disponible: true,
        disponibilidad_edir: true,
        rutas_aterrizaje_suave: {
            cbu: ["Curso Colombia", "Cultura y Humanidades"],
            cle: ["Introduccion a Psicologia", "Bienestar y Salud Mental"],
            edir: ["Ruta Exploratoria Social"],
            materias_exploratorias_compatibles: ["CISO I", "Psicologia General"]
        },
        compatibilidad_doble_programa: {
            aplica: true,
            dobles_programas_frecuentes: ["Educacion", "Ciencia Politica", "Administracion"],
            compatibilidad_ciclo_basico: "Media",
            tiempo_adicional_estimado_semestres: 2,
            dificultad_combinada: "Media-Alta"
        },
        compatibilidad_doble_programa_aplica: true,
        opciones_alternativas: {
            minors: ["Salud Mental", "Educacion", "Politica Publica"],
            opciones_academicas: ["Intervencion social", "Psicologia organizacional"],
            enfasis: ["Clinica", "Social", "Psicobiologico"],
            certificaciones_interdisciplinarias: ["Acompanamiento psicosocial"],
            rutas_flexibles_recomendadas: ["Psicologia + minor en Educacion"]
        },
        posibilidad_extracreditacion: true,
        opciones_posgrado_relacionadas: {
            maestrias_coterminales: ["Maestria en Psicologia", "Maestria en Salud Publica"],
            opciones_de_grado: ["Practica avanzada", "Curso de maestria"],
            rutas_academicas_aceleradas: ["Coterminal en Psicologia"]
        },
        becas_especificas: ["Fondo Quiero Estudiar", "Vamos Pa'lante"],
        financiacion_apoyos: {
            elegible_para_becas: true,
            financiacion_parcial_disponible: true,
            financiacion_completa_disponible: false,
            apoyos_permanencia_academica: true
        },
        riesgo_desercion: {
            nivel: "Medio",
            factores: ["Carga de lectura y escritura", "Transicion entre enfoques teoricos"]
        },
        intereses: ["bienestar", "impacto social", "investigacion"],
        estilo_aprendizaje: ["teorico", "colaborativo"],
        tolerancia_carga_recomendada: "Media"
    },
    {
        id: "ciencia-datos",
        nombre: "Ciencia de Datos",
        area: "Ingenio",
        facultad: "Programa Interfacultades",
        area_color: areaColors["Ingenio"],
        creditos_totales: 134,
        descripcion_realista: "Programa transversal entre ingenieria, ciencias, economia y administracion; combina programacion, estadistica y negocio.",
        perfil_estudiante_ideal: "Persona con afinidad por datos, pensamiento cuantitativo y comunicacion de hallazgos.",
        habilidades_necesarias: ["Programacion", "Estadistica", "Comunicacion de insights", "Resolucion de problemas"],
        tipo_pensamiento_requerido: ["Cuantitativo", "Computacional", "Estrategico"],
        carga_academica_estimada: "Alta (44-52 horas semanales)",
        carga_academica_nivel: 4,
        dificultad_percibida: "Alta",
        carga_matematica: 5,
        carga_laboratorio: 2,
        carga_teorica: 4,
        cultura_academica_facultad: "Interdisciplinar, orientada a retos reales y toma de decisiones basada en evidencia.",
        testimonios_simulados_realistas: [
            "Es ideal si te gusta programar y traducir resultados para equipos no tecnicos.",
            "La carga sube cuando coinciden modelacion y cursos de negocio en el mismo semestre."
        ],
        materias_filtro: ["Probabilidad y Estadistica", "Programacion para Datos", "Modelos Predictivos"],
        materias_filtro_detalle: [
            { nombre: "Probabilidad y Estadistica", semestre_tipico: 2, nivel_riesgo_academico: "Alto" },
            { nombre: "Programacion para Datos", semestre_tipico: 2, nivel_riesgo_academico: "Alto" },
            { nombre: "Modelos Predictivos", semestre_tipico: 5, nivel_riesgo_academico: "Medio" }
        ],
        promedio_transferencia: {
            pga_minimo_general: 3.5,
            ruta_alternativa_creditos: "45 creditos con PGA >= 3.75",
            regla_recalculo: "Aplicable para limpiar promedio de cursos no homologables."
        },
        recalculo_disponible: true,
        disponibilidad_edir: true,
        rutas_aterrizaje_suave: {
            cbu: ["Pensamiento Cientifico", "CBU Colombia"],
            cle: ["Introduccion a Ciencia de Datos", "Visualizacion de Datos"],
            edir: ["Ruta Exploratoria Analitica"],
            materias_exploratorias_compatibles: ["Programacion Basica", "Estadistica I"]
        },
        compatibilidad_doble_programa: {
            aplica: true,
            dobles_programas_frecuentes: ["Economia", "Ingenieria de Sistemas", "Administracion"],
            compatibilidad_ciclo_basico: "Alta",
            tiempo_adicional_estimado_semestres: 2,
            dificultad_combinada: "Alta"
        },
        compatibilidad_doble_programa_aplica: true,
        opciones_alternativas: {
            minors: ["Analitica", "Politica Publica", "Finanzas"],
            opciones_academicas: ["Producto de Datos", "Analitica Social"],
            enfasis: ["Machine Learning", "Estrategia de Datos", "Analitica para negocios"],
            certificaciones_interdisciplinarias: ["Data Storytelling", "AI Product"],
            rutas_flexibles_recomendadas: ["Ciencia de Datos + minor en Finanzas"]
        },
        posibilidad_extracreditacion: true,
        opciones_posgrado_relacionadas: {
            maestrias_coterminales: ["Maestria en Analitica para Inteligencia de Negocios", "Maestria en Ingenieria de Sistemas y Computacion"],
            opciones_de_grado: ["Proyecto aplicado con empresa", "Curso de maestria"],
            rutas_academicas_aceleradas: ["Coterminal en Analitica"]
        },
        becas_especificas: ["Fondo Quiero Estudiar", "Vamos Pa'lante"],
        financiacion_apoyos: {
            elegible_para_becas: true,
            financiacion_parcial_disponible: true,
            financiacion_completa_disponible: false,
            apoyos_permanencia_academica: true
        },
        riesgo_desercion: {
            nivel: "Medio",
            factores: ["Doble exigencia tecnica y de negocio", "Base matematica alta"]
        },
        intereses: ["datos", "tecnologia", "negocio"],
        estilo_aprendizaje: ["proyectos", "analitico"],
        tolerancia_carga_recomendada: "Alta"
    },
    {
        id: "licenciatura-matematicas",
        nombre: "Licenciatura en Matematicas",
        area: "Social",
        facultad: "Educacion + Matematicas",
        area_color: areaColors["Social"],
        creditos_totales: 136,
        descripcion_realista: "Programa pedagogico-disciplinar que combina formacion en matematicas universitarias y didactica.",
        perfil_estudiante_ideal: "Persona con gusto por matematicas y vocacion por ensenar con impacto social.",
        habilidades_necesarias: ["Razonamiento logico", "Comunicacion pedagogica", "Paciencia", "Planeacion"],
        tipo_pensamiento_requerido: ["Logico", "Pedagogico", "Analitico"],
        carga_academica_estimada: "Media-alta (40-48 horas semanales)",
        carga_academica_nivel: 4,
        dificultad_percibida: "Media-Alta",
        carga_matematica: 4,
        carga_laboratorio: 1,
        carga_teorica: 4,
        cultura_academica_facultad: "Formacion interdisciplinaria entre contenido y didactica.",
        testimonios_simulados_realistas: [
            "La alianza con Matematicas da rigor real; no es solo pedagogia.",
            "La beca Decidi Ensenar reduce mucha presion financiera."
        ],
        materias_filtro: ["Calculo I", "Algebra Lineal", "Didactica de las Matematicas I"],
        materias_filtro_detalle: [
            { nombre: "Calculo I", semestre_tipico: 1, nivel_riesgo_academico: "Alto" },
            { nombre: "Algebra Lineal", semestre_tipico: 2, nivel_riesgo_academico: "Medio" },
            { nombre: "Didactica de las Matematicas I", semestre_tipico: 3, nivel_riesgo_academico: "Medio" }
        ],
        promedio_transferencia: {
            pga_minimo_general: 3.5,
            ruta_alternativa_creditos: "45 creditos con PGA >= 3.75",
            regla_recalculo: "Permite limpiar historial no homologable tras transferencia."
        },
        recalculo_disponible: true,
        disponibilidad_edir: true,
        rutas_aterrizaje_suave: {
            cbu: ["Pensamiento Cientifico", "Curso Colombia"],
            cle: ["Introduccion a Educacion", "Matematicas para Ciencias Sociales"],
            edir: ["Ruta Exploratoria Educacion y STEM"],
            materias_exploratorias_compatibles: ["Fundamentos de Educacion", "Matematicas Basicas"]
        },
        compatibilidad_doble_programa: {
            aplica: true,
            dobles_programas_frecuentes: ["Matematicas", "Fisica", "Ciencia de Datos"],
            compatibilidad_ciclo_basico: "Alta",
            tiempo_adicional_estimado_semestres: 2,
            dificultad_combinada: "Alta"
        },
        compatibilidad_doble_programa_aplica: true,
        opciones_alternativas: {
            minors: ["Educacion", "Analitica", "Ciencias"],
            opciones_academicas: ["Didactica STEM", "Tecnologia Educativa"],
            enfasis: ["Ensenanza escolar", "Formacion media"],
            certificaciones_interdisciplinarias: ["Evaluacion educativa"],
            rutas_flexibles_recomendadas: ["Licenciatura + minor en Analitica Educativa"]
        },
        posibilidad_extracreditacion: true,
        opciones_posgrado_relacionadas: {
            maestrias_coterminales: ["Maestria en Educacion", "Maestria en Matematicas"],
            opciones_de_grado: ["Curso de maestria", "Proyecto de innovacion pedagogica"],
            rutas_academicas_aceleradas: ["Coterminal en Educacion"]
        },
        becas_especificas: ["Beca Decidi Ensenar", "Fondo Quiero Estudiar", "Vamos Pa'lante"],
        financiacion_apoyos: {
            elegible_para_becas: true,
            financiacion_parcial_disponible: true,
            financiacion_completa_disponible: true,
            apoyos_permanencia_academica: true
        },
        riesgo_desercion: {
            nivel: "Medio",
            factores: ["Transicion a rigor matematico universitario", "Carga pedagogica adicional"]
        },
        intereses: ["educacion", "matematicas", "impacto social"],
        estilo_aprendizaje: ["estructurado", "colaborativo"],
        tolerancia_carga_recomendada: "Media-Alta"
    },
    {
        id: "geociencias",
        nombre: "Geociencias",
        area: "Cientifica",
        facultad: "Ciencias",
        area_color: areaColors["Cientifica"],
        creditos_totales: 132,
        descripcion_realista: "Programa que combina ciencia basica, trabajo de campo y modelacion de sistemas terrestres.",
        perfil_estudiante_ideal: "Persona interesada en fenomenos del planeta, observacion de campo y analisis cuantitativo.",
        habilidades_necesarias: ["Analisis de datos", "Trabajo de campo", "Metodo cientifico", "Trabajo en equipo"],
        tipo_pensamiento_requerido: ["Sistemico", "Experimental", "Analitico"],
        carga_academica_estimada: "Media-alta (40-49 horas semanales)",
        carga_academica_nivel: 4,
        dificultad_percibida: "Media-Alta",
        carga_matematica: 4,
        carga_laboratorio: 4,
        carga_teorica: 3,
        cultura_academica_facultad: "Aprendizaje mixto entre aula, laboratorio y salida de campo.",
        testimonios_simulados_realistas: [
            "El trabajo de campo es lo mejor de la carrera, pero exige planeacion logistica.",
            "Fisica y estadistica son claves para no quedarse atras."
        ],
        materias_filtro: ["Fisica I", "Geoquimica", "Metodos Cuantitativos en Geociencias"],
        materias_filtro_detalle: [
            { nombre: "Fisica I", semestre_tipico: 1, nivel_riesgo_academico: "Alto" },
            { nombre: "Geoquimica", semestre_tipico: 4, nivel_riesgo_academico: "Medio" },
            { nombre: "Metodos Cuantitativos en Geociencias", semestre_tipico: 3, nivel_riesgo_academico: "Alto" }
        ],
        promedio_transferencia: {
            pga_minimo_general: 3.5,
            ruta_alternativa_creditos: "45 creditos con PGA >= 3.75",
            regla_recalculo: "El recalculo conserva solo cursos homologables en Geociencias."
        },
        recalculo_disponible: true,
        disponibilidad_edir: true,
        rutas_aterrizaje_suave: {
            cbu: ["Pensamiento Cientifico", "CBU Cultura"],
            cle: ["Introduccion a Geociencias", "Cambio Climatico y Sociedad"],
            edir: ["Ruta Exploratoria Ciencias de la Tierra"],
            materias_exploratorias_compatibles: ["Geologia General", "Estadistica Basica"]
        },
        compatibilidad_doble_programa: {
            aplica: true,
            dobles_programas_frecuentes: ["Ingenieria Ambiental", "Biologia", "Economia"],
            compatibilidad_ciclo_basico: "Media",
            tiempo_adicional_estimado_semestres: 3,
            dificultad_combinada: "Alta"
        },
        compatibilidad_doble_programa_aplica: true,
        opciones_alternativas: {
            minors: ["Sostenibilidad", "Datos", "Gestion Publica"],
            opciones_academicas: ["Riesgo climatico", "Recursos naturales"],
            enfasis: ["Geociencias aplicadas", "Modelacion"],
            certificaciones_interdisciplinarias: ["Gestor de riesgo", "GIS"],
            rutas_flexibles_recomendadas: ["Geociencias + minor en Sostenibilidad"]
        },
        posibilidad_extracreditacion: true,
        opciones_posgrado_relacionadas: {
            maestrias_coterminales: ["Maestria en Ciencias de la Tierra", "Maestria en Ingenieria Ambiental"],
            opciones_de_grado: ["Investigacion aplicada", "Curso de maestria"],
            rutas_academicas_aceleradas: ["Coterminal en Ciencias de la Tierra"]
        },
        becas_especificas: ["Beca Geociencias", "Beca Preferente", "Fondo Quiero Estudiar", "Vamos Pa'lante"],
        financiacion_apoyos: {
            elegible_para_becas: true,
            financiacion_parcial_disponible: true,
            financiacion_completa_disponible: false,
            apoyos_permanencia_academica: true
        },
        riesgo_desercion: {
            nivel: "Medio",
            factores: ["Demandas de campo y laboratorio", "Base cuantitativa requerida"]
        },
        intereses: ["ciencia", "medio ambiente", "impacto social"],
        estilo_aprendizaje: ["experimental", "proyectos"],
        tolerancia_carga_recomendada: "Media-Alta"
    }
];

export const flowByStudentType = {
    aspirante: {
        titulo: "Ruta para Aspirantes",
        pasos: [
            "Exploracion vocacional guiada por intereses, habilidades y estilo de aprendizaje.",
            "Comparador de carreras por carga real, materias filtro y cultura de facultad.",
            "Simulador financiero para anticipar becas y apoyos de permanencia."
        ]
    },
    activo: {
        titulo: "Ruta para Estudiantes Activos",
        pasos: [
            "Simulador de transferencia con recalculo de promedio.",
            "Planeador de doble programa y extracreditacion (> 4.0).",
            "Mapa de coterminales y rutas de grado aceleradas."
        ]
    },
    riesgo: {
        titulo: "Ruta para Riesgo Academico",
        pasos: [
            "Identificacion de materias filtro con alertas tempranas de permanencia.",
            "Simulador de borron y cuenta nueva para cambio estrategico de programa.",
            "Recomendador de aterrizaje suave con CBU, CLE, EDIR y apoyos financieros."
        ]
    }
};

export function getAvailableAreas(careers = careerBankSeed) {
    return [...new Set(careers.map((career) => career.area))].sort((a, b) => a.localeCompare(b));
}

export function suggestScholarships(career, studentProfile) {
    const suggested = new Set(career?.becas_especificas || []);
    const financialLevel = studentProfile?.necesidad_financiera || "media";
    const average = Number(studentProfile?.promedio || 0);

    if (financialLevel !== "baja") {
        suggested.add("Fondo Quiero Estudiar");
        suggested.add("Vamos Pa'lante");
    }
    if ((career?.nombre || "").toLowerCase().includes("licenciatura")) {
        suggested.add("Beca Decidi Ensenar");
    }
    if (["Cientifica", "Creativa"].includes(career?.area || "")) {
        suggested.add("Beca Preferente");
    }
    if ((career?.nombre || "").toLowerCase().includes("geociencias")) {
        suggested.add("Beca Geociencias");
    }
    if (average >= 4.0) {
        suggested.add("Extracreditacion potencial para doble programa");
    }

    return [...suggested];
}

function overlapScore(selected = [], available = []) {
    if (!selected.length || !available.length) return 0;
    const selectedSet = new Set(selected.map((item) => item.toLowerCase()));
    return available.reduce((score, item) => (selectedSet.has(item.toLowerCase()) ? score + 1 : score), 0);
}

export function recommendCareers(careers, preferences) {
    const interests = preferences?.intereses || [];
    const learningStyle = preferences?.estilo_aprendizaje || "";
    const tolerance = preferences?.tolerancia_carga || "";

    return careers
        .map((career) => {
            let score = overlapScore(interests, career.intereses) * 3;
            score += overlapScore(preferences?.habilidades || [], career.habilidades_necesarias) * 2;

            const styleMatch = (career.estilo_aprendizaje || []).some(
                (style) => style.toLowerCase() === learningStyle.toLowerCase()
            );
            if (learningStyle && styleMatch) score += 2;

            if (tolerance && (career.tolerancia_carga_recomendada || "").toLowerCase().includes(tolerance.toLowerCase())) {
                score += 2;
            }

            return {
                career,
                score,
                resumen: [
                    `Coincidencia por intereses: ${overlapScore(interests, career.intereses)}`,
                    `Coincidencia por habilidades: ${overlapScore(preferences?.habilidades || [], career.habilidades_necesarias)}`,
                    `Alineacion por estilo: ${styleMatch ? "Si" : "No"}`
                ]
            };
        })
        .sort((a, b) => b.score - a.score);
}

export function riskLevelToNumber(level = "Medio") {
    const map = { Bajo: 1, Medio: 2, "Medio-Alto": 3, Alto: 4, "Muy alta": 5, "Muy alto": 5 };
    return map[level] || 2;
}
