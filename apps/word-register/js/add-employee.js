
import { getData, saveData } from "./storage.js";

const form = document.getElementById("employeeForm");
const backButton = document.getElementById("backButton");
const cancelEditButton = document.getElementById("cancelEditButton");
const saveEmployeeButton = document.getElementById("saveEmployeeButton");
const pageTitle = document.getElementById("pageTitle");
const status = document.getElementById("status");

const firstNameField = document.getElementById("firstName");
const middleNameField = document.getElementById("middleName");
const lastNameField = document.getElementById("lastName");
const companyNumberField = document.getElementById("companyNumber");
const positionField = document.getElementById("position");

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

const urlParams = new URLSearchParams(window.location.search);
const editingCompanyNumber = urlParams.get("edit");

function showStatus(message) {
    status.textContent = message;
}

function saveEmployees() {
    saveData({
        ...getData(),
        employees
    });
}

function loadEmployeeForEditing() {
    if (editingCompanyNumber === null) {
        return;
    }

    const employee = employees.find(
        item => item.companyNumber === editingCompanyNumber
    );

    if (!employee) {
        showStatus("Служителят не е намерен.");
        return;
    }

    pageTitle.textContent = "Редактиране на служител";

    firstNameField.value = employee.firstName;
    middleNameField.value = employee.middleName;
    lastNameField.value = employee.lastName;
    companyNumberField.value = employee.companyNumber;
    positionField.value = employee.position;

    saveEmployeeButton.textContent = "Запази промените";
    cancelEditButton.hidden = false;

    showStatus(`Редактиране на: ${employee.fullName}`);
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
    } else {
        employees.push(employeeData);
    }

    saveEmployees();

    // След успешно добавяне или редактиране
    // отваряме списъка със служителите.
    window.location.href = "./employees.html";
});

cancelEditButton.addEventListener("click", () => {
    window.location.href = "./employees.html";
});

backButton.addEventListener("click", () => {
    window.location.href = "./employees.html";
});

loadEmployeeForEditing();