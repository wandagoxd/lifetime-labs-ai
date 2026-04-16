import {
    careerBankSeed,
    flowByStudentType,
    getAvailableAreas,
    recommendCareers,
    suggestScholarships
} from "../data/career-bank-seed.js";
import { subscribeToAuthChanges } from "../services/auth.js";
import { getCareers } from "../services/career-bank-db.js";

const state = {
    careers: [],
    filteredCareers: [],
    selectedCareerId: null,
    studentType: "aspirante",
    simulatorCourses: [
        { id: "course-1", nombre: "Calculo I", creditos: 3, nota: 2.8, homologable: false, problematica: true },
        { id: "course-2", nombre: "CBU Cultura", creditos: 2, nota: 4.2, homologable: true, problematica: false },
        { id: "course-3", nombre: "IP", creditos: 3, nota: 2.9, homologable: false, problematica: true },
        { id: "course-4", nombre: "Escritura Universitaria", creditos: 3, nota: 4.0, homologable: true, problematica: false }
    ],
    user: null,
    comparatorBound: false
};

const difficultyOptions = ["Todas", "Media-Alta", "Alta"];
const learningStyles = ["todos", "proyectos", "teorico", "experimental", "analitico", "colaborativo", "autonomo", "visual", "estructurado"];
const toleranceOptions = ["todas", "media", "media-alta", "alta"];
const interestOptions = ["creatividad", "datos", "tecnologia", "impacto social", "ciencia", "medio ambiente", "economia", "educacion", "salud", "bienestar", "ciudad", "investigacion", "politica publica", "negocio"];
const skillOptions = ["Programacion", "Pensamiento logico", "Comunicacion visual", "Lectura critica", "Metodo cientifico", "Escucha activa", "Trabajo colaborativo", "Razonamiento logico"];

function querySelector(selector) {
    return document.querySelector(selector);
}

function querySelectorAll(selector) {
    return Array.from(document.querySelectorAll(selector));
}

function renderStudentFlow() {
    const container = querySelector("#student-flow-content");
    if (!container) return;

    const flow = flowByStudentType[state.studentType];
    container.innerHTML = `
        <h3 class="font-headline text-xl font-extrabold text-primary">${flow.titulo}</h3>
        <ul class="mt-3 space-y-2 text-sm text-slate-700">
            ${flow.pasos.map((step) => `<li class="flex gap-2"><span class="mt-1 h-2 w-2 rounded-full bg-primary"></span><span>${step}</span></li>`).join("")}
        </ul>
    `;
}

function bindStudentTypeButtons() {
    querySelectorAll("[data-student-type]").forEach((button) => {
        button.addEventListener("click", () => {
            state.studentType = button.dataset.studentType;
            querySelectorAll("[data-student-type]").forEach((candidate) => {
                candidate.classList.remove("bg-primary", "text-white");
                candidate.classList.add("bg-white", "text-slate-600");
            });
            button.classList.remove("bg-white", "text-slate-600");
            button.classList.add("bg-primary", "text-white");
            renderStudentFlow();
        });
    });
}

function populateFilterOptions(careers) {
    const areaSelect = querySelector("#filter-area");
    const difficultySelect = querySelector("#filter-difficulty");
    const learningSelect = querySelector("#filter-learning-style");
    const toleranceSelect = querySelector("#filter-tolerance");
    const scholarshipSelect = querySelector("#filter-scholarship");

    if (areaSelect) {
        const areas = ["Todas", ...getAvailableAreas(careers)];
        areaSelect.innerHTML = areas.map((area) => `<option value="${area}">${area}</option>`).join("");
    }
    if (difficultySelect) {
        difficultySelect.innerHTML = difficultyOptions.map((option) => `<option value="${option}">${option}</option>`).join("");
    }
    if (learningSelect) {
        learningSelect.innerHTML = learningStyles.map((option) => `<option value="${option}">${option}</option>`).join("");
    }
    if (toleranceSelect) {
        toleranceSelect.innerHTML = toleranceOptions.map((option) => `<option value="${option}">${option}</option>`).join("");
    }
    if (scholarshipSelect) {
        const scholarshipSet = new Set();
        careers.forEach((career) => (career.becas_especificas || []).forEach((beca) => scholarshipSet.add(beca)));
        const scholarshipOptions = ["todas", ...Array.from(scholarshipSet).sort((a, b) => a.localeCompare(b))];
        scholarshipSelect.innerHTML = scholarshipOptions.map((option) => `<option value="${option}">${option}</option>`).join("");
    }
}

