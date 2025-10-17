import { logOut } from "./api.js";

// Load header and toast HTML
export async function loadHeaderAndToasts(container) {
    try {
        if (!container) throw new Error(`Container not found`);

        // Load toasts
        await loadToasts();

        // Load header
        await loadHeader(container);

        // Display any success messages from localStorage (when a student is deleted)
        const message = localStorage.getItem("successMessage");
        if (message) {
            showToast("success", message);
            localStorage.removeItem("successMessage");
        }
    } catch (error) {
        console.error("Error loading header or toasts:", error);
        throw new Error("Failed to load header or toasts: " + error.message);
    }
}

// Function that inserts the header.html
export async function loadHeader(container) {
    const response = await fetch('./header.html');
    const html = await response.text();
    container.insertAdjacentHTML('afterbegin', html);
}

// Function that inserts the toast.html
export async function loadToasts(containerSelector = 'body') {
    const response = await fetch('./toast.html');
    const html = await response.text();
    const container = document.querySelector(containerSelector);
    container.insertAdjacentHTML('beforeend', html);
}

// Load shared modals and page settings
export async function loadModalsAndSettings() {
    try {
        await loadModals('../modals/sharedModals.html');

        // Page-specific modals
        if (document.body.dataset.page === "table") {
            await loadModals('../modals/tableModals.html');
        } else if (document.body.dataset.page === "details") {
            await loadModals('../modals/detailsModals.html');
        }

        // Initialize settings (dark mode toggle)
        settingsButton();
        initDarkModeToggle();
    } catch (error) {
        console.error("Error initializing modals or settings:", error);
        showToast("error", "Failed to initialize modals or settings: " + error.message);
    }
}

// Give the current page an underscore
export function highlightCurrentPage() {
    try {
        const currentPage = document.body.dataset.page; // "overview", "table", or "details"
        const headers = document.querySelectorAll("h2[data-page]");

        headers.forEach(h2 => { // Underline the current page
            h2.classList.toggle("current-page", h2.dataset.page === currentPage);
        });
    } catch (e) {
        console.error("highlightCurrentPage failed", e);
        showToast("error", "highlightCurrentPage failed: " + e.message);
    }
}

// Dark mode toggle switch in login.js
export function initDarkModeToggle() {
    const toggle = document.getElementById('darkModeSwitch');

    // Load saved state
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
        toggle.checked = true;
    } else {
        document.body.classList.remove('dark-mode');
        toggle.checked = false;
    }

    // Slider toggle
    applyDarkMode(toggle);
}

// Settings button functionality
export function settingsButton() {
    const btn = document.getElementById('settingsBtn');
    const modal = new bootstrap.Modal(document.getElementById('settingsModal'));

    if (btn) { // Show modal when btn clicked if btn exists
        btn.addEventListener('click', () => {
            modal.show();
        });
    }
}

