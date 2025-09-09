// Load header and toast HTML
export async function loadHeaderAndToasts(container) {
    try {
        if (!container) throw new Error(`Container not found`);

        // Load toasts
        await loadToasts();

        // Load header
        await loadHeader(container);

        // Display any success messages from localStorage
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

        headers.forEach(h2 => {
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

    if (btn) {
        btn.addEventListener('click', () => {
            modal.show();
        });
    }
}

// Success/error toast 
export function showToast(type, message) {
    const toastEl = document.getElementById(`${type}Toast`);
    toastEl.querySelector('.toast-body').textContent = message;
    new bootstrap.Toast(toastEl).show();
}

// Populates the filter dropdown with supervisors from the DB
export async function populateFilterDropdown() {
    try {
        const teachers = await fetchTeachers();

        const supervisorDropdown = document.getElementById('supervisorSubmenu');

        teachers.forEach(teacher => {
            const option = document.createElement('a');
            option.classList.add('dropdown-item');
            option.href = '#';
            option.dataset.supervisorId = teacher.id;
            option.textContent = `${teacher.firstName} ${teacher.lastName.charAt(0)}`;
            supervisorDropdown.appendChild(option);
        });
    } catch (error) {
        console.error("Failed to populate filter dropdown: " + error.message)
        showToast("error", "Failed to populate filter dropdown: " + error.message);
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

// Function to load the modals from /modals
export async function loadModals(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) {
            console.error(`HTTP ${response.status} when fetching ${path}`);
            showToast("error", `Failed to load modals: ${path}`);
            return; // Exit
        }

        const html = await response.text();
        document.getElementById("modal-container").insertAdjacentHTML("beforeend", html);

        const darkModeToggle = document.getElementById("darkModeToggle");
        if (darkModeToggle) {
            applyDarkMode(darkModeToggle); // Slider toggle
        }
    } catch (error) {
        console.error("Error loading modals:", error);
        showToast("error", "Failed to initialize modals or settings.");
    }
}

function applyDarkMode(toggleElement) {
    if (toggleElement) {
        toggleElement.addEventListener('change', () => {
            if (toggleElement.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('darkMode', 'enabled');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('darkMode', 'disabled');
            }
        });
    }
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

// Populate fields in the add/edit modals
export function populateModal(teachers, edit = false, student = null) {
    try {
        resetModal();

        // Populate supervisor dropdown
        const select = document.getElementById('inputSupervisor');
        select.innerHTML = '<option value="">-- Select Handledare --</option>';
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

            if (student.supervisor && select) select.value = student.supervisor.id;
            if (student.lastContact && lastContact) lastContact.value = formatDateForInput(student.lastContact);
        }
    } catch (error) {
        console.error("Failed to populate modal:", error);
        showToast("error", "Failed to populate modal.");
    }
}

// Function to check validity of token
export async function checkAuth() {
    const token = localStorage.getItem("jwtToken");

    if (!token) {
        handleUnauthorized();
        return false; // Token is invalid
    }

    try {
        const res = await fetch("/auth-check", { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) {
            handleUnauthorized();
            return false; // Token is invalid
        }

        const data = await res.json();
        return { valid: data.valid, user: data.user }; // Token is valid
    } catch (err) {
        console.error("Auth check failed", err);
        localStorage.removeItem("jwtToken");
        localStorage.setItem("authError", "Something went wrong authorizing token.");
        window.location.href = "/login.html";
        return false; // /auth-check failed
    }
}

// Fetch helper
export async function fetchJSON(url, options = {}, errorMessage = "Request failed") {
    /* Makes the header contain e.g. : 
    { 
    "Content-Type": "application/json",
    Authorization: "Bearer abc123"
    }   
    */
    options.headers = { ...options.headers, ...getAuthHeaders() };

    // Do the fetch with the token in the header
    const response = await fetch(url, options);
    if (!response.ok) {
        let data;

        try {
            data = await response.json();
        } catch (error) { }

        // If auth failed (401) stop here
        if (response.status === 401) {
            handleUnauthorized();
            return;
        }

        // If auth ok but fetch failed for some other reason, throw an error
        let errMsg = `${errorMessage}: ${response.status}`;
        if (data?.error) errMsg = `${errorMessage}: ${data.error}`;
        if (data?.message) errMsg = `${errorMessage}: ${data.message}`;
        throw new Error(errMsg);
    }
    return response.json();
}

export async function fetchStudentData() {
    return fetchJSON(`/students`, { method: "GET" }, "Failed to fetch student data");
}

export async function fetchStudentDetails(id) {
    return fetchJSON(`/students/${id}`, { method: "GET" }, "Failed to fetch student details");
}

export async function deleteStudent(id) {
    return fetchJSON(`/student/${id}`, { method: "DELETE" }, "Failed to delete student");
}

export async function addStudent(studentData) {
    return fetchJSON(`/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentData),
    }, "Failed to create student");
}

export async function updateStudent(id, studentData) {
    return fetchJSON(`/students/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentData),
    }, "Failed to update student data");
}

export async function loginUser(username, password) {
    return fetchJSON(`/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    }, "Login failed");
}

// Function that fetches teacher data from the DB
export async function fetchTeachers() {
    return fetchJSON(`/teachers`, { method: "GET" }, "Failed to fetch teacher details");
}

// Returns headers object containing JWT if it exists
function getAuthHeaders() {
    const token = localStorage.getItem("jwtToken"); // Get JWT from localStorage
    return token ? { Authorization: `Bearer ${token}` } : {}; // Return authorization header if token exists
}

// Redirects to login if the token is invalid
function handleUnauthorized() {
    localStorage.setItem("authError", "Invalid or expired token. Please log in again.");
    localStorage.removeItem("jwtToken");
    window.location.href = "/login.html"; // Redirect to login page
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

// Function that gathers the information in the fields to create a student object
export function submitStudent(teachers) {
    // Mandatory text fields
    const firstName = document.getElementById('inputFirstName').value.trim();
    const lastName = document.getElementById('inputLastName').value.trim();
    const studyProgram = document.getElementById('inputStudyProgram').value.trim();

    // Other text fields
    const alias = document.getElementById('inputAlias').value.trim();
    const studyPeriod = document.getElementById('inputStudyPeriod').value.trim();
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