function populateCheckboxes() {
    const interestsContainer = querySelector("#interests-checkboxes");
    const skillsContainer = querySelector("#skills-checkboxes");
    const recommendationInterests = querySelector("#recommend-interests");
    const recommendationSkills = querySelector("#recommend-skills");

    const buildMarkup = (items, name) =>
        items
            .map(
                (item) => `
                <label class="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600">
                    <input class="rounded border-slate-300 text-primary focus:ring-primary" type="checkbox" name="${name}" value="${item}" />
                    ${item}
                </label>
            `
            )
            .join("");

    if (interestsContainer) interestsContainer.innerHTML = buildMarkup(interestOptions, "filter-interest");
    if (skillsContainer) skillsContainer.innerHTML = buildMarkup(skillOptions, "filter-skill");
    if (recommendationInterests) recommendationInterests.innerHTML = buildMarkup(interestOptions, "recommend-interest");
    if (recommendationSkills) recommendationSkills.innerHTML = buildMarkup(skillOptions, "recommend-skill");
}

function collectCheckedValues(name) {
    return querySelectorAll(`input[name="${name}"]:checked`).map((checkbox) => checkbox.value);
}

function readFilters() {
    const parseBoolean = (value) => {
        if (value === "all") return null;
        if (value === "yes") return true;
        if (value === "no") return false;
        return null;
    };

    return {
        area: querySelector("#filter-area")?.value || "Todas",
        dificultad: querySelector("#filter-difficulty")?.value || "Todas",
        mathMin: Number(querySelector("#filter-math")?.value || 0),
        laboratorioMin: Number(querySelector("#filter-lab")?.value || 0),
        materiaFiltro: querySelector("#filter-bottleneck")?.value || "",
        doblePrograma: parseBoolean(querySelector("#filter-double-program")?.value || "all"),
        edirDisponible: parseBoolean(querySelector("#filter-edir")?.value || "all"),
        estiloAprendizaje: querySelector("#filter-learning-style")?.value || "todos",
        tolerancia: querySelector("#filter-tolerance")?.value || "todas",
        extracreditacion: parseBoolean(querySelector("#filter-extracreditacion")?.value || "all"),
        recalculo: parseBoolean(querySelector("#filter-recalculo")?.value || "all"),
        coterminal: parseBoolean(querySelector("#filter-coterminal")?.value || "all"),
        riesgoMax: Number(querySelector("#filter-risk")?.value || 5),
        beca: querySelector("#filter-scholarship")?.value || "todas",
        intereses: collectCheckedValues("filter-interest"),
        habilidades: collectCheckedValues("filter-skill")
    };
}

function getRiskBadge(level = "Medio") {
    const levelMap = {
        Bajo: "bg-emerald-100 text-emerald-700",
        Medio: "bg-amber-100 text-amber-800",
        "Medio-Alto": "bg-orange-100 text-orange-700",
        Alto: "bg-rose-100 text-rose-700",
        "Muy alto": "bg-rose-100 text-rose-700"
    };
    const css = levelMap[level] || "bg-slate-100 text-slate-700";
    return `<span class="rounded-full px-2 py-1 text-[11px] font-bold ${css}">${level}</span>`;
}

