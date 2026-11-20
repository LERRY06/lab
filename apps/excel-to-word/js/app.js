
const excelInput = document.getElementById("excelFile");
const wordInput = document.getElementById("wordFile");

const excelStatus = document.getElementById("excelStatus");
const wordStatus = document.getElementById("wordStatus");

const generateButton = document.getElementById("generateButton");
const message = document.getElementById("message");

let excelFile = null;
let wordFile = null;

// Проверка на избраните файлове
function checkFiles() {
    generateButton.disabled = !(excelFile && wordFile);
}

// Избор на Excel
excelInput.addEventListener("change", function () {

    excelFile = this.files[0] || null;

    excelStatus.textContent = excelFile
        ? "Избран файл: " + excelFile.name
        : "Няма избран файл";

    message.textContent = "";

    checkFiles();
});

// Избор на Word
wordInput.addEventListener("change", function () {

    wordFile = this.files[0] || null;

    wordStatus.textContent = wordFile
        ? "Избран файл: " + wordFile.name
        : "Няма избран файл";

    message.textContent = "";

    checkFiles();
});

// Генериране на Word документ
generateButton.addEventListener("click", async function () {

    if (!excelFile || !wordFile) {
        return;
    }

    try {

        generateButton.disabled = true;
        generateButton.textContent = "Генериране...";
        message.textContent = "Обработване на файловете...";

        // 1. Прочитане на Excel
        const excelData = await readExcelData(excelFile);

        // Проверка за данни
        if (Object.keys(excelData).length === 0) {
            throw new Error("В Excel файла няма данни за обработка.");
        }

        // 2. Генериране на Word
        const wordBlob = await generateWordDocument(
            wordFile,
            excelData
        );

        // 3. Създаване на име на файла
        const fileName = wordFile.name.replace(/\.docx$/i, "");

        // 4. Изтегляне
        const downloadUrl = URL.createObjectURL(wordBlob);

        const link = document.createElement("a");

        link.href = downloadUrl;
        link.download = fileName + "_popalnen.docx";

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(downloadUrl);

        message.textContent = "Документът е генериран успешно!";

    } catch (error) {

        console.error(error);

        message.textContent = "Грешка: " + error.message;

    } finally {

        generateButton.disabled = !(excelFile && wordFile);
        generateButton.textContent = "Генерирай Word документ";

    }

});