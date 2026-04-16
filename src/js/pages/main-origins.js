import { contextQuestions } from '../data/questions.js';
import { subscribeToAuthChanges } from '../services/auth.js';
import { saveOriginsResults } from '../services/db.js';

let currentStep = 0;
let userResponses = {};
let currentUser = null;

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
            <button class="option-btn p-5 bg-gray-50 rounded-2xl border-2 border-transparent hover:border-primary transition-all flex items-center gap-4 text-left font-bold" data-value="${opt.value}">
                ${iconHtml}
                ${opt.text}
            </button>
        `;
    }).join('');

    // Aplicamos clase de entrada
    container.innerHTML = `
        <div class="card-pop bg-white p-10 rounded-[2.5rem] shadow-xl fade-in" style="animation-play-state: running;">
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
        <div class="card-pop bg-white p-10 rounded-[2.5rem] shadow-xl fade-in text-center flex flex-col items-center justify-center space-y-6">
            <div class="w-16 h-16 border-4 border-gray-100 border-t-primary rounded-full animate-spin"></div>
            <h3 class="font-black text-2xl text-primary-dim">Guardando tu configuración...</h3>
            <p class="text-sm text-secondary">Ajustando el laboratorio a tu ADN conductual.</p>
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
            <section class="bg-white p-10 rounded-[2.5rem] shadow-xl fade-in space-y-6">
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
            window.location.href = "labs.html";
        }, 2400);

    } catch (err) {
        container.innerHTML = `
             <div class="card-pop bg-white p-10 rounded-[2.5rem] shadow-xl fade-in text-center">
                 <span class="material-symbols-outlined text-4xl text-red-400 mb-4">error</span>
                 <h3 class="font-black text-xl text-primary-dim mb-2">Hubo un problema</h3>
                 <p class="text-sm text-secondary mb-6">No pudimos guardar tus respuestas en la base de datos.</p>
                 <button id="btn-retry" class="w-full bg-primary text-primary-container font-headline font-extrabold py-4 rounded-full transition-all active:scale-[0.98]">
                     Reintentar
                 </button>
             </div>
        `;
        document.getElementById('btn-retry').addEventListener('click', () => finishTest(container));
    }
}

// Iniciar al cargar
document.addEventListener("DOMContentLoaded", renderQuestion);
