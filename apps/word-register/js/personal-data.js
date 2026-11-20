import { getData, saveData } from "./storage.js";

const form = document.getElementById("employeeForm");
const backButton = document.getElementById("backButton");
const cancelEditButton = document.getElementById("cancelEditButton");
const saveEmployeeButton = document.getElementById("saveEmployeeButton");
const employeeList = document.getElementById("employeeList");
const status = document.getElementById("status");

const firstNameField = document.getElementById("firstName");
const middleNameField = document.getElementById("middleName");
const lastNameField = document.getElementById("lastName");
const companyNumberField = document.getElementById("companyNumber");
const positionField = document.getElementById("position");

// Зареждаме служителите от localStorage.
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

// Съхраняваме фирмения номер на служителя, който редактираме.
let editingCompanyNumber = null;

function saveEmployees() {
    // Запазваме и останалите данни в localStorage.
    saveData({
        ...getData(),
        employees
    });
}

function showStatus(message) {
    status.textContent = message;
}

function clearForm() {
    form.reset();
    editingCompanyNumber = null;

    saveEmployeeButton.textContent = "Добави служител";
    cancelEditButton.hidden = true;
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
            editEmployee(employee.companyNumber);
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

function editEmployee(companyNumber) {
    const employee = employees.find(
        item => item.companyNumber === companyNumber
    );

    if (!employee) {
        showStatus("Служителят не е намерен.");
        return;
    }

    firstNameField.value = employee.firstName;
    middleNameField.value = employee.middleName;
    lastNameField.value = employee.lastName;
    companyNumberField.value = employee.companyNumber;
    positionField.value = employee.position;

    editingCompanyNumber = employee.companyNumber;

    saveEmployeeButton.textContent = "Запази промените";
    cancelEditButton.hidden = false;

    showStatus(`Редактиране на: ${employee.fullName}`);

    form.scrollIntoView({
        behavior: "smooth",
        block: "start"
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

    if (editingCompanyNumber === companyNumber) {
        clearForm();
    }

    renderEmployees();
    showStatus(`Служителят ${employee.fullName} беше изтрит.`);
}

form.addEventListener("submit", event => {
    event.preventDefault();

    const firstName = firstNameField.value.trim();
    const middleName = middleNameField.value.trim();
    const lastName = lastNameField.value.trim();
    const companyNumber = companyNumberField.value.trim();
    const position = positionField.value.trim();

    if (
        !firstName ||
        !middleName ||
        !lastName ||
        !companyNumber ||
        !position
    ) {
        showStatus("Моля, попълнете всички задължителни полета.");
        return;
    }

    // Проверяваме дали фирменият номер вече се използва.
    const duplicate = employees.some(employee =>
        employee.companyNumber.toLowerCase() ===
        companyNumber.toLowerCase() &&
        employee.companyNumber !== editingCompanyNumber
    );

    if (duplicate) {
        showStatus("Вече има служител с този фирмен номер.");
        companyNumberField.focus();
        return;
    }

    const fullName = [
        firstName,
        middleName,
        lastName
    ].join(" ");

    const employeeData = {
        firstName,
        middleName,
        lastName,
        fullName,
        companyNumber,
        position
    };

    if (editingCompanyNumber !== null) {
        const index = employees.findIndex(
            employee =>
                employee.companyNumber === editingCompanyNumber
        );

        if (index === -1) {
            showStatus("Служителят не е намерен.");
            return;
        }

        employees[index] = employeeData;
        showStatus(`Данните на ${fullName} бяха актуализирани.`);
    } else {
        employees.push(employeeData);
        showStatus(`Служителят ${fullName} беше добавен.`);
    }

    saveEmployees();
    clearForm();
    renderEmployees();
});

cancelEditButton.addEventListener("click", () => {
    clearForm();
    showStatus("Редактирането беше отменено.");
});

backButton.addEventListener("click", () => {
    window.location.href = "./index.html";
});

// Показваме записаните служители при отваряне на страницата.
renderEmployees();