function renderCareerList() {
    const list = querySelector("#career-list");
    const count = querySelector("#results-count");
    if (!list || !count) return;

    count.textContent = `${state.filteredCareers.length} carreras coinciden con tus filtros`;

    if (!state.filteredCareers.length) {
        list.innerHTML = `
            <article class="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
                No hay coincidencias con estos filtros. Ajusta matematicas, riesgo o materias filtro para ampliar resultados.
            </article>
        `;
        return;
    }

    list.innerHTML = state.filteredCareers
        .map(
            (career) => `
            <article class="career-card rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div class="flex items-start justify-between gap-3">
                    <div>
                        <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">${career.area}</p>
                        <h3 class="mt-1 font-headline text-lg font-extrabold text-slate-800">${career.nombre}</h3>
                        <p class="mt-1 text-xs text-slate-500">${career.facultad || "Uniandes"}</p>
                    </div>
                    ${getRiskBadge(career.riesgo_desercion?.nivel)}
                </div>
                <p class="mt-3 text-sm text-slate-700">${career.descripcion_realista}</p>
                <div class="mt-4 grid grid-cols-3 gap-2 text-[11px] font-semibold text-slate-600">
                    <span class="rounded-md bg-slate-100 px-2 py-1">Math ${career.carga_matematica}/5</span>
                    <span class="rounded-md bg-slate-100 px-2 py-1">Lab ${career.carga_laboratorio}/5</span>
                    <span class="rounded-md bg-slate-100 px-2 py-1">Creditos ${career.creditos_totales}</span>
                </div>
                <div class="mt-4 flex flex-wrap gap-2">
                    ${(career.materias_filtro || []).slice(0, 2).map((subject) => `<span class="rounded-md bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700">${subject}</span>`).join("")}
                </div>
                <button data-open-career="${career.id}" class="mt-4 rounded-lg bg-primary px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white">Abrir estrategia</button>
            </article>
        `
        )
        .join("");

    querySelectorAll("[data-open-career]").forEach((button) => {
        button.addEventListener("click", () => {
            state.selectedCareerId = button.dataset.openCareer;
            renderCareerDetail();
            renderComparator();
            renderScholarshipSuggestion();
        });
    });
}

function findSelectedCareer() {
    const selected = state.careers.find((career) => career.id === state.selectedCareerId);
    return selected || state.filteredCareers[0] || state.careers[0] || null;
}

