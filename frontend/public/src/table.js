// Script that renders the main table and handles the search and filter function
const tableBody = document.getElementById("studentTable");
const searchInput = document.getElementById("searchInput");
const filterWrapper = document.getElementById("filterWrapper");
const filterIcon = document.getElementById('filterIcon');
const supervisorFilterDropdown = document.getElementById('supervisorFilterDropdown');

let eventlistenerAdded = false;
let students = [];
let filteredStudents = [];

// INITIAL SCRIPT THAT RUNS WHEN DOM IS LOADED
document.addEventListener("DOMContentLoaded", () => {
    async function loadStudents() {
        students = await fetchStudents(); // Wait for the data to be fetched
        console.log('Students fetched from DB: ', students);
        students = students.sort((a, b) => a.firstName.localeCompare(b.firstName)); // Sorts the list alphabetically by default
        renderTable(students);
    }

    loadStudents();
});

// Function that fetches student data from the DB
async function fetchStudents() {
    try {
        const response = await fetch('/students');

        if (!response.ok) throw new Error('Failed to fetch student data');
        const data = await response.json();

        return data;
    } catch (error) {
        console.error(error);
    }
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

    // Once the tableBody has been generated, add an eventlistener to each row ONCE
    if (!eventlistenerAdded) {
        eventlistenerAdded = true;
        addEventListenerToTable();
    }
}

// Handles the search function
filteredStudents = [...students];
searchInput.addEventListener("input", () => {
    const searchValue = searchInput.value.toLowerCase();
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
        if (supervisor) {
            console.log(students)
            filteredStudents = students.filter(student => student.supervisor.firstName === supervisor); // Filter by supervisor
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

// Function that adds eventlisteners to the student data table rows
function addEventListenerToTable() {
    // Make rows clickable for editing
    tableBody.addEventListener("click", (event) => {
        if (event.target.tagName === "TD") {
            const row = event.target.closest("tr");

            const index = row.getAttribute('data-index');
            if (!index) return;

            const student = students.find(student => student.id == index);

            window.location.href = `./details.html?id=${student.id}`;
        }
    });
}

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