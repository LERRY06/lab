import { getData, saveData } from "./storage.js";

const form = document.getElementById("trainingForm");
const backButton = document.getElementById("backButton");

const topicField = document.getElementById("trainingTopic");
const versionField = document.getElementById("trainingVersion");

const data = getData();

const topics = Array.isArray(data.trainingTopics)
    ? [...data.trainingTopics]
    : [];

const versions = Array.isArray(data.trainingVersions)
    ? [...data.trainingVersions]
    : [];

// Зареждаме последните въведени стойности.
topicField.value = data.trainingTopic || "";
versionField.value = data.trainingVersion || "";

form.addEventListener("submit", (event) => {
    event.preventDefault();

    const topic = topicField.value.trim();
    const version = versionField.value.trim();

    if (!topic || !version) {
        return;
    }

    // Добавяме новата тема, ако още не съществува.
    if (!topics.some(
        item => item.toLowerCase() === topic.toLowerCase()
    )) {
        topics.push(topic);
    }

    // Добавяме новата версия, ако още не съществува.
    if (!versions.some(
        item => item.toLowerCase() === version.toLowerCase()
    )) {
        versions.push(version);
    }

    saveData({
        trainingTopics: topics,
        trainingVersions: versions,
        trainingTopic: topic,
        trainingVersion: version
    });

    window.location.href = "./index.html";
});

backButton.addEventListener("click", () => {
    window.location.href = "./index.html";
});