function renderCareerDetail() {
    const container = querySelector("#career-detail");
    if (!container) return;

    const career = findSelectedCareer();
    if (!career) {
        container.innerHTML = `<p class="text-sm text-slate-600">No hay detalle disponible.</p>`;
        return;
    }
    state.selectedCareerId = career.id;

    const bottlenecks = (career.materias_filtro_detalle || [])
        .map(
            (subject) => `
            <tr>
                <td class="px-3 py-2 text-sm text-slate-700">${subject.nombre}</td>
                <td class="px-3 py-2 text-sm text-slate-700">${subject.semestre_tipico}</td>
                <td class="px-3 py-2 text-sm text-slate-700">${subject.nivel_riesgo_academico}</td>
            </tr>
        `
        )
        .join("");

    const compatibility = career.compatibilidad_doble_programa || {};
    const alternatives = career.opciones_alternativas || {};
    const transfer = career.promedio_transferencia || {};
    const routes = career.rutas_aterrizaje_suave || {};
    const postgrad = career.opciones_posgrado_relacionadas || {};

    container.innerHTML = `
        <article class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div class="flex items-start justify-between gap-3">
                <div>
                    <p class="text-[11px] font-black uppercase tracking-[0.16em] text-primary">${career.area}</p>
                    <h3 class="mt-1 font-headline text-2xl font-extrabold text-slate-800">${career.nombre}</h3>
                </div>
                ${getRiskBadge(career.riesgo_desercion?.nivel)}
            </div>
            <p class="mt-3 text-sm text-slate-700">${career.perfil_estudiante_ideal}</p>

            <div class="mt-5 grid gap-4 md:grid-cols-2">
                <div class="rounded-lg bg-slate-50 p-4">
                    <h4 class="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Movilidad academica</h4>
                    <p class="mt-2 text-sm text-slate-700">PGA sugerido: <strong>${transfer.pga_minimo_general || "3.5"}</strong></p>
                    <p class="mt-1 text-sm text-slate-700">Ruta alterna: ${transfer.ruta_alternativa_creditos || "45 creditos con 3.75"}</p>
                    <p class="mt-2 text-sm text-slate-700">${transfer.regla_recalculo || "Se conservan notas homologables."}</p>
                </div>
                <div class="rounded-lg bg-slate-50 p-4">
                    <h4 class="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Extracreditacion y doble</h4>
                    <p class="mt-2 text-sm text-slate-700">Extracreditacion: ${career.posibilidad_extracreditacion ? "Si (promedio > 4.0)" : "No"}</p>
                    <p class="mt-1 text-sm text-slate-700">Doble programa: ${compatibility.aplica ? "Compatible" : "No priorizado"}</p>
                    <p class="mt-1 text-sm text-slate-700">Tiempo adicional estimado: ${compatibility.tiempo_adicional_estimado_semestres || "-"} semestres</p>
                </div>
            </div>

            <div class="mt-5 overflow-hidden rounded-lg border border-slate-200">
                <table class="w-full border-collapse">
                    <thead class="bg-slate-100 text-left">
                        <tr>
                            <th class="px-3 py-2 text-xs font-black uppercase tracking-[0.1em] text-slate-600">Materia filtro</th>
                            <th class="px-3 py-2 text-xs font-black uppercase tracking-[0.1em] text-slate-600">Semestre</th>
                            <th class="px-3 py-2 text-xs font-black uppercase tracking-[0.1em] text-slate-600">Riesgo</th>
                        </tr>
                    </thead>
                    <tbody>${bottlenecks}</tbody>
                </table>
            </div>

            <div class="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                    <h4 class="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Rutas de aterrizaje suave</h4>
                    <ul class="mt-2 space-y-1 text-sm text-slate-700">
                        <li><strong>CBU:</strong> ${(routes.cbu || []).join(", ") || "-"}</li>
                        <li><strong>CLE:</strong> ${(routes.cle || []).join(", ") || "-"}</li>
                        <li><strong>EDIR:</strong> ${(routes.edir || []).join(", ") || "-"}</li>
                        <li><strong>Exploratorias:</strong> ${(routes.materias_exploratorias_compatibles || []).join(", ") || "-"}</li>
                    </ul>
                </div>
                <div>
                    <h4 class="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Compatibilidad CLE/CBU</h4>
                    <ul class="mt-2 space-y-1 text-sm text-slate-700">
                        <li><strong>Dobles frecuentes:</strong> ${(compatibility.dobles_programas_frecuentes || []).join(", ") || "-"}</li>
                        <li><strong>Ciclo basico compartido:</strong> ${compatibility.compatibilidad_ciclo_basico || "-"}</li>
                        <li><strong>Dificultad combinada:</strong> ${compatibility.dificultad_combinada || "-"}</li>
                    </ul>
                </div>
            </div>

            <div class="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                    <h4 class="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Alternativas a doble programa</h4>
                    <ul class="mt-2 space-y-1 text-sm text-slate-700">
                        <li><strong>Minors:</strong> ${(alternatives.minors || []).join(", ") || "-"}</li>
                        <li><strong>Opciones academicas:</strong> ${(alternatives.opciones_academicas || []).join(", ") || "-"}</li>
                        <li><strong>Enfasis:</strong> ${(alternatives.enfasis || []).join(", ") || "-"}</li>
                        <li><strong>Certificaciones:</strong> ${(alternatives.certificaciones_interdisciplinarias || []).join(", ") || "-"}</li>
                    </ul>
                </div>
                <div>
                    <h4 class="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Posgrados relacionados</h4>
                    <ul class="mt-2 space-y-1 text-sm text-slate-700">
                        <li><strong>Coterminales:</strong> ${(postgrad.maestrias_coterminales || []).join(", ") || "-"}</li>
                        <li><strong>Opciones de grado:</strong> ${(postgrad.opciones_de_grado || []).join(", ") || "-"}</li>
                        <li><strong>Rutas aceleradas:</strong> ${(postgrad.rutas_academicas_aceleradas || []).join(", ") || "-"}</li>
                    </ul>
                </div>
            </div>
        </article>
    `;
}

