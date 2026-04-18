import { contextQuestions } from '../data/questions.js';
import { mountUnifiedLayout } from "../components/unified-layout.js";
import { subscribeToAuthChanges } from '../services/auth.js';
import { saveOriginsResults } from '../services/db.js';
import { fetchAIStream } from '../services/aiStream.js';

let currentStep = 0;
let userResponses = {};
let currentUser = null;
let aiQuestionCount = 0;
const MAX_AI_QUESTIONS = 10;

// Suscribirse para estar listos si hay logueo
subscribeToAuthChanges((user) => {
    currentUser = user;
});

export function renderQuestion() {
    const container = document.getElementById('app-container');
    if (!container) return;

    if (currentStep >= contextQuestions.length) {
        finishTest(container);
        return;
    }

    const data = contextQuestions[currentStep];

    // Generar botones de opciones manejando si hay icono o no
    const optionsHtml = data.options.map(opt => {
        const iconHtml = opt.icon
            ? `<span class="material-symbols-outlined text-primary">${opt.icon}</span>`
            : `<div class="w-1.5 h-1.5 rounded-full bg-primary/30"></div>`;

        return `
            <button class="option-btn p-5 bg-white/90 rounded-[2rem] border border-primary/15 hover:border-primary/40 hover:shadow-lg transition-all flex items-center gap-4 text-left font-bold" data-value="${opt.value}">
                ${iconHtml}
                ${opt.text}
            </button>
        `;
    }).join('');

    // Aplicamos clase de entrada
    container.innerHTML = `
        <div class="card-pop ll-card-base ll-card-glow bg-white p-10 rounded-[2.5rem] fade-in" style="animation-play-state: running;">
            <div class="flex justify-between items-center mb-2">
                <span class="text-[10px] font-black text-primary uppercase tracking-widest">${data.title}</span>
                <span class="text-[10px] font-bold text-gray-400">Pregunta ${currentStep + 1} de ${contextQuestions.length}</span>
            </div>
            <h3 class="font-black text-2xl text-primary-dim mt-2 mb-8 leading-tight">${data.question}</h3>
            <div class="grid gap-4">
                ${optionsHtml}
            </div>
            ${currentStep > 0 ? `
            <button id="btn-back" class="mt-6 text-xs text-secondary hover:text-primary font-bold flex items-center gap-1 transition-colors">
                <span class="material-symbols-outlined text-sm">arrow_back</span> Atrás
            </button>` : ''}
        </div>
    `;

    // Vincular eventos sin contaminar el scope global
    const btns = container.querySelectorAll('.option-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            selectOption(data.id, btn.getAttribute('data-value'));
        });
    });

    const btnBack = container.querySelector('#btn-back');
    if (btnBack) {
        btnBack.addEventListener('click', () => {
            currentStep--;
            renderQuestion();
        });
    }
}

function selectOption(questionId, value) {
    userResponses[questionId] = value;
    currentStep++;
    renderQuestion();
}

