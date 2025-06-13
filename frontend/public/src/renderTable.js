// Function that renders the main table and handles the search and filter function
import { addEventListenerToTable } from "./utils.js";

export const tableBody = document.getElementById("studentTable");
let eventlistenerAdded = false;

export function renderTable(data, isFiltered = false) { // Update this when the front-end design is confirmed
    if (data.length == 0 || !data) {
        const message = isFiltered
            ? "No entries found using the filter."
            : "No entries found.";

        tableBody.innerHTML = `
        <tr class="no-data">
            <td colspan="16" class="text-center">${message}</td>
        </tr>
    `;
        return;
    }
    console.log(data);
    // All info is in data, change this when the front-end design is confirmed
    tableBody.innerHTML = data.map((student) => `
        <tr data-index="${student.id}">
            <td style="width: 15%;">${student.namn} ${student.efternamn}</td> 
            <td style="width: 15%;">${student.alias}</td> 
            <td style="width: 5%;">${student.sp}</td> 
            <td style="width: 7%;">${student.status}</td> 
            <td style="width: 8%;">${student.handledare}</td> 
            <td style="width: 35%;">${student.handledareKommentar}</td>
            <td style="width: 10%;" class="text-end">${student.uppdaterad}</td> 
        </tr>
    `).join('');

    // Once the tableBody has been generated, add an eventlistener to each row ONCE
    if (!eventlistenerAdded) {
        eventlistenerAdded = true;
        addEventListenerToTable();
    }
}

// Formats the status updated date
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0'); // Add leading zero if day is a single digit
    const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() returns 0-based month, so add 1
    const year = date.getFullYear();

    return `${year}-${month}-${day}`; // Return in DD/MM/YYYY format
}