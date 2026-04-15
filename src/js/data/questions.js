export const contextQuestions = [
    {
        id: "ocupacion_actual",
        title: "Contexto",
        question: "¿Cuál describe mejor tu actividad principal en los últimos 3 meses?",
        options: [
            { text: "Estudio en colegio primaria", value: "estudio-primaria" },
            { text: "Estudio en colegio secundaria", value: "estudio-secundaria" },
            { text: "Estudio en colegio bachillerato: 10° - 11°", value: "estudio-bachillerato" },
            { text: "Estudio en Universidad o Educación Superior", value: "estudio-universidad" },
            { text: "Trabajo con horario definido", value: "empleo" },
            { text: "Trabajo independiente o emprendimiento", value: "independiente" },
            { text: "Sin actividad principal estable", value: "sin_estructura" }
        ]
    },

    {
        id: "aprendizaje_reciente",
        title: "Aprendizaje",
        question: "En los últimos 30 días, ¿cuántos días dedicaste tiempo a aprender algo por tu cuenta?",
        options: [
            { text: "Más de 10 días", value: "alto" },
            { text: "Entre 3 y 10 días", value: "medio" },
            { text: "Menos de 3 días", value: "bajo" }
        ]
    },

    {
        id: "tiempo_libre",
        title: "Disponibilidad",
        question: "En promedio, ¿cuántas horas libres tienes al día entre semana?",
        options: [
            { text: "Menos de 1 hora", value: "muy_poco" },
            { text: "Entre 1 y 3 horas", value: "medio" },
            { text: "Más de 3 horas", value: "alto" }
        ]
    },

    {
        id: "uso_tiempo_libre",
        title: "Uso del tiempo",
        question: "La mayor parte de tu tiempo libre la usas en:",
        options: [
            { text: "Descanso o entretenimiento", value: "descanso" },
            { text: "Actividades sociales", value: "social" },
            { text: "Aprendizaje o proyectos personales", value: "productivo" }
        ]
    },

    {
        id: "energia_dia",
        title: "Energía",
        question: "Durante la mayor parte de la semana, ¿cómo te sientes al iniciar el día?",
        options: [
            { text: "Con energía suficiente para empezar", value: "alta" },
            { text: "Variable según el día", value: "media" },
            { text: "Con poca energía o cansancio", value: "baja" }
        ]
    },

    {
        id: "claridad_objetivos",
        title: "Dirección",
        question: "Actualmente, ¿qué tan claro tienes lo que quieres lograr en los próximos 6 meses?",
        options: [
            { text: "Tengo objetivos definidos", value: "claro" },
            { text: "Tengo ideas generales", value: "parcial" },
            { text: "No tengo claridad aún", value: "difuso" }
        ]
    },

    {
        id: "accion_reciente",
        title: "Acción",
        question: "En los últimos 7 días, ¿tomaste alguna acción concreta hacia un objetivo personal?",
        options: [
            { text: "Sí, varias acciones", value: "alto" },
            { text: "Sí, una o dos acciones", value: "medio" },
            { text: "No", value: "bajo" }
        ]
    }
];

export const baseQuestion = [
    {
        id: "inversion_riesgo",
        title: "Riesgo-Seguridad",
        question: "Tienes $1,000. ¿Los inviertes en una rifa con 10% de probabilidad de ganar un millón, o los guardas para comprar comida segura por un mes? Justifica.",
        options: [
            { text: "Tengo objetivos definidos", value: "claro" },
            { text: "Tengo ideas generales", value: "parcial" },
            { text: "No tengo claridad aún", value: "difuso" }
        ]
    }
]