import { contextQuestions } from '../data/questions.js';
import { createCardHTML } from '../modules/ui.js';

let currentStep = 0;

const nextStep = () => {
    currentStep++;
    const nextQuestion = contextQuestions[currentStep];
    document.getElementById('app-container').innerHTML = createCardHTML(nextQuestion);
};