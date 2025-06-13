import { renderTable, tableBody } from "./renderTable.js";
import { showDetails } from "./renderDetails.js";

const searchInput = document.getElementById("searchInput");
const filterWrapper = document.getElementById("filterWrapper");
const filterIcon = document.getElementById('filterIcon');
const supervisorFilterDropdown = document.getElementById('supervisorFilterDropdown');
const tableContainer = document.getElementById("table-container")
const searchBar = document.getElementById("search-bar")
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

export const subHeader = document.querySelector('#sub-header section span');
export const subHeaderText = subHeader.textContent;

let students = [];
let filteredStudents = [];

export function setStudentList(data) { // Is this smooth? This makes sure that students is the complete list, and only filteredStudents gets changes on search/filter
    students = data.sort((a, b) => a.namn.localeCompare(b.namn)); // Sorts the list alphabetically by default
    renderTable(data);
}

// Modal and Buttons
const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'), {
    keyboard: false,
    backdrop: 'static'
}); // Initialize the Bootstrap modal

let currentDeleteIndex = null;
// Function to show the modal
export function showDeleteModal(index) {
    // Show the modal
    currentDeleteIndex = index;
    deleteModal.show();
    confirmDeleteBtn.focus();
}

confirmDeleteBtn.addEventListener('click', () => {
    console.log("The ID you want to delete is: ", currentDeleteIndex);
    deleteModal.hide();
});

// Handles the search function
filteredStudents = [...students];
searchInput.addEventListener("input", () => {
    const searchValue = searchInput.value.toLowerCase();
    filteredStudents = students.filter(student =>
        student.namn.toLowerCase().includes(searchValue)
    );
    renderTable(filteredStudents, true);
})

// Handles the filter dropdown menu
filterWrapper.addEventListener('click', () => {
    const isVisible = supervisorFilterDropdown.style.display === 'block';
    supervisorFilterDropdown.style.display = isVisible ? 'none' : 'block';

    // Ensure dropdown aligns properly under the icon
    const rect = filterIcon.getBoundingClientRect();
    supervisorFilterDropdown.style.left = `${rect.left}px`; // Align with the left of the Filter icon
    supervisorFilterDropdown.style.top = `${rect.bottom}px` // Align with the bottom of the Filter icon
})

// Handle supervisor selection from dropdown
supervisorFilterDropdown.addEventListener('click', (event) => {
    if (event.target.classList.contains('dropdown-item')) {
        const supervisor = event.target.getAttribute('data-supervisor');

        let filteredStudents = students; // Detta så att "All Supervisors" visar den ursprungliga listan
        if (supervisor) {
            filteredStudents = students.filter(student => student.handledare === supervisor); // Denna hämtar bara den valda handledaren
        }

        // Re-render the table with filtered students
        renderTable(filteredStudents, true);

        // Close the dropdown after selection
        supervisorFilterDropdown.style.display = 'none';
    }
});

// Check if the mouse moves from the filterWrapper to NEITHER the filterWrapper OR the supervisorFilterDropdown
filterWrapper.addEventListener('mouseleave', (event) => {
    if (!supervisorFilterDropdown.contains(event.relatedTarget) && // Check if mouse is leaving to the dropdown
        !filterWrapper.contains(event.relatedTarget) // Check if mouse is leaving to the filter wrapper
    ) {
        supervisorFilterDropdown.style.display = 'none'; // Hide the dropdown
    }
});

// Check if the mouse moves from the supervisorFilterDropdown to NEITHER the supervisorFilterDropdown OR the filterWrapper 
supervisorFilterDropdown.addEventListener('mouseleave', (event) => {
    if (!supervisorFilterDropdown.contains(event.relatedTarget) && // Check if mouse is leaving to the dropdown
        !filterWrapper.contains(event.relatedTarget) // Check if mouse is leaving to the filter wrapper
    ) {
        supervisorFilterDropdown.style.display = 'none'; // Hide the dropdown
    }
});

export function addEventListenerToTable() {
    // Make rows clickable for editing
    tableBody.addEventListener("click", (event) => {
        if (event.target.tagName === "TD") {
            const row = event.target.closest("tr");

            const index = row.getAttribute('data-index');
            if (!index) return;

            const student = students.find(student => student.id == index);

            hideElements();
            showDetails(student);
        }
    });
}

function hideElements() {
    tableContainer.classList.add('hidden');
    searchBar.classList.add('hidden');
}

export function showElements() {
    document.getElementById("detail-view").classList.add("d-none");
    subHeader.innerText = subHeaderText;
    tableContainer.classList.remove('hidden');
    searchBar.classList.remove('hidden');
}