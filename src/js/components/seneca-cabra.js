export function renderSenecaCabra(targetId = "seneca-cabra-slot") {
    const target = document.getElementById(targetId);
    if (!target) return;

    target.innerHTML = `
        <div class="absolute inset-0 bg-primary-container/20 blur-3xl animate-pulse rounded-[0%_100%_100%_100%]"></div>
        <div class="relative z-10 w-full h-full bg-white flex items-center justify-center shadow-2xl border-4 border-white overflow-hidden rounded-[0%_100%_100%_100%] transition-transform duration-500 hover:rotate-[-5deg]">
            <img src="assets/Coreon.svg" class="w-32 h-32 coreon-glow" alt="SenecaCabra" />
        </div>
    `;
}