async function finishTest(container) {
    container.innerHTML = `
        <div class="card-pop ll-card-base ll-card-glow bg-white p-10 rounded-[2.5rem] fade-in text-center flex flex-col items-center justify-center space-y-6">
            <div class="w-16 h-16 border-4 border-gray-100 border-t-primary rounded-full animate-spin"></div>
            <h3 class="font-black text-2xl text-primary-dim">Ingiriendo contexto...</h3>
            <p class="text-sm text-secondary">Preparando el motor cognitivo con tus datos iniciales.</p>
        </div>
    `;

    try {
        if (currentUser) {
            await saveOriginsResults(currentUser.uid, userResponses, currentUser.email);
        } else {
            console.warn("Usuario no inició sesión. No se enviarán datos.");
        }

        try {
            localStorage.setItem(
                "ll-origins-session",
                JSON.stringify({
                    responses: userResponses,
                    uid: currentUser?.uid || "guest",
                    savedAt: new Date().toISOString()
                })
            );
        } catch (error) {
            console.warn("No se pudo guardar snapshot local de orígenes.", error);
        }

        container.innerHTML = `
            <section class="ll-card-base ll-card-glow bg-white p-10 rounded-[2.5rem] fade-in space-y-6">
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 rounded-2xl border border-primary/20 flex items-center justify-center bg-primary/5 animate-pulse">
                        <img src="assets/Coreon.svg" alt="Coreon" class="w-10 h-10" />
                    </div>
                    <div>
                        <p class="text-[10px] font-black uppercase tracking-[0.16em] text-primary">Phase B</p>
                        <h3 class="font-black text-2xl text-primary-dim">Activación del laboratorio</h3>
                    </div>
                </div>
                <p class="text-sm text-secondary">
                    Iniciando lectura de patrones académicos…
                </p>
                <div class="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div class="h-2 bg-primary rounded-full animate-pulse" style="width: 85%;"></div>
                </div>
            </section>
        `;

        setTimeout(() => {
            startStageTwo(container, "Hemos inicializado tu mapa cognitivo basándonos en tus primeras respuestas. Para empezar nuestra exploración profunda, cuéntame: ¿Qué actividad o tema te hace perder la noción del tiempo cuando estás concentrado en ello?");
        }, 2400);

    } catch (err) {
        container.innerHTML = `
             <div class="card-pop ll-card-base ll-card-glow bg-white p-10 rounded-[2.5rem] fade-in text-center">
                 <span class="material-symbols-outlined text-4xl text-red-400 mb-4">error</span>
                 <h3 class="font-black text-xl text-primary-dim mb-2">Hubo un problema</h3>
                 <p class="text-sm text-secondary mb-6">No pudimos conectar con el servidor.</p>
                 <button id="btn-retry" class="w-full bg-primary text-primary-container font-headline font-extrabold py-4 rounded-full transition-all active:scale-[0.98]">
                     Reintentar
                 </button>
             </div>
        `;
        document.getElementById('btn-retry').addEventListener('click', () => finishTest(container));
    }
}

