import { contextQuestions } from './data/questions.js';

let currentStep = 0;

function renderQuestion() {
    const data = contextQuestions[currentStep];
    const container = document.getElementById('app-container');

    // Aquí pones el HTML cute que diseñamos
    container.innerHTML = `
        <div class="card-pop bg-white p-10 rounded-[2.5rem] shadow-xl">
            <span class="text-[10px] font-black text-primary uppercase tracking-widest">${data.title}</span>
            <h3 class="font-black text-2xl text-primary-dim mt-2 mb-8">${data.question}</h3>
            <div class="grid gap-4">
                ${data.options.map(opt => `
                    <button class="option-btn p-5 bg-gray-50 rounded-2xl border-2 border-transparent hover:border-primary transition-all flex items-center gap-4 text-left font-bold" onclick="selectOption('${opt.value}')">
                        <span class="material-symbols-outlined text-primary">${opt.icon}</span>
                        ${opt.text}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

// Iniciar al cargar
window.onload = renderQuestion; 