import { renderTaskCard } from '../modules/ui-templates.js';
import { contextQuestions } from '../data/questions.js';

// 1. Referencias a los elementos del DOM
const monitorCoreon = document.getElementById('coreon-feedback');
const workspace = document.getElementById('app-container');

// 2. Estado de la aplicación
let currentStep = 0;

// 3. Inicialización: Cargar la primera pregunta (Pregunta Base)
function initLab() {
    if (workspace) {
        // Cargamos la primera pregunta de tu archivo de datos
        workspace.innerHTML = renderTaskCard(contextQuestions[currentStep]);
        console.log("Lab Iniciado: Esperando interacción del usuario...");
    }
}

// 4. EL PUENTE DE INTEGRACIÓN
async function handleSubmission(userInput) {
    console.log("Hello World! Respuesta recibida:", userInput);

    // --- ZONA DE IA 
    const aiResponse = `¡Interesante! Has mencionado "${userInput.substring(0, 20)}...". Coreon está analizando tu perfil. ¿Qué más puedes decirme?`;

    // REQUISITO: Coreon al usuario
    actualizarMonitorCoreon(aiResponse);
}

// 5. Función para actualizar la "voz" de Coreon
function actualizarMonitorCoreon(texto) {
    if (monitorCoreon) {
        monitorCoreon.classList.add('animate-pulse'); // Efecto visual de procesando

        setTimeout(() => {
            monitorCoreon.innerText = texto;
            monitorCoreon.classList.remove('animate-pulse');

            // Limpiar el textarea para la siguiente entrada
            const textarea = document.getElementById('user-input');
            if (textarea) textarea.value = "";

            console.log("Hello World: Monitor actualizado con nueva pregunta.");
        }, 800);
    }
}

// 6. Event Listener Global para el botón de la tarjeta
document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'submit-task') {
        const input = document.getElementById('user-input').value;

        if (input.trim() !== "") {
            handleSubmission(input);
        } else {
            console.warn("Input vacío. Intenta escribir algo para Coreon.");
        }
    }
});

// Arrancar el laboratorio
initLab();