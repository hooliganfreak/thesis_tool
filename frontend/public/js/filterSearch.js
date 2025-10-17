import { renderTable } from "./table.js";

const searchInput = document.getElementById("searchInput");
const filterMenuButton = document.getElementById("filterMenuButton")
const clearFilter = document.getElementById('clearFilter');
const clearSearch = document.getElementById('clearSearch');

let students = []
let teachers = []

// Global filter states
let activeFilters = {
    inactive: false,
    supervisorId: null,
    year: null
};

// Populate the filter dropdown with supervisors and studies begin year
export function populateDropDownSubMenus(fetchedStudents, fetchedTeachers) {
    if (!fetchedStudents || !fetchedTeachers) return;
    students = fetchedStudents;
    teachers = fetchedTeachers;

    // Supervisor submenu
    const supervisorMenu = document.querySelector('#supervisorDropdown + .dropdown-menu');
    supervisorMenu.innerHTML = '' // Clear options

    // Populate the supervisor dropdown in filter
    teachers.forEach(teacher => {
        const option = document.createElement('a');
        option.classList.add('dropdown-item');
        option.href = '#';
        option.dataset.supervisorId = Number(teacher.id);
        option.textContent = `${teacher.firstName} ${teacher.lastName.charAt(0)}`;
        supervisorMenu.appendChild(option);
    })

    // Year submenu (current year -5/+1)
    const yearMenu = document.querySelector('#yearDropdown + .dropdown-menu');
    yearMenu.innerHTML = '';

    const date = new Date();
    let year = date.getFullYear();

    // Create an array from this year - 5 to this year + 1
    const years = Array.from({ length: 7}, (_,i) => year - 5 +i)

    // Populate the year dropdown
    years.forEach(year => {
        const option = document.createElement('a');
        option.classList.add('dropdown-item');
        option.href = '#';
        option.dataset.year = year;
        option.textContent = year;
        yearMenu.appendChild(option);
    });
}

let filteredStudents = [];
// Selects what to filter based on the selected filters
function applyFilters() {
    filteredStudents  = [...students]; // Copy of students

    // Clear all active highlights
    filterDropdown.querySelectorAll('.active-filter').forEach(el => el.classList.remove('active-filter'));

    // Filter by supervisorId and update highlight
    if (activeFilters.supervisorId) {
        filteredStudents = filteredStudents.filter(s => Number(s.supervisor.id) === Number(activeFilters.supervisorId));

        const el = filterDropdown.querySelector(`[data-supervisor-id="${activeFilters.supervisorId}"]`);
        el?.classList.add('active-filter');
    }

    // Filter by year and update highlight
    if (activeFilters.year) {
        filteredStudents = filteredStudents.filter(s => {
            const year = new Date(s.studiesBegin).getFullYear();
            return String(year) === String(activeFilters.year);
        });

        const el = filterDropdown.querySelector(`[data-year="${activeFilters.year}"]`);
        el?.classList.add('active-filter');
    }

    // Filter by inactive and update highlight
    if (activeFilters.inactive) {
        const now = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(now.getMonth() - 3);

        filteredStudents = filteredStudents.filter(s => {
            const [day, month, year] = s.updated.split('.'); // Date is in "dd.mm.yyyy" format
            const updatedDate = new Date(year, month - 1, day) // Date is in "yyyy.mm.dd" format (must be this format for new Date() to work)
            return updatedDate < threeMonthsAgo;
        })

        const el = filterDropdown.querySelector(`[data-filter="inactive"]`);
        el?.classList.add('active-filter');
    }

    // Check if any filter exists
    const hasActiveFilters = activeFilters.supervisorId || activeFilters.year || activeFilters.inactive;

    // Show or hide the filter "X" if filters are active or not
    clearFilter.style.display = hasActiveFilters ? "inline" : "none";

    // Add or remove the active-filter class from the main filter button
    filterMenuButton.classList.toggle('active-filter', !!hasActiveFilters);

    updateSubHeader(); // Update the subHeader based on selected filters
    renderTable(filteredStudents, true); // Render the table with filtered students
}

// Handles the search function
const handleSearch = () => {
    const searchValue = searchInput.value.toLowerCase().trim(); // Removes spaces and makes it lowercase
    clearSearch.style.display = searchValue.length > 0 ? "block" : "none"; // If we are searching, show the "X"

    if (searchValue.length < 2) {
        renderTable(students); // If the search input is empty, only spaces or too short, show full list
        return;
    }

    // Filtered searched students
    const filtered = students.filter(student => {
        const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
        return fullName.includes(searchValue);
    });

    // Render table with searched students
    renderTable(filtered, true);
}
searchInput.addEventListener("input", debounce(handleSearch, 250)); // eventListener with 250ms debounce delay

// https://stackoverflow.com/questions/75988682/debounce-in-javascript
function debounce(fn, delay) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
}

