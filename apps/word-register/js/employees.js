
import { getData, saveData } from "./storage.js";

const employeeList = document.getElementById("employeeList");
const status = document.getElementById("status");

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

function saveEmployees() {
    saveData({
        ...getData(),
        employees
    });
}

function showStatus(message) {
    status.textContent = message;
}

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

        const name = document.createElement("h3");
        name.textContent = employee.fullName;

        const details = document.createElement("p");
        details.textContent =
            `Фирмен номер: ${employee.companyNumber} | ` +
            `Длъжност: ${employee.position}`;

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Редактирай";

        editButton.addEventListener("click", () => {
            window.location.href =
                `./add-employee.html?edit=${encodeURIComponent(employee.companyNumber)}`;
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Изтрий";

        deleteButton.addEventListener("click", () => {
            deleteEmployee(employee.companyNumber);
        });

        card.append(name, details, editButton, deleteButton);
        employeeList.appendChild(card);
    });
}

function deleteEmployee(companyNumber) {
    const employee = employees.find(
        item => item.companyNumber === companyNumber
    );

    if (!employee) {
        showStatus("Служителят не е намерен.");
        return;
    }

    if (!window.confirm(
        `Сигурни ли сте, че искате да изтриете ${employee.fullName}?`
    )) {
        return;
    }

    employees = employees.filter(
        item => item.companyNumber !== companyNumber
    );

    saveEmployees();
    renderEmployees();

    showStatus(`Служителят ${employee.fullName} беше изтрит.`);
}

renderEmployees();
