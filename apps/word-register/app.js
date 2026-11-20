import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    WidthType,
    HeadingLevel,
} from "docx";

import PizZip from "pizzip";
import { getData } from "./js/storage.js";

const form = document.getElementById("dataForm");
const status = document.getElementById("status");
const wordFile = document.getElementById("wordFile");
const saveButton = document.getElementById("saveButton");
const modeInputs = document.querySelectorAll('input[name="mode"]');

const employeeSelect = document.getElementById("employeeSelect");
const companyNumberField = document.getElementById("companyNumber");
const employeePositionField = document.getElementById("employeePosition");

const trainingTypeSelect = document.getElementById("trainingType");
const trainingTopicSelect = document.getElementById("trainingTopic");
const trainingVersionSelect = document.getElementById("trainingVersion");

function fillSelect(select, items, placeholder) {
    select.replaceChildren(new Option(placeholder, ""));

    items.forEach((item) => {
        select.add(new Option(item, item));
    });
}

function loadEmployeeData() {
    const data = getData();

    const employees = Array.isArray(data.employees)
        ? data.employees
        : [];

    employeeSelect.replaceChildren(
        new Option("-- Избери служител --", "")
    );

    employees.forEach((employee) => {
        const fullName = employee.fullName ||
            [
                employee.firstName,
                employee.middleName,
                employee.lastName
            ].filter(Boolean).join(" ");

        const option = new Option(
            fullName,
            employee.companyNumber
        );

        employeeSelect.add(option);
    });
}

function updateEmployeeFields() {
    const data = getData();

    const employees = Array.isArray(data.employees)
        ? data.employees
        : [];

    const employee = employees.find(
        item => item.companyNumber === employeeSelect.value
    );

    companyNumberField.value = employee?.companyNumber || "";
    employeePositionField.value = employee?.position || "";
}

function loadTrainingData() {
    const data = getData();

    const trainingTypes = Array.isArray(data.trainingTypes)
        ? data.trainingTypes
        : [];

    const trainingTopics = Array.isArray(data.trainingTopics)
        ? data.trainingTopics
        : [];

    const trainingVersions = Array.isArray(data.trainingVersions)
        ? data.trainingVersions
        : [];

    fillSelect(
        trainingTypeSelect,
        trainingTypes,
        "-- Избери вид обучение --"
    );

    fillSelect(
        trainingTopicSelect,
        trainingTopics,
        "-- Избери тема --"
    );

    fillSelect(
        trainingVersionSelect,
        trainingVersions,
        "-- Избери версия --"
    );
}

loadEmployeeData();
loadTrainingData();

employeeSelect.addEventListener("change", updateEmployeeFields);

const columns = [
    "№",
    "Тема на обучение",
    "Версия",
    "Вид обучение",
    "Дата"
];

modeInputs.forEach((radio) => {
    radio.addEventListener("change", () => {
        const existingMode =
            document.querySelector('input[name="mode"]:checked').value
            === "existing";

        wordFile.disabled = !existingMode;
        wordFile.required = existingMode;

        saveButton.textContent = existingMode
            ? "Добави запис и изтегли Word"
            : "Създай Word документ";

        status.textContent = "";
    });
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.textContent = "";

    const mode = document.querySelector(
        'input[name="mode"]:checked'
    ).value;

    // Проверяваме отново избрания служител от localStorage.
    const data = getData();
    const employees = Array.isArray(data.employees)
        ? data.employees
        : [];

    const employee = employees.find(
        item => item.companyNumber === employeeSelect.value
    );

    if (!employee) {
        status.textContent = "Моля, избери валиден служител.";
        employeeSelect.focus();
        return;
    }

    const fullName = employee.fullName ||
        [
            employee.firstName,
            employee.middleName,
            employee.lastName
        ].filter(Boolean).join(" ");

    const values = [
        trainingTopicSelect.value,
        trainingVersionSelect.value,
        trainingTypeSelect.value,
        formatDate(document.getElementById("date").value),
    ];

    if (
        !values[0] ||
        !values[1] ||
        !values[2] ||
        !document.getElementById("date").value
    ) {
        status.textContent = "Моля, попълни всички задължителни полета.";
        return;
    }

    if (mode === "existing" && !wordFile.files[0]) {
        status.textContent = "Избери Word документ.";
        return;
    }

    saveButton.disabled = true;
    saveButton.textContent = "Обработка...";
    status.textContent = "Подготвя се документът...";

    try {
        let blob;

        if (mode === "new") {
            blob = await createNewDocument(values, {
                fullName,
                companyNumber: employee.companyNumber,
                position: employee.position
            });
        } else {
            blob = await appendToDocument(wordFile.files[0], values);
        }

        const filename = createWordFilename(employee, mode);

        downloadBlob(blob, filename);

        status.textContent =
            "Документът е готов за изтегляне. Оригиналният файл не е променен.";
    } catch (error) {
        console.error("Грешка при обработка на документа:", error);

        status.textContent =
            "Не успяхме да обработим документа. Провери дали е валиден .docx файл и дали съдържа таблица със 7 колони. Подробностите са в Console (F12).";
    } finally {
        saveButton.disabled = false;

        saveButton.textContent =
            document.querySelector('input[name="mode"]:checked').value
                === "existing"
                ? "Добави запис и изтегли Word"
                : "Създай Word документ";
    }
});

