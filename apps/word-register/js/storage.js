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

        return data;
    } catch (error) {
        console.error("Грешка при зареждане на данните:", error);

        return { employees: [] };
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