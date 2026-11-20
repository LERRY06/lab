
/**
 * Чете данните от Excel файл.
 * Лист: All
 * Колона A: номер на полето
 * Колона C: стойност за Word
 *
 * Запазва форматираното представяне на стойностите.
 */

async function readExcelData(file) {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onload = function (event) {

            try {

                const data = new Uint8Array(event.target.result);

                const workbook = XLSX.read(data, {
                    type: "array",
                    cellNF: true
                });

                if (!workbook.SheetNames.includes("All")) {
                    throw new Error(
                        'Excel файлът не съдържа лист "All".'
                    );
                }

                const worksheet = workbook.Sheets["All"];

                const range = XLSX.utils.decode_range(
                    worksheet["!ref"] || "A1:C1"
                );

                const result = {};

                // Обхождаме всички редове
                for (let row = range.s.r; row <= range.e.r; row++) {

                    const keyAddress = XLSX.utils.encode_cell({
                        r: row,
                        c: 0
                    });

                    const valueAddress = XLSX.utils.encode_cell({
                        r: row,
                        c: 2
                    });

                    const keyCell = worksheet[keyAddress];
                    const valueCell = worksheet[valueAddress];

                    if (!keyCell || keyCell.v === undefined ||
                        keyCell.v === null || keyCell.v === "") {
                        continue;
                    }

                    const key = String(keyCell.v).trim();

                    if (Object.prototype.hasOwnProperty.call(result, key)) {
                        throw new Error(
                            `Дублиран номер ${key} на ред ${row + 1}.`
                        );
                    }

                    let value = "";

                    if (valueCell && valueCell.v !== undefined) {

                        // Взимаме форматирания текст от Excel
                        value = valueCell.w !== undefined
                            ? valueCell.w
                            : XLSX.utils.format_cell(valueCell);

                    }

                    result[key] = String(value);

                }

                resolve(result);

            } catch (error) {

                reject(error);

            }

        };

        reader.onerror = function () {
            reject(
                new Error("Грешка при прочитането на Excel файла.")
            );
        };

        reader.readAsArrayBuffer(file);

    });

}