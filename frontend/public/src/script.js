import { fetchStudents } from "./getStudentData.js";
import { setStudentList } from "./renderTable.js";

document.addEventListener("DOMContentLoaded", () => {
    /*const students = [
        {
            name: "Alice",
            studierattensSlut: "2025-06-01",
            tfDatum: "2025-03-15",
            tfTid: "14:00",
            arbetetsID: "12345",
            anmalTillSisu: "Yes",
            planenOk: "Yes",
            bestalldArbete: "Yes",
            skickadGranskaren: "Yes",
            reggadSisu: "Yes",
            studieInfo: "Studying hard",
            supervisorComment: "Great progress!",
            title: "Project 1",
            comment: "No major issues.",
            handledare: "Jonny",
            statusUppdaterat: "2025-03-10"
        },
        {
            name: "Bob",
            studierattensSlut: "2025-08-15",
            tfDatum: "2025-03-10",
            tfTid: "10:30",
            arbetetsID: "67890",
            anmalTillSisu: "No",
            planenOk: "No",
            bestalldArbete: "No",
            skickadGranskaren: "No",
            reggadSisu: "No",
            studieInfo: "Needs improvement",
            supervisorComment: "Waiting on draft.",
            title: "Project 2",
            comment: "Delayed start",
            handledare: "Dennis",
            statusUppdaterat: "2025-03-05"
        },
        {
            name: "Charlie",
            studierattensSlut: "2025-12-20",
            tfDatum: "2025-03-20",
            tfTid: "12:00",
            arbetetsID: "11223",
            anmalTillSisu: "Yes",
            planenOk: "Yes",
            bestalldArbete: "Yes",
            skickadGranskaren: "No",
            reggadSisu: "Yes",
            studieInfo: "Excellent work",
            supervisorComment: "Needs minor revisions.",
            title: "Project 3",
            comment: "Keep up the good work.",
            handledare: "Magnus",
            statusUppdaterat: "2025-03-12"
        }
    ];*/

    const sortIcon = document.getElementById("sortIcon"); // Sort functionality not yet implemented
    let students = [];

    async function loadStudents() {
        students = await fetchStudents(); // Wait for the data to be fetched
        setStudentList(students); // Render the table after data is available
    }

    //renderTable(students);
    loadStudents();
});
