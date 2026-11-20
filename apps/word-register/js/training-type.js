import { getData, saveData } from "./storage.js";

const form = document.getElementById("trainingTypeForm");
const backButton = document.getElementById("backButton");
const field = document.getElementById("trainingType");

// Списък с всички видове обучения.
const data = getData();
const trainingTypes = Array.isArray(data.trainingTypes)
    ? data.trainingTypes
    : [];

// Показваме последно въведения вид в полето.
field.value = data.trainingType || "";

// Добавяме нов вид обучение.
form.addEventListener("submit", (event) => {
    event.preventDefault();

    const trainingType = field.value.trim();

    if (!trainingType) {
        return;
    }

    // Не допускаме дублиране, независимо от главни/малки букви.
    const exists = trainingTypes.some(
        item => item.toLowerCase() === trainingType.toLowerCase()
    );

    if (!exists) {
        trainingTypes.push(trainingType);
    }

    // Запазваме целия списък и последно въведения вид.
    saveData({
        trainingTypes: [...trainingTypes],
        trainingType
    });

    window.location.href = "./index.html";
});

// Връщане към началното меню.
backButton.addEventListener("click", () => {
    window.location.href = "./index.html";
});