async function createNewDocument(values, employeeInfo) {
    const makeCell = (text, bold = false) =>
        new TableCell({
            children: [
                new Paragraph({
                    children: [new TextRun({ text, bold })],
                }),
            ],
        });

    const table = new Table({
        width: {
            size: 100,
            type: WidthType.PERCENTAGE,
        },
        rows: [
            new TableRow({
                tableHeader: true,
                children: columns.map((name) => makeCell(name, true)),
            }),
            new TableRow({
                children: [
                    makeCell("1"),
                    ...values.map((value) => makeCell(value)),
                ],
            }),
        ],
    });

    const document = new Document({
        sections: [{
            children: [
                new Paragraph({
                    children: [
                        new TextRun({
                            text: employeeInfo.fullName,
                            bold: true,
                        }),
                        new TextRun({
                            text: " | Фирмен номер: " +
                                employeeInfo.companyNumber,
                        }),
                        new TextRun({
                            text: " | Длъжност: " +
                                employeeInfo.position,
                        }),
                    ],
                }),
                new Paragraph(""),
                table,
            ],
        }],
    });

    return await Packer.toBlob(document);
}

async function appendToDocument(file, values) {
    if (!file.name.toLowerCase().endsWith(".docx")) {
        throw new Error("Избраният файл не е DOCX.");
    }

    const zip = new PizZip(await file.arrayBuffer());
    const documentXml = zip.file("word/document.xml");

    if (!documentXml) {
        throw new Error("Липсва Word документът в DOCX архива.");
    }

    const xmlText = documentXml.asText();
    const xml = new DOMParser().parseFromString(
        xmlText,
        "application/xml"
    );

    if (xml.getElementsByTagName("parsererror").length > 0) {
        throw new Error("XML съдържанието е невалидно.");
    }

    const ns =
        "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

    const tables = xml.getElementsByTagNameNS(ns, "tbl");

    if (tables.length === 0) {
        throw new Error("Документът не съдържа таблица.");
    }

    const table = tables[0];
    const rows = Array.from(
        table.getElementsByTagNameNS(ns, "tr")
    ).filter(row => row.parentNode === table);

    if (rows.length === 0) {
        throw new Error("В таблицата няма редове.");
    }

    if (values.length !== 4) {
        throw new Error(
            "Записът трябва да съдържа точно 4 стойности."
        );
    }

    const getCells = (row) =>
        Array.from(row.children).filter(
            element =>
                element.namespaceURI === ns &&
                element.localName === "tc"
        );

    // Проверяваме последния ред на таблицата.
    const lastRow = rows[rows.length - 1];
    const lastCells = getCells(lastRow);

    if (lastCells.length !== 5) {
        throw new Error(
            "Таблицата трябва да има 5 колони: номер и 4 полета."
        );
    }

    // Определяме следващия пореден номер.
    // Първият ред е заглавният.
    const nextNumber = rows.length;

    // Копираме последния ред, за да запазим оформлението.
    const newRow = lastRow.cloneNode(true);
    const newCells = getCells(newRow);

    // Първата клетка съдържа поредния номер.
    replaceCellText(
        xml,
        newCells[0],
        String(nextNumber),
        ns
    );

    // Останалите четири клетки съдържат данните за обучението.
    for (let i = 0; i < values.length; i++) {
        replaceCellText(
            xml,
            newCells[i + 1],
            values[i],
            ns
        );
    }

    table.appendChild(newRow);

    const serializer = new XMLSerializer();

    zip.file(
        "word/document.xml",
        serializer.serializeToString(xml)
    );

    return zip.generate({
        type: "blob",
        mimeType:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        compression: "DEFLATE",
    });
}

function replaceCellText(xml, cell, value, ns) {
    const textNodes = cell.getElementsByTagNameNS(ns, "t");

    if (textNodes.length > 0) {
        textNodes[0].textContent = value;
        textNodes[0].setAttributeNS(
            "http://www.w3.org/XML/1998/namespace",
            "xml:space",
            "preserve"
        );

        for (let i = 1; i < textNodes.length; i++) {
            textNodes[i].textContent = "";
        }

        return;
    }

    const paragraph = xml.createElementNS(ns, "w:p");
    const run = xml.createElementNS(ns, "w:r");
    const text = xml.createElementNS(ns, "w:t");

    text.textContent = value;
    text.setAttributeNS(
        "http://www.w3.org/XML/1998/namespace",
        "xml:space",
        "preserve"
    );

    run.appendChild(text);
    paragraph.appendChild(run);
    cell.appendChild(paragraph);
}

function formatDate(value) {
    if (!value) return "";

    const [year, month, day] = value.split("-");
    return `${day}.${month}.${year}`;
}

function createWordFilename(employee, mode) {
    const fullName = [employee.firstName, employee.middleName, employee.lastName].filter(Boolean).join("-");

    const safeName = (fullName || employee.fullName || "sluzhitel")
        .trim()
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
        .replace(/\s+/g, "-");

    const companyNumber = String(employee.companyNumber || "")
        .trim()
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_");

    const baseName = `${safeName}_${companyNumber}_досие`;

    if (mode === "new") {
        return `${baseName}.docx`;
    }

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const date = `${year}-${month}-${day}`;

    return `${baseName}_version_${date}.docx`;
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1500);
}

// Връщане към началното меню.
backButton.addEventListener("click", () => {
    window.location.href = "./index.html";
});