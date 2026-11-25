
import { getData, saveData } from "./storage.js";

const employeeList = document.getElementById("employeeList");
const status = document.getElementById("status");

// Модален прозорец
const deleteModal = document.getElementById("deleteEmployeeModal");
const cancelDeleteButton = document.getElementById("cancelDeleteEmployee");
const confirmDeleteButton = document.getElementById("confirmDeleteEmployee");

const initialData = getData();

let employees = Array.isArray(initialData.employees)
    ? initialData.employees.map(employee => ({
        ...employee,
        firstName: employee.firstName || "",
        middleName: employee.middleName || "",
        lastName: employee.lastName || "",
        fullName: employee.fullName ||
            [
                employee.firstName,
                employee.middleName,
                employee.lastName
            ].filter(Boolean).join(" ")
    }))
    : [];

// Служител, избран за изтриване
let employeeToDelete = null;

// Запазване на служителите
function saveEmployees() {
    saveData({
        ...getData(),
        employees
    });
}

// Съобщение за статус
function showStatus(message) {
    status.textContent = message;
}

// Показване на служителите
function renderEmployees() {
    employeeList.replaceChildren();

    if (employees.length === 0) {
        const message = document.createElement("p");
        message.textContent = "Няма записани служители.";
        employeeList.appendChild(message);
        return;
    }

    employees.forEach(employee => {
        const card = document.createElement("section");
        card.className = "employee-card";

        // Имена
        const name = document.createElement("h3");
        name.textContent = employee.fullName || "Без име";

        // Контейнер за информацията и бутоните
        const content = document.createElement("div");
        content.className = "employee-content";

        // Данни за служителя
        const details = document.createElement("div");
        details.className = "employee-details";

        const companyNumber = document.createElement("span");
        companyNumber.textContent =
            `Фирмен №: ${employee.companyNumber || "-"}`;

        const position = document.createElement("span");
        position.textContent =
            `Длъжност: ${employee.position || "-"}`;

        details.append(companyNumber, position);

        // Бутони
        const actions = document.createElement("div");
        actions.className = "employee-actions";

        // Редактиране
        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "employee-btn edit-btn";
        editButton.innerHTML =
            '<i class="fa-solid fa-pen-to-square"></i>';
        editButton.title = "Редактиране";
        editButton.setAttribute(
            "aria-label",
            "Редактиране на " + employee.fullName
        );

        editButton.addEventListener("click", () => {
            window.location.href =
                `./add-employee.html?edit=${encodeURIComponent(employee.companyNumber)}`;
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
            "Изтриване на " + employee.fullName
        );

        deleteButton.addEventListener("click", () => {
            deleteEmployee(employee.companyNumber);
        });

        actions.append(editButton, deleteButton);

        content.append(details, actions);

        card.append(name, content);

        employeeList.appendChild(card);
    });
}

// Отваряне на модалния прозорец
function deleteEmployee(companyNumber) {
    const employee = employees.find(
        item => item.companyNumber === companyNumber
    );

    if (!employee) {
        showStatus("Служителят не е намерен.");
        return;
    }

    employeeToDelete = companyNumber;

    document.getElementById("deleteEmployeeMessage").textContent =
        `Сигурни ли сте, че искате да изтриете служителя "${employee.fullName}"?`;

    deleteModal.hidden = false;

    cancelDeleteButton.focus();
}

// Потвърждение за изтриване
confirmDeleteButton.addEventListener("click", () => {
    if (employeeToDelete === null) return;

    const employee = employees.find(
        item => item.companyNumber === employeeToDelete
    );

    if (!employee) {
        closeDeleteModal();
        showStatus("Служителят не е намерен.");
        return;
    }

    const employeeName = employee.fullName;

    employees = employees.filter(
        item => item.companyNumber !== employeeToDelete
    );

    saveEmployees();
    renderEmployees();

    closeDeleteModal();

    showStatus(`Служителят ${employeeName} беше изтрит.`);
});

// Отказ
cancelDeleteButton.addEventListener("click", () => {
    closeDeleteModal();
});

// Затваряне на модалния прозорец
function closeDeleteModal() {
    employeeToDelete = null;
    deleteModal.hidden = true;
}

// Затваряне при Escape
document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !deleteModal.hidden) {
        closeDeleteModal();
    }
});

// Начално зареждане
renderEmployees();