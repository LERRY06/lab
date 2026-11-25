
import { getData, saveData } from "./storage.js";

const form = document.getElementById("trainingForm");
const backButton = document.getElementById("backButton");
const cancelEditButton = document.getElementById("cancelEditButton");
const saveTrainingButton = document.getElementById("saveTrainingButton");
const pageTitle = document.getElementById("pageTitle");
const status = document.getElementById("status");

const topicField = document.getElementById("trainingTopic");
const versionField = document.getElementById("trainingVersion");

const data = getData();

const topics = Array.isArray(data.trainingTopics)
    ? [...data.trainingTopics]
    : [];

const topicVersions = Array.isArray(data.trainingTopicVersions)
    ? [...data.trainingTopicVersions]
    : [];

topicField.value = data.trainingTopic || "";
versionField.value = data.trainingVersion || "";

const urlParams = new URLSearchParams(window.location.search);
const editingTopic = urlParams.get("edit");

function showStatus(message) {
    status.textContent = message;
}

function saveTrainings(topic, version) {
    saveData({
        ...getData(),
        trainingTopics: topics,
        trainingTopicVersions: topicVersions,
        trainingTopic: topic,
        trainingVersion: version
    });
}



function loadTrainingForEditing() {
    if (editingTopic === null) {
        return;
    }

    const selectedTopic = topicVersions.find(
        item => item.topic === editingTopic
    );

    if (!selectedTopic) {
        showStatus("Обучението не е намерено.");
        return;
    }

    pageTitle.textContent = "Редактиране на обучение";

    topicField.value = selectedTopic.topic;

    if (selectedTopic.versions.length > 0) {
        versionField.value = selectedTopic.versions[0];
    }

    saveTrainingButton.textContent = "Запази промените";
    cancelEditButton.textContent = "Откажи редактирането";
    cancelEditButton.hidden = false;

    showStatus(`Редактиране на: ${selectedTopic.topic}`);
}

form.addEventListener("submit", event => {
    event.preventDefault();

    const topic = topicField.value.trim();
    const version = versionField.value.trim();

    if (!topic || !version) {
        showStatus("Моля, попълнете всички задължителни полета.");
        return;
    }

    // Намираме темата, която се редактира.
    const oldTopic = editingTopic !== null
        ? topicVersions.find(item => item.topic === editingTopic)
        : null;

    if (editingTopic !== null && !oldTopic) {
        showStatus("Обучението не е намерено.");
        return;
    }

    // Добавяме темата, ако не съществува.
    if (!topics.some(
        item => item.toLowerCase() === topic.toLowerCase()
    )) {
        topics.push(topic);
    }

    // При редактиране премахваме старата тема,
    // ако името е променено.
    if (oldTopic && oldTopic.topic.toLowerCase() !== topic.toLowerCase()) {
        const oldIndex = topics.findIndex(
            item => item.toLowerCase() === oldTopic.topic.toLowerCase()
        );

        if (oldIndex !== -1) {
            topics.splice(oldIndex, 1);
        }

        const topicIndex = topicVersions.indexOf(oldTopic);

        if (topicIndex !== -1) {
            topicVersions.splice(topicIndex, 1);
        }
    }

    // Намираме или създаваме темата.
    let selectedTopic = topicVersions.find(
        item => item.topic.toLowerCase() === topic.toLowerCase()
    );

    if (!selectedTopic) {
        selectedTopic = {
            topic: topic,
            versions: []
        };

        topicVersions.push(selectedTopic);
    }

    // Добавяме версията само ако липсва.
    if (!selectedTopic.versions.some(
        item => item.toLowerCase() === version.toLowerCase()
    )) {
        selectedTopic.versions.push(version);
    }

    saveTrainings(topic, version);

    // След запис се връщаме към регистъра.
    window.location.href = "./educations.html";
});

cancelEditButton.addEventListener("click", () => {
    window.location.href = "./educations.html";
});

backButton.addEventListener("click", () => {
    window.location.href = "./educations.html";
});

loadTrainingForEditing();