// -------------------------------------------------------------------------------------------------
// STAGE 2: IA Guiada (Streaming Text)
// -------------------------------------------------------------------------------------------------
function startStageTwo(container, initialQuestion) {
    container.innerHTML = `
        <div class="card-pop bg-white p-10 rounded-[2.5rem] shadow-xl fade-in flex flex-col min-h-[400px]">
            <div class="flex justify-between items-center mb-6">
                <span class="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">psychology</span> Exploración Guiada
                </span>
                <span id="ai-progress" class="text-[10px] font-bold text-gray-400">Pregunta ${aiQuestionCount + 1} de ${MAX_AI_QUESTIONS}</span>
            </div>
            
            <div id="ai-text-container" class="font-black text-xl text-primary-dim mb-8 leading-relaxed min-h-[80px]">
                ${initialQuestion}
            </div>
            
            <div id="user-input-container" class="mt-auto w-full transition-opacity duration-300">
                <textarea id="ai-user-answer" rows="3" class="w-full p-4 border-2 border-surface-container-low rounded-2xl focus:border-primary focus:ring-0 outline-none transition-all font-body text-on-surface resize-none" placeholder="Escribe tu respuesta detallada aquí... (mínimo 200 letras)"></textarea>
                <div class="flex justify-between items-center mt-4">
                    <span id="ai-char-warning" class="text-xs text-red-500 font-bold hidden">Necesitas al menos 200 letras (sin contar espacios ni puntos). Llevas: <span id="ai-char-count">0</span></span>
                    <button id="ai-submit-btn" class="bg-primary text-primary-container font-headline font-extrabold py-3 px-8 rounded-full transition-all hover:bg-[#005c3d] active:scale-[0.98] shadow-lg flex items-center justify-center min-w-[140px] ml-auto">
                        Enviar Respuesta
                    </button>
                </div>
            </div>
        </div>
    `;

    const submitBtn = container.querySelector('#ai-submit-btn');
    const textarea = container.querySelector('#ai-user-answer');
    const aiText = container.querySelector('#ai-text-container');
    const userInputContainer = container.querySelector('#user-input-container');
    const progressText = container.querySelector('#ai-progress');
    const charWarning = container.querySelector('#ai-char-warning');
    const charCountSpan = container.querySelector('#ai-char-count');

    textarea.addEventListener('input', () => {
        const validChars = textarea.value.replace(/[\s\.\,\;]/g, '').length;
        if (validChars < 200) {
            charWarning.classList.remove('hidden');
            charCountSpan.textContent = validChars;
            submitBtn.style.opacity = '0.5';
            submitBtn.style.pointerEvents = 'none';
        } else {
            charWarning.classList.add('hidden');
            submitBtn.style.opacity = '1';
            submitBtn.style.pointerEvents = 'auto';
        }
    });

    // Initial state trigger
    textarea.dispatchEvent(new Event('input'));

    submitBtn.addEventListener('click', async () => {
        const answer = textarea.value.trim();
        const validChars = answer.replace(/[\s\.\,\;]/g, '').length;
        if (!answer || !currentUser || validChars < 200) return;

        aiQuestionCount++;

        // Hide input, show thinking state
        userInputContainer.style.opacity = '0';
        setTimeout(() => userInputContainer.style.display = 'none', 300);

        aiText.innerHTML = `<div class="flex items-center gap-3"><div class="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center animate-pulse"><div class="w-2.5 h-2.5 bg-primary rounded-full"></div></div><span class="text-gray-400 text-sm font-bold">El motor cognitivo está procesando...</span></div>`;

        // Fetch AI Stream
        await fetchAIStream(
            currentUser.uid,
            answer,
            aiQuestionCount,
            (chunk, fullStr) => {
                // Formatting markdown logic could be applied here if needed.
                aiText.innerHTML = fullStr.replace(/\n/g, '<br>');
            },
            (finalStr) => {
                // Validate graduation
                if (aiQuestionCount >= MAX_AI_QUESTIONS) {
                    setTimeout(() => moveToLabs(container), 2000);
                } else {
                    // Reset input for the next question
                    progressText.innerText = `Pregunta ${aiQuestionCount + 1} de ${MAX_AI_QUESTIONS}`;
                    textarea.value = '';
                    userInputContainer.style.display = 'block';
                    // Trigger reflow to ensure display block sticks before fading in
                    void userInputContainer.offsetWidth;
                    userInputContainer.style.opacity = '1';
                }
            },
            (error) => {
                aiText.innerHTML = `<span class="text-red-500">Ups, hubo un problema de conexión. Recarga la página y el sistema continuará.</span>`;
            }
        );
    });
}

function moveToLabs(container) {
    container.innerHTML = `
        <div class="card-pop bg-white p-10 rounded-[2.5rem] shadow-xl fade-in text-center flex flex-col items-center justify-center space-y-6 min-h-[400px]">
            <span class="material-symbols-outlined text-6xl text-primary mb-2 animate-bounce">science</span>
            <h3 class="font-black text-3xl text-primary-dim">Análisis Completado</h3>
            <p class="text-base text-secondary max-w-sm mx-auto">Hemos consolidado tu Mapa de Evidencias. Estamos ensamblando el laboratorio perfecto para tu perfil...</p>
            <div class="w-full bg-gray-100 rounded-full h-2 max-w-xs overflow-hidden mt-6">
                <div class="bg-primary h-2 rounded-full w-full animate-[progress_2s_ease-in-out]"></div>
            </div>
        </div>
        <style>
            @keyframes progress {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(0); }
            }
        </style>
    `;
    setTimeout(() => {
        window.location.href = "labs.html";
    }, 2800);
}

// Iniciar al cargar
document.addEventListener("DOMContentLoaded", () => {
    mountUnifiedLayout({
        title: "Test de Origenes",
        activeNav: "labs",
        badgeText: "Pre-lab"
    });
    renderQuestion();
});
