
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
        educations: resolve(__dirname, "educations.html"),
        addEducation: resolve(__dirname, "add-education.html"),
        educationTypes: resolve(__dirname, "education-types.html"),
        addEducationType: resolve(__dirname, "add-education-type.html"),
        wordRegister: resolve(__dirname, "word-register.html"),
      },
    },
  },
});
