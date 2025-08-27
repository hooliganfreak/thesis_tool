// Script that renders the main table and handles the search and filter function
import { settingsButton, populateModal, submitStudent, 
    fetchTeachers, loadModals, showErrorToast, 
    checkFormValidity, showLoadFailed, showSuccessToast,
    fetchStudentData, addStudent } from "./utils.js";

const tableBody = document.getElementById("studentTable");
const searchInput = document.getElementById("searchInput");
const filterContainer = document.getElementById("filterContainer");
const filterWrapper = document.getElementById("filterWrapper");
const filterIcon = document.getElementById('filterIcon');
const clearFilter = document.getElementById('clearFilter');
const clearSearch = document.getElementById('clearSearch');
const supervisorFilterDropdown = document.getElementById('supervisorFilterDropdown');

let students = [];
let filteredStudents = [];
let teachers = [];

// INITIAL SCRIPT THAT RUNS WHEN DOM IS LOADED
document.addEventListener("DOMContentLoaded", () => {
    initPage().catch(error => {
        console.error("Initialization error:", error);
        showErrorToast(`Initialization failed: ${error.message}`);
    });
});

// Main initialization function
async function initPage() {
    // Display any success messages from localStorage
    const message = localStorage.getItem("successMessage");
    if (message) {
        showSuccessToast(message);
        localStorage.removeItem("successMessage");
    }

    // Initialize modals and settings
    await initModalsAndSettings();

    // Load table data
    await loadStudents();
}

// Initialize modals and page settings
async function initModalsAndSettings() {
    try {
        await loadModals('../modals/sharedModals.html');
        await loadModals('../modals/tableModals.html');
        settingsButton();
        initializeTableModals();
    } catch (error) {
        console.error("Error initializing modals or settings:", error);
        throw new Error("Failed to initialize modals or settings.");
    }
}

// Fetch student and teacher data, then render the table
async function loadStudents() {
  try {
    students = await fetchStudentData();
    teachers = await fetchTeachers();

    // Sort students alphabetically by first name
    students.sort((a,b) => a.firstName.localeCompare(b.firstName));
    renderTable(students); // Writes into <tbody id="studentTable">
  } catch (err) {
    console.error(err);
    showErrorToast(`Load failed: ${err.message}`)
    showLoadFailed("table-container", "Failed to load students."); 
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
            showErrorToast("Form submission failed.");
            return; // Stop here if studentData for some reason doesn't exist
        }

        try { // If validity is ok and studentData is successful, send a POST
            await addStudent(studentData);

            // Success: hide modal and reload students
            bootstrap.Modal.getInstance(document.getElementById('addEntryModal')).hide() // Hide the modal
            showSuccessToast('Student created successfully.');
            await loadStudents(); // If all ok, run loadStudents again

        } catch (error) {
            console.error(error);
            showErrorToast(error.message || "Something went wrong while adding the student.");
        }
    });
}

// Render the main data table
function renderTable(data, isFiltered = false) {
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

    // Add click event to each row in tableBody
    tableBody.addEventListener("click", (event) => {
        if (event.target.tagName === "TD") {
            const row = event.target.closest("tr");
            const student = students.find(s => s.id == row.dataset.index);
            if (student) window.location.href = `./details.html?id=${student.id}`;
        }
    });
}

// Handles the search function
filteredStudents = [...students];
searchInput.addEventListener("input", () => {
    const searchValue = searchInput.value.toLowerCase();
    clearSearch.style.display = searchValue.length > 0 ? "block" : "none";

    if (searchValue === '') { // If the search input is removed, for example after doing a search, re-render the complete list
        filteredStudents = [...students];
        renderTable(filteredStudents, true);
        return;
    }

    if (searchValue.trim().length < 2) return; // If the search input is empty, only spaces or too short, exit

    filteredStudents = students.filter(student => {
        const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
        return fullName.includes(searchValue);
    });

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

        let filteredStudents = students; // "All Supervisors" show the original list of students
        if (supervisor !== '') { // If "All Supervisors" is NOT selected
            console.log(students)
            filterContainer.classList.add("active-filter");
            clearFilter.style.display = "inline";
            filteredStudents = students.filter(student => student.supervisor.firstName === supervisor); // Filter by supervisor
        } else { // If "All Supervisors" IS selected
            filterContainer.classList.remove("active-filter");
            clearFilter.style.display = "none";
        }

        // Re-render the table with filtered students
        renderTable(filteredStudents, true);

        // Close the dropdown after selection
        supervisorFilterDropdown.style.display = 'none';
    }
});

