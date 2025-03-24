import { fetchStudents } from "./getStudentData.js";
import { setStudentList } from "./renderTable.js";

document.addEventListener("DOMContentLoaded", () => {
    let students = [];

    async function loadStudents() {
        students = await fetchStudents(); // Wait for the data to be fetched
        setStudentList(students); // Render the table after data is fetched
    }

    //renderTable(students);
    loadStudents();
});