function averageForCourses(courses) {
    const summary = courses.reduce(
        (accumulator, course) => {
            const credits = Number(course.creditos || 0);
            const grade = Number(course.nota || 0);
            accumulator.totalCredits += credits;
            accumulator.totalWeighted += credits * grade;
            return accumulator;
        },
        { totalCredits: 0, totalWeighted: 0 }
    );

    return {
        credits: summary.totalCredits,
        average: summary.totalCredits ? summary.totalWeighted / summary.totalCredits : 0
    };
}

function calculateTransferScenarios() {
    const original = averageForCourses(state.simulatorCourses);
    const homologable = averageForCourses(state.simulatorCourses.filter((course) => course.homologable));
    const borron = averageForCourses(
        state.simulatorCourses.filter((course) => course.homologable && !course.problematica)
    );

    return { original, homologable, borron };
}

function renderSimulatorTable() {
    const table = querySelector("#simulator-table");
    const metrics = querySelector("#simulator-metrics");
    if (!table || !metrics) return;

    table.innerHTML = state.simulatorCourses
        .map(
            (course, index) => `
            <tr>
                <td class="px-2 py-2">
                    <input data-course-input="${course.id}" data-field="nombre" class="w-full rounded-md border border-slate-300 px-2 py-1 text-sm" value="${course.nombre}" />
                </td>
                <td class="px-2 py-2">
                    <input data-course-input="${course.id}" data-field="creditos" type="number" min="1" max="6" class="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm" value="${course.creditos}" />
                </td>
                <td class="px-2 py-2">
                    <input data-course-input="${course.id}" data-field="nota" type="number" step="0.1" min="0" max="5" class="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm" value="${course.nota}" />
                </td>
                <td class="px-2 py-2 text-center">
                    <input data-course-input="${course.id}" data-field="homologable" type="checkbox" class="rounded border-slate-300 text-primary focus:ring-primary" ${course.homologable ? "checked" : ""} />
                </td>
                <td class="px-2 py-2 text-center">
                    <input data-course-input="${course.id}" data-field="problematica" type="checkbox" class="rounded border-slate-300 text-rose-500 focus:ring-rose-500" ${course.problematica ? "checked" : ""} />
                </td>
                <td class="px-2 py-2 text-center">
                    <button data-remove-course="${course.id}" class="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">Quitar</button>
                </td>
            </tr>
        `
        )
        .join("");

    const { original, homologable, borron } = calculateTransferScenarios();
    metrics.innerHTML = `
        <div class="rounded-lg bg-white p-3">
            <p class="text-xs font-black uppercase tracking-[0.1em] text-slate-500">Promedio actual</p>
            <p class="mt-1 text-lg font-extrabold text-slate-800">${original.average.toFixed(2)}</p>
            <p class="text-xs text-slate-500">${original.credits} creditos considerados</p>
        </div>
        <div class="rounded-lg bg-white p-3">
            <p class="text-xs font-black uppercase tracking-[0.1em] text-slate-500">Transferencia con recalculo</p>
            <p class="mt-1 text-lg font-extrabold text-slate-800">${homologable.average.toFixed(2)}</p>
            <p class="text-xs text-slate-500">${homologable.credits} creditos homologables</p>
        </div>
        <div class="rounded-lg bg-white p-3">
            <p class="text-xs font-black uppercase tracking-[0.1em] text-slate-500">Borrón y Cuenta Nueva</p>
            <p class="mt-1 text-lg font-extrabold text-slate-800">${borron.average.toFixed(2)}</p>
            <p class="text-xs text-slate-500">${borron.credits} creditos depurados</p>
        </div>
    `;

    querySelectorAll("[data-course-input]").forEach((input) => {
        input.addEventListener("change", () => {
            const course = state.simulatorCourses.find((item) => item.id === input.dataset.courseInput);
            if (!course) return;

            const field = input.dataset.field;
            if (field === "homologable" || field === "problematica") {
                course[field] = input.checked;
            } else if (field === "creditos" || field === "nota") {
                course[field] = Number(input.value);
            } else {
                course[field] = input.value;
            }
            renderSimulatorTable();
        });
    });

    querySelectorAll("[data-remove-course]").forEach((button) => {
        button.addEventListener("click", () => {
            state.simulatorCourses = state.simulatorCourses.filter((course) => course.id !== button.dataset.removeCourse);
            renderSimulatorTable();
        });
    });
}

