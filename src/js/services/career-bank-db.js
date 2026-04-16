import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    query,
    setDoc,
    where
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "./auth.js";
import { careerBankSeed, riskLevelToNumber } from "../data/career-bank-seed.js";

const CAREERS_COLLECTION = "carreras";

function normalizeCareer(snapshot) {
    return {
        id: snapshot.id,
        ...snapshot.data()
    };
}

function matchesFilters(career, filters = {}) {
    const areaMatch = !filters.area || filters.area === "Todas" || career.area === filters.area;
    const mathMatch = !filters.mathMin || Number(career.carga_matematica || 0) >= Number(filters.mathMin);
    const difficultyMatch =
        !filters.dificultad || filters.dificultad === "Todas" || career.dificultad_percibida === filters.dificultad;
    const labMatch = !filters.laboratorioMin || Number(career.carga_laboratorio || 0) >= Number(filters.laboratorioMin);
    const transferMatch =
        filters.recalculo === undefined || filters.recalculo === null
            ? true
            : Boolean(career.recalculo_disponible) === Boolean(filters.recalculo);
    const extracreditacionMatch =
        filters.extracreditacion === undefined || filters.extracreditacion === null
            ? true
            : Boolean(career.posibilidad_extracreditacion) === Boolean(filters.extracreditacion);
    const dobleMatch =
        filters.doblePrograma === undefined || filters.doblePrograma === null
            ? true
            : Boolean(career.compatibilidad_doble_programa_aplica) === Boolean(filters.doblePrograma);
    const edirMatch =
        filters.edirDisponible === undefined || filters.edirDisponible === null
            ? true
            : Boolean(career.disponibilidad_edir) === Boolean(filters.edirDisponible);

    const styleMatch =
        !filters.estiloAprendizaje ||
        filters.estiloAprendizaje === "todos" ||
        (career.estilo_aprendizaje || []).some((style) => style === filters.estiloAprendizaje);

    const toleranceMatch =
        !filters.tolerancia ||
        filters.tolerancia === "todas" ||
        (career.tolerancia_carga_recomendada || "").toLowerCase().includes(filters.tolerancia.toLowerCase());

    const becaMatch =
        !filters.beca ||
        filters.beca === "todas" ||
        (career.becas_especificas || []).some((beca) => beca.toLowerCase().includes(filters.beca.toLowerCase()));

    const materiaFiltro = (filters.materiaFiltro || "").toLowerCase().trim();
    const bottleneckMatch =
        !materiaFiltro ||
        (career.materias_filtro || []).some((subject) => subject.toLowerCase().includes(materiaFiltro));

    const maxRisk = Number(filters.riesgoMax || 5);
    const riskMatch = riskLevelToNumber(career.riesgo_desercion?.nivel) <= maxRisk;

    const interestMatch =
        !filters.intereses?.length ||
        filters.intereses.some((interest) => (career.intereses || []).includes(interest));

    const skillMatch =
        !filters.habilidades?.length ||
        filters.habilidades.some((skill) =>
            (career.habilidades_necesarias || []).some((required) =>
                required.toLowerCase().includes(skill.toLowerCase())
            )
        );

    const coterminalMatch =
        filters.coterminal === undefined || filters.coterminal === null
            ? true
            : Boolean((career.opciones_posgrado_relacionadas?.maestrias_coterminales || []).length) ===
              Boolean(filters.coterminal);

    return (
        areaMatch &&
        mathMatch &&
        difficultyMatch &&
        labMatch &&
        transferMatch &&
        extracreditacionMatch &&
        dobleMatch &&
        edirMatch &&
        styleMatch &&
        toleranceMatch &&
        becaMatch &&
        bottleneckMatch &&
        riskMatch &&
        interestMatch &&
        skillMatch &&
        coterminalMatch
    );
}

function buildFirestoreQuery(filters = {}) {
    const constraints = [limit(120)];

    if (filters.area && filters.area !== "Todas") {
        constraints.push(where("area", "==", filters.area));
    }
    if (filters.dificultad && filters.dificultad !== "Todas") {
        constraints.push(where("dificultad_percibida", "==", filters.dificultad));
    }
    if (filters.recalculo !== undefined && filters.recalculo !== null) {
        constraints.push(where("recalculo_disponible", "==", Boolean(filters.recalculo)));
    }
    if (filters.extracreditacion !== undefined && filters.extracreditacion !== null) {
        constraints.push(where("posibilidad_extracreditacion", "==", Boolean(filters.extracreditacion)));
    }
    if (filters.doblePrograma !== undefined && filters.doblePrograma !== null) {
        constraints.push(where("compatibilidad_doble_programa_aplica", "==", Boolean(filters.doblePrograma)));
    }

    return query(collection(db, CAREERS_COLLECTION), ...constraints);
}

export async function getCareers(filters = {}) {
    try {
        const fireQuery = buildFirestoreQuery(filters);
        const snapshot = await getDocs(fireQuery);
        const careers = snapshot.docs.map(normalizeCareer);

        if (!careers.length) {
            return careerBankSeed.filter((career) => matchesFilters(career, filters));
        }

        return careers.filter((career) => matchesFilters(career, filters));
    } catch (error) {
        console.warn("Fallo lectura Firestore para carreras. Se usa seed local.", error);
        return careerBankSeed.filter((career) => matchesFilters(career, filters));
    }
}

export async function getCareerById(careerId) {
    try {
        const reference = doc(db, CAREERS_COLLECTION, careerId);
        const snapshot = await getDoc(reference);
        if (snapshot.exists()) {
            return normalizeCareer(snapshot);
        }
    } catch (error) {
        console.warn("No se pudo cargar la carrera desde Firestore.", error);
    }

    return careerBankSeed.find((career) => career.id === careerId) || null;
}

export async function seedCareerBankCollection(seed = careerBankSeed) {
    const operations = seed.map((career) => {
        const reference = doc(db, CAREERS_COLLECTION, career.id);
        return setDoc(reference, career, { merge: true });
    });

    await Promise.all(operations);
    return seed.length;
}

