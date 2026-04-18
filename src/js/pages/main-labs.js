import { mountUnifiedLayout } from "../components/unified-layout.js";
import { subscribeToAuthChanges } from "../services/auth.js";

const ENDPOINT_GENERATE = "http://127.0.0.1:5001/lifetimelabs-online/us-central1/generateLabs";
const ENDPOINT_EVALUATE = "http://127.0.0.1:5001/lifetimelabs-online/us-central1/evaluateLab";

const dom = {
    coreonFeedback: document.getElementById("coreon-feedback"),
    coreonSubstatus: document.getElementById("coreon-substatus"),
    phaseChip: document.getElementById("phase-chip"),
    progressCounter: document.getElementById("progress-counter"),
    progressBar: document.getElementById("progress-bar"),
    conversationQuestion: document.getElementById("conversation-question"),
    thinkingIndicator: document.getElementById("thinking-indicator"),
    thinkingText: document.getElementById("thinking-text"),
    responseForm: document.getElementById("response-form"),
    inputA: document.getElementById("response-input-a"),
    inputB: document.getElementById("response-input-b"),
    submitBtn: document.getElementById("submit-response"),
    warningA: document.getElementById("char-warning-a"),
    warningB: document.getElementById("char-warning-b"),
    countA: document.getElementById("char-count-a"),
    countB: document.getElementById("char-count-b"),
    feedbackContainer: document.getElementById("feedback-container"),
    feedbackText: document.getElementById("ai-feedback-text"),
    nextBtn: document.getElementById("next-lab-btn"),
    reportContainer: document.getElementById("report-container")
};

let currentUser = null;
let currentLabs = [];
let currentIndex = 0;

mountUnifiedLayout({
    title: "Laboratorio Cognitivo",
    activeNav: "labs",
    badgeText: "Coreon IA"
});

function getValidCharCount(text) {
    return text.replace(/[\s\.\,\;]/g, '').length;
}

function updateValidation() {
    const charsA = getValidCharCount(dom.inputA.value);
    const charsB = getValidCharCount(dom.inputB.value);

    dom.countA.textContent = charsA;
    dom.countB.textContent = charsB;

    dom.warningA.style.color = charsA >= 200 ? "green" : "red";
    dom.warningB.style.color = charsB >= 200 ? "green" : "red";

    if (charsA >= 200 && charsB >= 200) {
        dom.submitBtn.disabled = false;
        dom.submitBtn.style.opacity = '1';
        dom.submitBtn.style.cursor = 'pointer';
    } else {
        dom.submitBtn.disabled = true;
        dom.submitBtn.style.opacity = '0.5';
        dom.submitBtn.style.cursor = 'not-allowed';
    }
}

dom.inputA.addEventListener("input", updateValidation);
dom.inputB.addEventListener("input", updateValidation);

async function generateLabs() {
    dom.coreonFeedback.textContent = "Diseñando ecosistema de pruebas basado en tu perfil...";
    dom.coreonSubstatus.textContent = "Coreon modelando problemas de la vida real...";
    
    try {
        const response = await fetch(ENDPOINT_GENERATE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: currentUser.uid })
        });

        if (!response.ok) throw new Error("Error generating labs");
        const resJson = await response.json();
        
        currentLabs = resJson.data.labs || [];
        currentIndex = 0;
        
        if (currentLabs.length > 0) {
            renderLab(currentIndex);
        }
    } catch (err) {
        console.error(err);
        dom.coreonFeedback.textContent = "Hubo un error al generar tus laboratorios.";
    }
}

function renderLab(index) {
    const lab = currentLabs[index];
    
    dom.phaseChip.innerHTML = `<span class="bg-primary/10 text-primary px-2 py-0.5 rounded-full mr-2">${lab.category_fit}</span>Laboratorio · ${index + 1}/4`;
    dom.progressCounter.textContent = `${index + 1}/4`;
    dom.progressBar.style.width = `${((index + 1) / 4) * 100}%`;
    
    dom.coreonFeedback.textContent = lab.title;
    dom.coreonSubstatus.textContent = `Competencias esperadas: ${lab.expected_skills.join(', ')}`;
    
    dom.conversationQuestion.innerHTML = `<p class="question-text">${lab.problem_statement}</p>`;
    
    // Reset Form
    dom.inputA.value = "";
    dom.inputB.value = "";
    dom.inputA.disabled = false;
    dom.inputB.disabled = false;
    dom.responseForm.classList.remove("hidden");
    dom.feedbackContainer.classList.add("hidden");
    updateValidation();
}

dom.responseForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const lab = currentLabs[currentIndex];
    
    dom.inputA.disabled = true;
    dom.inputB.disabled = true;
    dom.submitBtn.disabled = true;
    dom.submitBtn.style.opacity = '0.5';
    
    dom.thinkingIndicator.classList.remove("hidden");
    dom.thinkingText.textContent = "Coreon está evaluando tus alternativas...";
    
    try {
        const response = await fetch(ENDPOINT_EVALUATE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: currentUser.uid,
                labTitle: lab.title,
                problemStatement: lab.problem_statement,
                solutionA: dom.inputA.value.trim(),
                solutionB: dom.inputB.value.trim()
            })
        });

        if (!response.ok) throw new Error("Error evaluating lab");
        const resJson = await response.json();
        
        dom.thinkingIndicator.classList.add("hidden");
        dom.feedbackContainer.classList.remove("hidden");
        dom.feedbackText.innerHTML = resJson.feedback.replace(/\n/g, '<br>');
        
        // Hide form to focus on feedback
        dom.responseForm.classList.add("hidden");
        
    } catch (err) {
        console.error(err);
        dom.thinkingIndicator.classList.add("hidden");
        alert("Error de conexión al evaluar. Por favor reintenta.");
        dom.inputA.disabled = false;
        dom.inputB.disabled = false;
        updateValidation();
    }
});

dom.nextBtn.addEventListener("click", () => {
    currentIndex++;
    if (currentIndex < currentLabs.length) {
        renderLab(currentIndex);
    } else {
        finishLabs();
    }
});

function finishLabs() {
    dom.phaseChip.textContent = "Completado";
    dom.coreonFeedback.textContent = "Has completado todos tus laboratorios cognitivos.";
    dom.coreonSubstatus.textContent = "Reporte de graduación generado con éxito.";
    
    dom.responseForm.classList.add("hidden");
    dom.feedbackContainer.classList.add("hidden");
    document.getElementById("conversation-container").classList.add("hidden");
    
    // Show report 
    dom.reportContainer.classList.remove("hidden");
    document.getElementById("report-summary").textContent = "Analizamos profundamente tus alternativas. Demostraste gran habilidad iterativa en la resolución de problemas.";
}

subscribeToAuthChanges((user) => {
    if (user) {
        currentUser = user;
        generateLabs();
    }
});