function addSimulatorCourse() {
    const id = `course-${Date.now()}`;
    state.simulatorCourses.push({
        id,
        nombre: "Materia nueva",
        creditos: 3,
        nota: 3,
        homologable: true,
        problematica: false
    });
    renderSimulatorTable();
}

function renderScholarshipSuggestion() {
    const container = querySelector("#dynamic-scholarships");
    const averageInput = querySelector("#finance-average");
    const needSelect = querySelector("#finance-need");
    if (!container || !averageInput || !needSelect) return;

    const career = findSelectedCareer();
    if (!career) {
        container.innerHTML = `<p class="text-sm text-slate-600">Selecciona una carrera para ver apoyos.</p>`;
        return;
    }

    const scholarships = suggestScholarships(career, {
        promedio: Number(averageInput.value || 0),
        necesidad_financiera: needSelect.value
    });

    container.innerHTML = `
        <div class="space-y-2">
            ${scholarships.map((beca) => `<span class="mr-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">${beca}</span>`).join("")}
        </div>
    `;
}

function renderComparator() {
    const selectA = querySelector("#compare-career-a");
    const selectB = querySelector("#compare-career-b");
    const result = querySelector("#compare-result");
    if (!selectA || !selectB || !result) return;

    const options = state.careers
        .map((career) => `<option value="${career.id}">${career.nombre}</option>`)
        .join("");
    selectA.innerHTML = options;
    selectB.innerHTML = options;

    const selected = findSelectedCareer();
    if (selected) {
        selectA.value = selected.id;
    }
    if (state.careers[1]) {
        selectB.value = state.careers[1].id;
    }

    const renderComparison = () => {
        const first = state.careers.find((career) => career.id === selectA.value);
        const second = state.careers.find((career) => career.id === selectB.value);
        if (!first || !second) return;

        result.innerHTML = `
            <table class="w-full border-collapse overflow-hidden rounded-lg border border-slate-200 bg-white text-sm">
                <thead class="bg-slate-100">
                    <tr>
                        <th class="px-3 py-2 text-left font-black text-slate-600">Metrica</th>
                        <th class="px-3 py-2 text-left font-black text-slate-600">${first.nombre}</th>
                        <th class="px-3 py-2 text-left font-black text-slate-600">${second.nombre}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td class="px-3 py-2">Carga matematica</td><td class="px-3 py-2">${first.carga_matematica}/5</td><td class="px-3 py-2">${second.carga_matematica}/5</td></tr>
                    <tr><td class="px-3 py-2">Carga laboratorio</td><td class="px-3 py-2">${first.carga_laboratorio}/5</td><td class="px-3 py-2">${second.carga_laboratorio}/5</td></tr>
                    <tr><td class="px-3 py-2">Dificultad percibida</td><td class="px-3 py-2">${first.dificultad_percibida}</td><td class="px-3 py-2">${second.dificultad_percibida}</td></tr>
                    <tr><td class="px-3 py-2">Riesgo desercion</td><td class="px-3 py-2">${first.riesgo_desercion?.nivel || "-"}</td><td class="px-3 py-2">${second.riesgo_desercion?.nivel || "-"}</td></tr>
                    <tr><td class="px-3 py-2">Materias filtro clave</td><td class="px-3 py-2">${(first.materias_filtro || []).slice(0, 2).join(", ")}</td><td class="px-3 py-2">${(second.materias_filtro || []).slice(0, 2).join(", ")}</td></tr>
                </tbody>
            </table>
        `;
    };

    if (!state.comparatorBound) {
        selectA.addEventListener("change", renderComparison);
        selectB.addEventListener("change", renderComparison);
        state.comparatorBound = true;
    }
    renderComparison();
}

