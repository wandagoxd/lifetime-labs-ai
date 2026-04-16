export const POTENTIAL_REPORT_SCHEMA = {
    name: "lifetime_potential_report",
    strict: true,
    schema: {
        type: "object",
        additionalProperties: false,
        properties: {
            profile_summary: { type: "string" },
            top_strengths: {
                type: "array",
                items: { type: "string" }
            },
            career_matches: {
                type: "array",
                items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                        id: { type: "string" },
                        name: { type: "string" },
                        score: { type: "number" },
                        reason: { type: "string" }
                    },
                    required: ["id", "name", "score", "reason"]
                }
            },
            career_match_ids: {
                type: "array",
                items: { type: "string" }
            },
            graduate_similarity: {
                type: "object",
                additionalProperties: false,
                properties: {
                    match_percentage: { type: "number" },
                    career: { type: "string" },
                    sector: { type: "string" },
                    insight: { type: "string" }
                },
                required: ["match_percentage", "career", "sector", "insight"]
            },
            academic_alerts: {
                type: "array",
                items: { type: "string" }
            },
            recommended_route: {
                type: "array",
                items: { type: "string" }
            },
            visual_competency_scores: {
                type: "object",
                additionalProperties: false,
                properties: {
                    pensamiento_critico: { type: "number" },
                    empatia: { type: "number" },
                    analisis_tecnico: { type: "number" },
                    creatividad: { type: "number" }
                },
                required: ["pensamiento_critico", "empatia", "analisis_tecnico", "creatividad"]
            },
            bank_redirect_url: { type: "string" }
        },
        required: [
            "profile_summary",
            "top_strengths",
            "career_matches",
            "career_match_ids",
            "graduate_similarity",
            "academic_alerts",
            "recommended_route",
            "visual_competency_scores",
            "bank_redirect_url"
        ]
    }
};

function getSafeTopCareer(careerMatches = [], index = 0) {
    const defaultCareers = [
        { id: "ingenieria-biomedica", name: "Ingenieria Biomedica", score: 86, reason: "Combinas analisis tecnico con enfoque de impacto social en salud." },
        { id: "medicina", name: "Medicina", score: 82, reason: "Muestras disciplina academica y alta resiliencia frente a contextos exigentes." },
        { id: "psicologia", name: "Psicologia", score: 80, reason: "Tu lectura contextual y empatia sostienen una ruta de intervencion humana." }
    ];
    return careerMatches[index] || defaultCareers[index];
}

export function buildFallbackReport(turns = []) {
    const averageLength = turns.length
        ? turns.reduce((acc, turn) => acc + (turn.answer || "").length, 0) / turns.length
        : 120;
    const scoreModifier = Math.min(10, Math.round(averageLength / 40));

    const fallbackMatches = [
        { id: "ingenieria-biomedica", name: "Ingenieria Biomedica", score: 78 + scoreModifier, reason: "Combinas pensamiento sistemico, disciplina academica y orientacion a impacto social." },
        { id: "medicina", name: "Medicina", score: 74 + scoreModifier, reason: "Muestras resiliencia ante escenarios exigentes y compromiso de largo plazo." },
        { id: "psicologia", name: "Psicologia", score: 72 + scoreModifier, reason: "Tu lectura situacional y empatia son fuertes para contextos humanos complejos." }
    ];

    return {
        profile_summary:
            "Tu perfil refleja combinacion de pensamiento sistemico, resiliencia academica y capacidad de adaptacion frente a retos de alta exigencia.",
        top_strengths: [
            "Resiliencia frente a carga academica",
            "Pensamiento critico aplicado",
            "Capacidad de aprendizaje autonomo"
        ],
        career_matches: fallbackMatches,
        career_match_ids: fallbackMatches.map((career) => career.id),
        graduate_similarity: {
            match_percentage: 88,
            career: getSafeTopCareer(fallbackMatches, 2).name,
            sector: "Organizaciones internacionales",
            insight:
                "Tu forma de analizar contexto y sostener compromiso bajo presion coincide con egresados orientados a impacto global."
        },
        academic_alerts: [
            "Alta carga matematica en tramos iniciales",
            "Exposicion a laboratorios o practicas intensivas",
            "Intensidad teorica sostenida por semestre"
        ],
        recommended_route: [
            "Explorar CLE y CBU alineados con salud y analitica",
            "Evaluar minor complementario antes de doble programa",
            "Priorizar materias filtro en primeros semestres"
        ],
        visual_competency_scores: {
            pensamiento_critico: 82,
            empatia: 76,
            analisis_tecnico: 80,
            creatividad: 74
        },
        bank_redirect_url: `/banco?carreras=${fallbackMatches.map((career) => career.id).join(",")}`
    };
}

