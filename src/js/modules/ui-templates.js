// src/js/modules/ui.js

export const renderTaskCard = (data) => {
    // Usamos clases estándar de Tailwind para asegurar visibilidad inmediata
    return `
        <div class="bg-white rounded-[3rem] p-10 shadow-2xl border-b-8 border-[#006947]/20 space-y-8 block visible opacity-100 transform-none">
            <div class="flex justify-between items-center">
                <div class="flex items-center gap-2">
                    <span class="w-2 h-2 bg-[#006947] rounded-full animate-pulse"></span>
                    <span class="text-[10px] font-bold uppercase tracking-widest text-stone-500">${data.id || 'LAB-TASK'}</span>
                </div>
                <div class="text-[10px] font-black bg-[#A2F9CC] px-3 py-1 rounded-full text-[#006947]">
                    STEP ${data.step || '1'}
                </div>
            </div>

            <h2 class="font-bold text-3xl text-stone-800 leading-tight">
                ${data.question}
            </h2>

            <div class="relative">
                <textarea id="user-input" 
                    placeholder="Escribe aquí tu respuesta..."
                    class="w-full bg-stone-50 border-2 border-stone-100 rounded-[2rem] p-8 text-lg focus:ring-4 focus:ring-[#A2F9CC]/50 focus:border-[#006947] transition-all min-h-[200px] text-stone-800"
                ></textarea>
            </div>

            <button id="submit-task" 
                class="w-full bg-[#006947] hover:bg-[#005237] text-white font-black py-6 rounded-[2rem] shadow-xl active:scale-95 transition-all text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-3">
                <span>Sincronizar Datos</span>
                <span class="material-symbols-outlined text-sm">sync</span>
            </button>
        </div>
    `;
};