
import { getData, saveData } from "./storage.js";

const educationTypeList =
    document.getElementById("educationTypeList");

const addButton =
    document.getElementById("addEducationTypeButton");

const status =
    document.getElementById("status");

// Модален прозорец
const deleteModal =
    document.getElementById("deleteEducationTypeModal");

const cancelDeleteButton =
    document.getElementById("cancelDeleteEducationType");

const confirmDeleteButton =
    document.getElementById("confirmDeleteEducationType");

const deleteMessage =
    document.getElementById("deleteEducationTypeMessage");

// Избран вид обучение за изтриване
let educationTypeToDelete = null;

// Взимаме всички видове обучения.
function getEducationTypes() {
    const data = getData();

    return Array.isArray(data.trainingTypes)
        ? data.trainingTypes
        : [];
}

// Съобщение за статус
function showStatus(message) {
    status.textContent = message;
}

// Показване на списъка
function renderEducationTypes() {
    const educationTypes = getEducationTypes();

    educationTypeList.replaceChildren();

    if (educationTypes.length === 0) {
        const empty = document.createElement("div");

        empty.className = "education-empty";
        empty.textContent =
            "Все още няма добавени видове обучения.";

        educationTypeList.appendChild(empty);
        return;
    }

    educationTypes.forEach(trainingType => {

        const item = document.createElement("article");
        item.className = "education-item";

        // Заглавие
        const title = document.createElement("h3");
        title.textContent = trainingType;

        // Контейнер
        const content = document.createElement("div");
        content.className = "education-content";

        const description = document.createElement("div");
        description.className = "education-versions";
        description.textContent = "Вид обучение";

        // Бутони
        const actions = document.createElement("div");
        actions.className = "education-actions";

        // Редактиране
        const editButton = document.createElement("button");

        editButton.type = "button";
        editButton.className = "employee-btn edit-btn";

        editButton.innerHTML =
            '<i class="fa-solid fa-pen-to-square"></i>';

        editButton.title = "Редактиране";

        editButton.setAttribute(
            "aria-label",
            "Редактиране на " + trainingType
        );

        editButton.addEventListener("click", () => {
            editEducationType(trainingType);
        });

        // Изтриване
        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.className = "employee-btn delete-btn";

        deleteButton.innerHTML =
            '<i class="fa-solid fa-trash"></i>';

        deleteButton.title = "Изтриване";

        deleteButton.setAttribute(
            "aria-label",
            "Изтриване на " + trainingType
        );

        deleteButton.addEventListener("click", () => {
            deleteEducationType(trainingType);
        });

        actions.append(editButton, deleteButton);

        content.append(description, actions);

        item.append(title, content);

        educationTypeList.appendChild(item);
    });
}

// Отваряне на страницата за добавяне
addButton.addEventListener("click", () => {
    window.location.href = "./add-education-type.html";
});

// Редактиране
function editEducationType(trainingType) {
    window.location.href =
        `./add-education-type.html?edit=${encodeURIComponent(trainingType)}`;
}

// Отваряне на модалния прозорец
function deleteEducationType(trainingType) {

    const educationTypes = getEducationTypes();

    const selectedType = educationTypes.find(
        item => item === trainingType
    );

    if (!selectedType) {
        showStatus("Видът обучение не е намерен.");
        return;
    }

    educationTypeToDelete = selectedType;

    deleteMessage.textContent =
        `Сигурни ли сте, че искате да изтриете вида обучение "${selectedType}"?`;

    deleteModal.hidden = false;

    cancelDeleteButton.focus();
}

// Потвърждение за изтриване
confirmDeleteButton.addEventListener("click", () => {

    if (educationTypeToDelete === null) {
        return;
    }

    const data = getData();

    const educationTypes = Array.isArray(data.trainingTypes)
        ? data.trainingTypes
        : [];

    const selectedType = educationTypes.find(
        item => item === educationTypeToDelete
    );

    if (!selectedType) {
        closeDeleteModal();
        showStatus("Видът обучение не е намерен.");
        return;
    }

    // Премахваме избрания вид обучение.
    const updatedTypes = educationTypes.filter(
        item => item !== educationTypeToDelete
    );

    const deletedType = educationTypeToDelete;

    // Запазваме останалите данни.
    saveData({
        ...data,

        trainingTypes: updatedTypes,

        trainingType: data.trainingType === deletedType
            ? ""
            : data.trainingType
    });

    renderEducationTypes();

    closeDeleteModal();

    showStatus(
        `Видът обучение "${deletedType}" беше изтрит.`
    );
});

// Отказ
cancelDeleteButton.addEventListener("click", () => {
    closeDeleteModal();
});

// Затваряне на модалния прозорец
function closeDeleteModal() {
    educationTypeToDelete = null;
    deleteModal.hidden = true;
}

// Затваряне при Escape
document.addEventListener("keydown", event => {

    if (event.key === "Escape" && !deleteModal.hidden) {
        closeDeleteModal();
    }
});

// Начално зареждане
renderEducationTypes();