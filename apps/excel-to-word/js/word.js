
/**
 * Попълва Word шаблон с данните от Excel.
 *
 * @param {File} file - Word шаблон
 * @param {Object} data - Данни от excel.js
 */

async function generateWordDocument(file, data) {

    try {

        // Прочитане на Word файла
        const arrayBuffer = await file.arrayBuffer();

        // Отваряне на DOCX архива
        const zip = new PizZip(arrayBuffer);

        // Създаване на Docxtemplater
        const doc = new docxtemplater(zip, {
            delimiters: {
                start: "{{",
                end: "}}"
            },
            paragraphLoop: true,
            linebreaks: true
        });

        // Попълване на полетата
        doc.render(data);

        // Генериране на DOCX
        const output = doc.getZip().generate({
            type: "blob",
            mimeType:
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        });

        return output;

    } catch (error) {

        console.error("Грешка при генериране на Word:", error);

        throw new Error(
            "Неуспешно попълване на Word шаблона: " +
            error.message
        );

    }

}