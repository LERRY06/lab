
import { getData, saveData } from "./storage.js";

const educationList = document.getElementById("educationList");
const addButton = document.getElementById("addEducationButton");
const status = document.getElementById("status");

// Модален прозорец
const deleteModal = document.getElementById("deleteEducationModal");
const cancelDeleteButton = document.getElementById("cancelDeleteEducation");
const confirmDeleteButton = document.getElementById("confirmDeleteEducation");
const deleteMessage = document.getElementById("deleteEducationMessage");

// Обучение, избрано за изтриване
let educationToDelete = null;

// Взимаме всички обучения.
function getEducations() {
    const data = getData();

    return Array.isArray(data.trainingTopicVersions)
        ? data.trainingTopicVersions
        : [];
}

// Съобщение за статус
function showStatus(message) {
    status.textContent = message;
}

// Показваме списъка.
function renderEducations() {
    const educations = getEducations();

    educationList.replaceChildren();

    if (educations.length === 0) {
        const empty = document.createElement("div");
        empty.className = "education-empty";
        empty.textContent = "Все още няма добавени обучения.";

        educationList.appendChild(empty);
        return;
    }

    educations.forEach(education => {
        const item = document.createElement("article");
        item.className = "education-item";

        // Заглавие
        const title = document.createElement("h3");
        title.textContent = education.topic;

        // Контейнер за съдържанието и бутоните
        const content = document.createElement("div");
        content.className = "education-content";

        const versions = document.createElement("div");
        versions.className = "education-versions";

        const versionText = Array.isArray(education.versions)
            ? education.versions.join(", ")
            : "";

        versions.textContent = "Версии: " +
            (versionText || "Няма добавени версии");

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
            "Редактиране на " + education.topic
        );

        editButton.addEventListener("click", () => {
            editEducation(education.topic);
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
            "Изтриване на " + education.topic
        );

        deleteButton.addEventListener("click", () => {
            deleteEducation(education.topic);
        });

        actions.append(editButton, deleteButton);

        content.append(versions, actions);

        item.append(title, content);

        educationList.appendChild(item);
    });
}

// Отваряне на страницата за добавяне.
addButton.addEventListener("click", () => {
    window.location.href = "./add-education.html";
});

// Редактиране.
function editEducation(topic) {
    window.location.href =
        `./add-education.html?edit=${encodeURIComponent(topic)}`;
}

// Отваряне на модалния прозорец.
function deleteEducation(topic) {
    const education = getEducations().find(
        item => item.topic === topic
    );

    if (!education) {
        showStatus("Обучението не е намерено.");
        return;
    }

    educationToDelete = topic;

    deleteMessage.textContent =
        `Сигурни ли сте, че искате да изтриете обучението "${topic}" и всичките му версии?`;

    deleteModal.hidden = false;

    cancelDeleteButton.focus();
}

// Потвърждение за изтриване.
confirmDeleteButton.addEventListener("click", () => {
    if (educationToDelete === null) {
        return;
    }

    const data = getData();

    const educations = Array.isArray(data.trainingTopicVersions)
        ? data.trainingTopicVersions
        : [];

    const selectedEducation = educations.find(
        item => item.topic === educationToDelete
    );

    if (!selectedEducation) {
        closeDeleteModal();
        showStatus("Обучението не е намерено.");
        return;
    }

    const deletedTopic = educationToDelete;

    // Премахваме обучението и неговите версии.
    const updatedEducations = educations.filter(
        item => item.topic !== deletedTopic
    );

    // Премахваме темата от списъка с теми.
    const topics = Array.isArray(data.trainingTopics)
        ? data.trainingTopics
        : [];

    const updatedTopics = topics.filter(
        item => item !== deletedTopic
    );

    // Запазваме останалите данни.
    saveData({
        ...data,

        trainingTopics: updatedTopics,
        trainingTopicVersions: updatedEducations,

        // Премахваме последния избор, ако е изтрит.
        trainingTopic: data.trainingTopic === deletedTopic
            ? ""
            : data.trainingTopic,

        trainingVersion: data.trainingTopic === deletedTopic
            ? ""
            : data.trainingVersion
    });

    renderEducations();

    closeDeleteModal();

    showStatus(
        `Обучението "${deletedTopic}" беше изтрито успешно.`
    );
});

// Отказ от изтриване.
cancelDeleteButton.addEventListener("click", () => {
    closeDeleteModal();
});

// Затваряне на модалния прозорец.
function closeDeleteModal() {
    educationToDelete = null;
    deleteModal.hidden = true;
}

// Затваряне при Escape.
document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !deleteModal.hidden) {
        closeDeleteModal();
    }
});

// Начално зареждане.
renderEducations();