// Function to hide the supervisor filter dropdown when the mouse leaves both the dropdown and the filter icon
function hideDropdownOnLeave(event) {
    if (!supervisorFilterDropdown.contains(event.relatedTarget) && !filterContainer.contains(event.relatedTarget)) {
        supervisorFilterDropdown.style.display = 'none';
    }
}
filterContainer.addEventListener('mouseleave', hideDropdownOnLeave);
supervisorFilterDropdown.addEventListener('mouseleave', hideDropdownOnLeave);

// Function for the clear filter "X" button 
clearFilter.addEventListener('click', () => {
    filterContainer.classList.remove("active-filter"); // Remove the "active-filter" css
    clearFilter.style.display = "none"; // Hide the "X" since no filter is active

    renderTable(students, false); // When we press the "X" (remove filter), render the original complete list
})

// Function for the clear search "X" button 
clearSearch.addEventListener('click', () => {
    searchInput.value = ""; // Empty the search input
    clearSearch.style.display = "none"; // Hide the "X"
    searchInput.focus(); // Focus on the search bar

    renderTable(students); // When we press the "X" (remove search input), render the original complete list
})

// Track current sort state
let currentSortKey = null;
let currentSortDirection = null;

// Handles the sort function for the SP, Status and Updated columns
document.querySelectorAll('th.sortable .sortable-content').forEach(icon => {
    icon.addEventListener('click', () => {
        const th = icon.closest('th');
        const sortKey = th.getAttribute('data-key');

        // Remove underline from all th
        document.querySelectorAll('th.sortable').forEach(header => {
            header.style.textDecoration = "none";
        });

        // Determine new direction
        if (currentSortKey === sortKey) {
            // Cycle asc -> desc -> none -> asc ...
            // If direction is asc or desc an underline is added to visualize the sorted column
            if (currentSortDirection === 'asc') {
                currentSortDirection = 'desc';
                th.style.textDecoration = "underline";
            } else if (currentSortDirection === 'desc') {
                currentSortDirection = null;
                currentSortKey = null;
            } else {
                currentSortDirection = 'asc';
                th.style.textDecoration = "underline";
            }
        } else { // New column clicked
            currentSortKey = sortKey;
            currentSortDirection = 'asc';
            th.style.textDecoration = "underline"; // Give the new sorted column an underline
        }

        // Update icons
        updateSortIcon(currentSortKey, currentSortDirection);
        sortTable(currentSortKey, currentSortDirection);
    });
});

// Function that updates the sort icon depending on which column in sorted in which direction
function updateSortIcon(sortKey, direction) {
    // Reset all icons to neutral
    document.querySelectorAll('th.sortable i').forEach(icon => {
        icon.classList.remove('bi-arrow-up', 'bi-arrow-down');
        icon.classList.add('bi-arrow-down-up');
    });

    if (!sortKey || !direction) return; // Nothing to highlight

    // If the relevant th or icon doesnt exist, return early
    const th = document.querySelector(`th.sortable[data-key="${sortKey}"]`);
    if (!th) return;

    const icon = th.querySelector('i');
    if (!icon) return;

    // Remove the updown icon and add the icon corresponding to the sort direction
    icon.classList.remove('bi-arrow-down-up');
    icon.classList.add(direction === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down');
}

// Function that sorts the column
function sortTable(key, direction) {
    // If there is no sort condition, render the original table
    if (!key || !direction) {
        renderTable(students);
        return;
    }

    const stages = ["Semi", "Plan", "First", "Second", "TF", "Mognad", "Betyg"];
    const sortedStudents = [...students].sort((a, b) => {
        let valA = a[key];
        let valB = b[key];

        if (key === 'credits') { // When sorting SP, compare valA with valB
            valA = parseInt(valA);
            valB = parseInt(valB);
        } else if (key === 'status') { // When sorting Status, compare index of valA in stages with index of valB in stages
            valA = stages.indexOf(valA);
            valB = stages.indexOf(valB);
        } else { // When sorting Updated, compare the date of valA with the date of valB
            valA = parseDate(valA);
            valB = parseDate(valB);
        }

        if (valA < valB) return direction === 'asc' ? 1 : -1;
        if (valA > valB) return direction === 'asc' ? -1 : 1;
        return 0;
    })

    // Render the table with the sorted students
    renderTable(sortedStudents);
}

function parseDate(str) {
    const [day, month, year] = str.split('.');
    return new Date(`${year}-${month}-${day}`);
}