function renderRecommendationEngine() {
    const results = querySelector("#recommend-result");
    const style = querySelector("#recommend-style");
    const tolerance = querySelector("#recommend-tolerance");
    if (!results || !style || !tolerance) return;

    style.innerHTML = learningStyles.filter((option) => option !== "todos").map((option) => `<option value="${option}">${option}</option>`).join("");
    tolerance.innerHTML = toleranceOptions.filter((option) => option !== "todas").map((option) => `<option value="${option}">${option}</option>`).join("");

    querySelector("#run-recommendation")?.addEventListener("click", () => {
        const recommendations = recommendCareers(state.careers, {
            intereses: collectCheckedValues("recommend-interest"),
            habilidades: collectCheckedValues("recommend-skill"),
            estilo_aprendizaje: style.value,
            tolerancia_carga: tolerance.value
        })
            .filter((item) => item.score > 0)
            .slice(0, 3);

        if (!recommendations.length) {
            results.innerHTML = `<p class="text-sm text-slate-600">No hubo coincidencias fuertes. Activa mas intereses o habilidades para personalizar.</p>`;
            return;
        }

        results.innerHTML = recommendations
            .map(
                ({ career, score, resumen }) => `
                <article class="rounded-lg border border-slate-200 bg-white p-4">
                    <div class="flex items-center justify-between">
                        <h4 class="font-headline text-lg font-extrabold text-slate-800">${career.nombre}</h4>
                        <span class="rounded-md bg-primary px-2 py-1 text-xs font-black text-white">Score ${score}</span>
                    </div>
                    <p class="mt-2 text-sm text-slate-700">${career.descripcion_realista}</p>
                    <ul class="mt-2 space-y-1 text-xs text-slate-500">
                        ${resumen.map((row) => `<li>${row}</li>`).join("")}
                    </ul>
                </article>
            `
            )
            .join("");
    });
}

async function loadCareers(filters = {}) {
    const status = querySelector("#career-bank-status");
    if (status) status.textContent = "Cargando carreras...";
    state.filteredCareers = await getCareers(filters);

    if (!state.careers.length) {
        state.careers = state.filteredCareers.length ? [...state.filteredCareers] : [...careerBankSeed];
    }

    const usingSeedFallback = !state.filteredCareers.length && !Object.values(filters).some(Boolean);
    if (usingSeedFallback) {
        state.filteredCareers = [...careerBankSeed];
    }

    if (status) status.textContent = "Banco listo.";
}

function bindFilterActions() {
    querySelector("#apply-filters")?.addEventListener("click", async () => {
        await loadCareers(readFilters());
        renderCareerList();
        renderCareerDetail();
        renderComparator();
        renderScholarshipSuggestion();
    });

    querySelector("#clear-filters")?.addEventListener("click", async () => {
        const form = querySelector("#career-filters");
        form?.reset();
        querySelectorAll("input[name='filter-interest'], input[name='filter-skill']").forEach((input) => {
            input.checked = false;
        });
        await loadCareers();
        renderCareerList();
        renderCareerDetail();
        renderComparator();
        renderScholarshipSuggestion();
    });
}

function renderAuthStatus() {
    const label = querySelector("#auth-state");
    if (!label) return;
    label.textContent = state.user ? `Sesion: ${state.user.email}` : "Sesion: invitado";
}

async function initCareerBank() {
    subscribeToAuthChanges((user) => {
        state.user = user;
        renderAuthStatus();
    });

    populateCheckboxes();
    populateFilterOptions(careerBankSeed);
    bindStudentTypeButtons();
    bindFilterActions();
    renderStudentFlow();
    renderRecommendationEngine();

    await loadCareers();
    state.careers = state.filteredCareers.length ? [...state.filteredCareers] : [...careerBankSeed];
    state.selectedCareerId = state.careers[0]?.id || null;

    renderCareerList();
    renderCareerDetail();
    renderSimulatorTable();
    renderComparator();
    renderScholarshipSuggestion();

    querySelector("#add-simulator-course")?.addEventListener("click", addSimulatorCourse);
    querySelector("#run-finance-check")?.addEventListener("click", renderScholarshipSuggestion);
}

document.addEventListener("DOMContentLoaded", initCareerBank);