// Show filter dropdown submenu (supervisor/year) on hover
document.querySelectorAll('.dropdown-submenu').forEach(sub => {
    const menu = sub.querySelector('.dropdown-menu'); // The sub dropdown menu
    sub.addEventListener('mouseenter', () => menu.classList.add('show'));
    sub.addEventListener('mouseleave', () => menu.classList.remove('show'));
});

// Handle main dropdown leave
const filterDropdown = document.querySelector('.dropdown');
filterDropdown.addEventListener('mouseleave', () => {
    // Close all submenus when mouse leaves the filterDropdown container
    filterDropdown.querySelectorAll('.dropdown-menu.show').forEach(menu => {
        menu.classList.remove('show');
    });

    // Close the main dropdown (Bootstrap instance)
    const bsDropdown = bootstrap.Dropdown.getInstance(document.getElementById('filterMenuButton'));
    if (bsDropdown) bsDropdown.hide();
});

// Apply filter eventListener to the filterDropdown container
filterDropdown.addEventListener('click', e => {
    const item = e.target.closest('[data-supervisor-id], [data-year], [data-filter="inactive"]');
    if (!item) return; // Ignore clicks outside filter items

    e.preventDefault();
    e.stopPropagation();

    const { supervisorId, year, filter } = item.dataset;
    
    // Set values in activeFilters list
    if (supervisorId) { // Toggle on/off when the same supervisor is clicked again
        activeFilters.supervisorId = activeFilters.supervisorId === supervisorId ? null : supervisorId;
    } else if (year) { // Toggle on/off when the same year is clicked again
        activeFilters.year = activeFilters.year === year ? null : year;
    } else if (filter === "inactive") { // Toggle between true/false
        activeFilters.inactive = !activeFilters.inactive;
    }

    // Apply the filters and update UI
    applyFilters();

    // Close dropdown after filter selection
    const dropdown = bootstrap.Dropdown.getInstance(document.getElementById('filterMenuButton'));
    if (dropdown) dropdown.hide();
});

// Function that updates the subheader and displays which filters are active etc.
function updateSubHeader() {
    const subHeaderSection = document.querySelector("#sub-header section span");
    let text = "Informationsteknik";
    let filterText = '';

    // Year filter
    if (activeFilters.year) {
        filterText += ` - ${activeFilters.year}`;
    }

    // Supervisor filter
    if (activeFilters.supervisorId && teachers) {
        const teacher = teachers.find(t => String(t.id) === String(activeFilters.supervisorId));
        if (teacher) {
            filterText += ` - Supervisor: ${teacher.firstName} ${teacher.lastName.charAt(0)}`;
        }
    }

    // Inactive filter
    if (activeFilters.inactive) {
        filterText += " - Inactive";
    }

    // Update subheader HTML
    subHeaderSection.innerHTML = `${text}<strong>${filterText}</strong>`;
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
        const studentsToSort = filteredStudents.length ? filteredStudents : students; // If there are filters applied, use those students else use all students
        renderTable(studentsToSort);
        return;
    }

    const stages = ["Semi", "Plan", "First", "Second", "TF", "Mognad", "Betyg"];
    const studentsToSort = filteredStudents.length ? filteredStudents : students // If there are filters applied, use those students else use all students
    const sortedStudents = [...studentsToSort].sort((a, b) => {
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

// Parse date from DD.MM.YYYY to YYYY.MM.DD
function parseDate(str) {
    const [day, month, year] = str.split('.');
    return new Date(year, month - 1, day);
}

// Function for the clear filter "X" button 
clearFilter.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent Bootstrap stuff from firing

    const subHeaderSection = document.querySelector("#sub-header section span");

    // Remove filter UI from dropdown
    filterDropdown.querySelectorAll('.active-filter').forEach(el => el.classList.remove('active-filter'));

    // Reset active filter states
    activeFilters.supervisorId = null;
    activeFilters.year = null;
    activeFilters.inactive = false;

    filterMenuButton.classList.remove("active-filter"); // Remove the "active-filter" css
    clearFilter.style.display = "none"; // Hide the "X" since no filter is active

    // Showing all students since filters were removed
    subHeaderSection.innerHTML = `Informationsteknik - <strong>All Students</strong>`;

    // Close dropdown after selection
    const dropdown = bootstrap.Dropdown.getInstance(document.getElementById('filterMenuButton'));
    if (dropdown) dropdown.hide();

    filteredStudents = []; // Empty filteredStudents to enable sorting with all students
    renderTable(students, false); // When we press the "X" (remove filter), render the original complete list
})

// Function for the clear search "X" button 
clearSearch.addEventListener('click', () => {
    searchInput.value = ""; // Empty the search input
    clearSearch.style.display = "none"; // Hide the "X"
    searchInput.focus(); // Focus on the search bar

    renderTable(students); // When we press the "X" (remove search input), render the original complete list
})