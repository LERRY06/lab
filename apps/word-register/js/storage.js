
const STORAGE_KEY = "wordRegisterData";

export function getData() {
    try {
        const data = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "{}"
        );

        // Съвместимост със старите данни.
        if (!Array.isArray(data.employees)) {
            data.employees = [];

            if (
                data.firstName ||
                data.middleName ||
                data.lastName
            ) {
                data.employees.push({
                    id: "legacy-employee",
                    firstName: data.firstName || "",
                    middleName: data.middleName || "",
                    lastName: data.lastName || "",
                    companyNumber: data.companyNumber || "",
                    position: data.position || ""
                });
            }
        }

        // Проверка на масивите с обучения.
        if (!Array.isArray(data.trainingTypes)) {
            data.trainingTypes = [];
        }

        if (!Array.isArray(data.trainingTopics)) {
            data.trainingTopics = [];
        }

        if (!Array.isArray(data.trainingTopicVersions)) {
            data.trainingTopicVersions = [];
        }

        return data;

    } catch (error) {
        console.error("Грешка при зареждане на данните:", error);

        return {
            employees: [],
            trainingTypes: [],
            trainingTopics: [],
            trainingTopicVersions: []
        };
    }
}

export function saveData(newData) {
    const currentData = getData();

    const updatedData = {
        ...currentData,
        ...newData
    };

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedData)
    );

    return updatedData;
}

export function getEmployees() {
    return getData().employees || [];
}

export function saveEmployees(employees) {
    return saveData({ employees });
}

// Връща всички теми на обученията.
export function getTrainingTopics() {
    const data = getData();

    return Array.isArray(data.trainingTopics)
        ? data.trainingTopics
        : [];
}

// Връща версиите на избрана тема.
export function getTrainingVersions(topic) {
    if (!topic) {
        return [];
    }

    const data = getData();

    const topics = Array.isArray(data.trainingTopicVersions)
        ? data.trainingTopicVersions
        : [];

    const selectedTopic = topics.find(item =>
        item &&
        typeof item.topic === "string" &&
        item.topic.toLowerCase() === topic.trim().toLowerCase()
    );

    return Array.isArray(selectedTopic?.versions)
        ? selectedTopic.versions
        : [];
}

// Връща всички видове обучения.
export function getTrainingTypes() {
    const data = getData();

    return Array.isArray(data.trainingTypes)
        ? data.trainingTypes
        : [];
}

// Запазва видовете обучения.
export function saveTrainingTypes(trainingTypes) {
    return saveData({ trainingTypes });
}
