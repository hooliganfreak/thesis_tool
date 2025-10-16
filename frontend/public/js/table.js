// Script that renders the main table and handles the search and filter function
import { populateModal, submitStudent, checkFormValidity, 
    showLoadFailed, showToast, loadHeaderAndToasts, 
    loadModalsAndSettings, highlightCurrentPage } 
from "./modals.js";
import { fetchTeachers, fetchStudentData, addStudent, checkAuth } from "./api.js";
import { populateDropDownSubMenus } from "./filterSearch.js";

const tableBody = document.getElementById("studentTable");
const contentContainer = document.getElementById("contentContainer")
let loadingWrapper;

let students = [];
let teachers = [];

// INITIAL SCRIPT THAT RUNS WHEN DOM IS LOADED
document.addEventListener("DOMContentLoaded", async () => {
    const auth = checkAuth();
    if (!auth) return; // Stop page initialization if theres no token

    initPage().catch(error => {
        console.error("Initialization error:", error);
        showToast("error", `Initialization failed: ${error.message}`);
    });
});

// Main initialization function
async function initPage() {
    const container = document.getElementById("mainContainer")

    // Load header and toasts (critical)
    await loadHeaderAndToasts(container); // Throws an error if fails => fatal and stops initPage

    // Loads modals and settings
    await loadModalsAndSettings();

    // Underscores the selected page
    highlightCurrentPage(); 

    // Populates the "Add Entry" modal
    initializeTableModals();

    // Load table data
    await loadStudents();

    populateDropDownSubMenus(students, teachers);
}

// Fetch student and teacher data, then render the table
async function loadStudents() {
    loadingWrapper = document.getElementById('loadingWrapper');

    try {
        students = await fetchStudentData(); // Fetch all students
        teachers = await fetchTeachers(); // Fetch all teachers

        // Sort students alphabetically by first name
        students.sort((a, b) => a.firstName.localeCompare(b.firstName));
        renderTable(students); // Writes into <tbody id="studentTable">
    } catch (err) {
        console.error(err);
        showToast("error", `Load failed: ${err.message}`)
        showLoadFailed("table-container", "Failed to load students.");
        loadingWrapper.classList.add('d-none');
        contentContainer.classList.remove('d-none');
    }
}

// Function that initializes the modals loaded from /modals
function initializeTableModals() {
    document.getElementById('showFormButton').addEventListener('click', () => populateModal(teachers)); // Populates the add/edit modal supervisor dropdown
    document.getElementById('submitAddData').addEventListener('click', async (e) => {
        e.preventDefault();
        const form = document.getElementById('addEntryForm'); // The form element

        if (!checkFormValidity(form)) return; // Stop here if form invalid

        const studentData = submitStudent(teachers); // Submit data from the modal
        if (!studentData) {
            showToast("error", "Form submission failed.");
            return; // Stop here if studentData for some reason doesn't exist
        }

        try { // If validity is ok and studentData is successful, send a POST
            await addStudent(studentData);

            // Success: hide modal and reload students
            bootstrap.Modal.getInstance(document.getElementById('addEntryModal')).hide() // Hide the modal
            showToast("success", 'Student created successfully.');
            await loadStudents(); // If all ok, run loadStudents again
        } catch (error) {
            console.error(error);
            showToast("error", error.message || "Something went wrong while adding the student.");
        }
    });
}

// Render the main data table
export function renderTable(data, isFiltered = false) {
    if (data.length == 0 || !data) { // If there is no data, or the search input matches no entry
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

    // Display all the info in data
    tableBody.innerHTML = data.map((student) => `
        <tr data-index="${student.id}">
            <td style="width: 15%;">${student.firstName} ${student.lastName}</td> 
            <td style="width: 15%;">${student.alias}</td> 
            <td style="width: 5%;">${student.credits}</td> 
            <td style="width: 7%;">${student.status}</td> 
            <td style="width: 8%;">${student.supervisor.firstName}</td> 
            <td style="width: 35%;">${student.commentShort}</td>
            <td style="width: 10%;" class="text-end">${student.updated}</td> 
        </tr>
    `).join('');

    loadingWrapper.classList.add('d-none'); // Once renderTable is complete, hide the loading spinner
    contentContainer.classList.remove('d-none'); // Show the student table
}

// Add click event to each row in tableBody
tableBody.addEventListener("click", (event) => {
    const row = event.target.closest("tr[data-index]");
    if (!row) return;

    const student = students.find(s => s.id == row.dataset.index);
    if (student) window.location.href = `./details.html?id=${student.id}`;
});