// Function to edit HTML to show fail warning
export function showLoadFailed(containerId, message) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
        <div class="alert alert-danger text-center">
            Failed to load: ${message}
        </div>
    `;
}

// Success/error toast 
export function showToast(type, message) {
    const toastEl = document.getElementById(`${type}Toast`);
    toastEl.querySelector('.toast-body').textContent = message;
    new bootstrap.Toast(toastEl).show();
}

// Function to load the modals from /modals
export async function loadModals(path) {
    try {
        const response = await fetch(path); // Fetch the modals
        if (!response.ok) {
            console.error(`HTTP ${response.status} when fetching ${path}`);
            showToast("error", `Failed to load modals: ${path}`);
            return; // Exit
        }

        // Insert the modals
        const html = await response.text();
        document.getElementById("modal-container").insertAdjacentHTML("beforeend", html);

        const darkModeToggle = document.getElementById("darkModeToggle");
        if (darkModeToggle) { // Dark mode slider toggle
            applyDarkMode(darkModeToggle); 
        }

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) { // Log out button
            logOut(logoutBtn);
        }
    } catch (error) {
        console.error("Error loading modals:", error);
        showToast("error", "Failed to initialize modals or settings.");
    }
}

// Function to apply dark mode
function applyDarkMode(toggleElement) {
    if (toggleElement) {
        toggleElement.addEventListener('change', () => {
            if (toggleElement.checked) { // If toggle is checked, apply dark mode class
                document.body.classList.add('dark-mode');
                localStorage.setItem('darkMode', 'enabled');
            } else { // If not checked, remove the dark mode class
                document.body.classList.remove('dark-mode');
                localStorage.setItem('darkMode', 'disabled');
            }
        });
    }
}

// Populate fields in the add/edit modals
export function populateModal(teachers, edit = false, student = null) {
    try {
        resetModal(); // Reset modal

        // Populate supervisor dropdown
        const select = document.getElementById('inputSupervisor');
        select.innerHTML = '<option value="">-- Select Supervisor --</option>';
        teachers.forEach(teacher => {
            const option = document.createElement('option');
            option.value = teacher.id;
            option.textContent = `${teacher.firstName} ${teacher.lastName}`;
            select.appendChild(option);
        });

        // Default last contact to today
        const lastContact = document.getElementById('inputLastContact');
        const today = new Date();
        lastContact.value = today.toISOString().split('T')[0]; // YYYY-MM-DD

        // If editing, populate fields with existing student data
        if (edit && student) {
            const fieldMap = {
                firstName: 'inputFirstName',
                lastName: 'inputLastName',
                alias: 'inputAlias',
                studyProgram: 'inputStudyProgram',
                studyPeriod: 'inputStudyPeriod',
                status: 'inputStatus',
                credits: 'inputCredits',
                subjectCredits: 'inputSubjectCredits',
                breadthCredits: 'inputBreadthCredits',
                internshipCredits: 'inputInternshipCredits',
                methodologyCredits: 'inputMethodologyCredits',
                gpa: 'inputGpa',
                commentShort: 'inputCommentShort',
                commentLong: 'inputCommentLong'
            };

            for (const [key, id] of Object.entries(fieldMap)) {
                const el = document.getElementById(id); // Finds the element for each input field in the modal
                if (el) el.value = student[key] ?? ''; // Populate the fields with corresponding key value
            }

            if (student.supervisor && select) select.value = student.supervisor.id; // Selected is the students supervisor
            if (student.lastContact && lastContact) lastContact.value = formatDateForInput(student.lastContact);
            if (student.studiesBegin) document.getElementById('inputStudiesBegin').value = getYearFromISO(student.studiesBegin);
        }
    } catch (error) {
        console.error("Failed to populate modal:", error);
        showToast("error", "Failed to populate modal.");
    }
}

// Get only the year from ISO string
function getYearFromISO(dateStr) {
    const date = new Date(dateStr);
    return date.getFullYear();
}

// Format the date from "dd.mm.yyyy" to acceptable format in the modal
function formatDateForInput(dateString) {
    const [dd, mm, yyyy] = dateString.split('.');
    return `${yyyy}-${mm}-${dd}`;
}

// Empties textfields and sets numberfields to 0
function resetModal() {
    const textFields = [
        'inputFirstName', 'inputLastName', 'inputAlias',
        'inputStudyProgram', 'inputStudyPeriod', 'inputStatusText',
        'inputShortComment', 'inputLongComment', 'inputStatus', 'inputSupervisor'
    ];
    textFields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    const numberFields = [
        'inputCredits', 'inputSubjectCredits', 'inputBreadthCredits',
        'inputInternshipCredits', 'inputMethodologyCredits', 'inputGpa'
    ];
    numberFields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = 0;
    });
}

// Function to check validity of form
export function checkFormValidity(form) {
    const requiredFields = form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        // Remove previous invalid state
        field.classList.remove('is-invalid');

        // Check for empty or spaces-only
        if (!field.value.trim()) {
            field.classList.add('is-invalid'); // Bootstrap invalid style
            field.value = "";
            isValid = false;
        }
    });

    if (!isValid) {
        showToast("error", "Please fill in all required fields correctly.");
        return false; // Stop submission
    }

    if (!form.checkValidity()) {
        form.reportValidity();
        return false; // Stop here if the required fields aren't filled in
    }

    return true;
}

// Function that gathers the information in the fields to create a student object
export function submitStudent(teachers) {
    // Mandatory text fields
    const firstName = document.getElementById('inputFirstName').value.trim();
    const lastName = document.getElementById('inputLastName').value.trim();
    const studyProgram = document.getElementById('inputStudyProgram').value.trim();

    // Other text fields
    const alias = document.getElementById('inputAlias').value.trim();
    const studyPeriod = document.getElementById('inputStudyPeriod').value.trim();
    const studiesBegin = document.getElementById('inputStudiesBegin').value.trim();
    const status = document.getElementById('inputStatus').value;
    const supervisorId = parseInt(document.getElementById('inputSupervisor').value) || null;
    const supervisor = supervisorId ? teachers.find(t => t.id === supervisorId) : null;
    const lastContact = document.getElementById('inputLastContact').value;
    const shortComment = document.getElementById('inputCommentShort').value.trim();
    const longComment = document.getElementById('inputCommentLong').value;

    // Numeric fields — extract values
    const credits = parseFloat(document.getElementById('inputCredits').value) || 0;
    const subjectCredits = parseFloat(document.getElementById('inputSubjectCredits').value) || 0;
    const breadthCredits = parseFloat(document.getElementById('inputBreadthCredits').value) || 0;
    const internshipCredits = parseFloat(document.getElementById('inputInternshipCredits').value) || 0;
    const methodologyCredits = parseFloat(document.getElementById('inputMethodologyCredits').value) || 0;
    const gpa = parseFloat(document.getElementById('inputGpa').value) || 0;

    // Run validation after values are extracted
    if (!validateNumberFields()) {
        throw new Error("One or more numeric fields are invalid.");
    }

    // Construct object matching DB
    const studentData = {
        alias,
        firstName,
        lastName,
        studyProgram,
        studiesBegin,
        studyPeriod,
        status,
        supervisor,
        supervisorId,
        lastContact,
        commentShort: shortComment,
        commentLong: longComment,
        credits,
        subjectCredits,
        breadthCredits,
        internshipCredits,
        methodologyCredits,
        gpa
    };

    return studentData;
}

// Define min/max for each number field
const fieldRules = {
    inputCredits: { min: 0, max: 240 },
    inputSubjectCredits: { min: 0, max: 90 },
    inputBreadthCredits: { min: 0, max: 30 },
    inputInternshipCredits: { min: 0, max: 30 },
    inputMethodologyCredits: { min: 0, max: 30 },
    inputGpa: { min: 0, max: 5 }
};

// Function that checks if the fields entered into the modal are valid
function validateNumberFields() {
    let valid = true;

    Object.entries(fieldRules).forEach(([id, { min, max }]) => {
        const input = document.getElementById(id);
        const value = parseFloat(input.value);

        if (isNaN(value) || value < min || value > max) {
            input.classList.add('is-invalid');
            valid = false;
        } else {
            input.classList.remove('is-invalid');
        }
    });

    return valid;
}