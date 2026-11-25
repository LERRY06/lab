
import { getData, saveData } from "./storage.js";

const form = document.getElementById("trainingTypeForm");
const backButton = document.getElementById("backButton");
const cancelEditButton = document.getElementById("cancelEditButton");
const saveButton = document.getElementById("saveTrainingTypeButton");
const pageTitle = document.getElementById("pageTitle");
const status = document.getElementById("status");

const field = document.getElementById("trainingType");

const data = getData();

const trainingTypes = Array.isArray(data.trainingTypes)
    ? [...data.trainingTypes]
    : [];

field.value = data.trainingType || "";

const urlParams = new URLSearchParams(window.location.search);
const editingType = urlParams.get("edit");

function showStatus(message) {
    status.textContent = message;
}

// Зареждане на вида обучение за редактиране.
function loadTrainingTypeForEditing() {
    if (editingType === null) {
        return;
    }

    const selectedType = trainingTypes.find(
        item => item.toLowerCase() === editingType.toLowerCase()
    );

    if (!selectedType) {
        showStatus("Видът обучение не е намерен.");
        return;
    }

    field.value = selectedType;

    pageTitle.textContent = "Редактиране на вид обучение";

    saveButton.textContent = "Запази промените";

    cancelEditButton.hidden = false;

    showStatus(`Редактиране на: ${selectedType}`);
}

// Записване на нов или редактиран вид обучение.
form.addEventListener("submit", event => {
    event.preventDefault();

    const trainingType = field.value.trim();

    if (!trainingType) {
        showStatus("Моля, въведете вид обучение.");
        return;
    }

    const oldType = editingType !== null
        ? trainingTypes.find(
            item => item.toLowerCase() === editingType.toLowerCase()
        )
        : null;

    if (editingType !== null && !oldType) {
        showStatus("Видът обучение не е намерен.");
        return;
    }

    // Проверка за дублиране.
    const duplicate = trainingTypes.some(item =>
        item.toLowerCase() === trainingType.toLowerCase() &&
        (!oldType || item !== oldType)
    );

    if (duplicate) {
        showStatus("Този вид обучение вече съществува.");
        return;
    }

    // При редактиране заменяме стария запис.
    if (oldType) {
        const oldIndex = trainingTypes.indexOf(oldType);

        if (oldIndex !== -1) {
            trainingTypes[oldIndex] = trainingType;
        }
    } else {
        trainingTypes.push(trainingType);
    }

    // Запазваме данните.
    saveData({
        ...getData(),
        trainingTypes: [...trainingTypes],
        trainingType
    });

    showStatus("Видът обучение е записан успешно.");

    // Връщане към регистъра.
    window.location.href = "./education-types.html";
});

// Отказ от редактиране.
cancelEditButton.addEventListener("click", () => {
    window.location.href = "./education-types.html";
});

// Назад към списъка.
backButton.addEventListener("click", () => {
    window.location.href = "./education-types.html";
});

loadTrainingTypeForEditing();