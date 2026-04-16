export const LAB_PHASES = [
    {
        id: "contexto",
        label: "Contexto",
        total: 5,
        fallbackQuestions: [
            "Cuando tienes una semana exigente, ¿como priorizas tus responsabilidades academicas?",
            "¿Que actividad te hace sentir mas concentrado durante mas tiempo?",
            "En que momento del dia rindes mejor para estudiar y por que?",
            "¿Que tipo de retroalimentacion te ayuda a mejorar mas rapido?",
            "¿Que condicion del entorno afecta mas tu rendimiento academico?"
        ]
    },
    {
        id: "afinidad",
        label: "Afinidad",
        total: 9,
        fallbackQuestions: [
            "¿Te motiva mas resolver problemas tecnicos o comprender fenomenos humanos?",
            "¿Disfrutas mas crear soluciones nuevas o optimizar procesos existentes?",
            "¿Que tan comodo te sientes trabajando con datos cuantitativos?",
            "¿Que tan natural te resulta argumentar ideas complejas por escrito?",
            "¿Te interesa trabajar en proyectos con alto impacto social?",
            "Cuando aprendes algo nuevo, ¿prefieres teoria primero o practica inmediata?",
            "¿Te atraen entornos con laboratorio, prototipado o experimentacion?",
            "¿Que tan importante es para ti integrar tecnologia con otras disciplinas?",
            "¿Que tipo de desafios te hacen entrar en estado de alto enfoque?"
        ]
    },
    {
        id: "retos_situacionales",
        label: "Retos Situacionales",
        total: 5,
        fallbackQuestions: [
            "Si repruebas una materia filtro, ¿como reorganizas tu plan academico?",
            "¿Como reaccionas cuando un equipo no cumple y afecta tu proyecto?",
            "Si debes elegir entre carga alta o promedio alto, ¿como decides?",
            "Cuando una clase te supera, ¿que estrategia usas en las primeras dos semanas?",
            "¿Que haces para sostener salud mental en periodos de evaluacion intensa?"
        ]
    },
    {
        id: "estrategicas_uniandes",
        label: "Estrategicas Uniandes",
        total: 4,
        fallbackQuestions: [
            "¿Considerarias transferencia interna si descubres mayor ajuste vocacional en otra carrera?",
            "¿Que tan dispuesto estas a usar CBU, CLE o EDIR para una transicion academica inteligente?",
            "¿Te interesa doble programa o prefieres una ruta flexible con minor y opciones academicas?",
            "Si tu promedio supera 4.0, ¿como usarias la extracreditacion para acelerar tu perfil?"
        ]
    }
];

export const TOTAL_INTERACTIONS = LAB_PHASES.reduce((sum, phase) => sum + phase.total, 0);

export function getPhaseMetaByQuestionIndex(questionIndex) {
    let accumulated = 0;

    for (const phase of LAB_PHASES) {
        const nextAccumulated = accumulated + phase.total;
        if (questionIndex < nextAccumulated) {
            return {
                phaseId: phase.id,
                phaseLabel: phase.label,
                phaseIndex: LAB_PHASES.findIndex((candidate) => candidate.id === phase.id),
                questionInPhase: questionIndex - accumulated + 1,
                totalInPhase: phase.total,
                fallbackQuestion:
                    phase.fallbackQuestions[(questionIndex - accumulated) % phase.fallbackQuestions.length]
            };
        }
        accumulated = nextAccumulated;
    }

    const lastPhase = LAB_PHASES[LAB_PHASES.length - 1];
    return {
        phaseId: lastPhase.id,
        phaseLabel: lastPhase.label,
        phaseIndex: LAB_PHASES.length - 1,
        questionInPhase: lastPhase.total,
        totalInPhase: lastPhase.total,
        fallbackQuestion: lastPhase.fallbackQuestions[lastPhase.fallbackQuestions.length - 1]
    };
}

