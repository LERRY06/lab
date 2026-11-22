
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        employees: resolve(__dirname, "employees.html"),
        addEmployee: resolve(__dirname, "add-employee.html"),
        additionalData: resolve(__dirname, "additional-data.html"),
        trainingType: resolve(__dirname, "training-type.html"),
        wordRegister: resolve(__dirname, "word-register.html"),
      },
    },
  },
});
