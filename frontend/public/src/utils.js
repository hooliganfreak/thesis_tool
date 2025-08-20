// IN PROGRESS -----------------------------------------------------------------------------

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

// Dark mode setting saves in localStorage
if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    darkModeToggle.checked = true;
}

// Error toast
export function showErrorToast(message) {
    const toastEl = document.getElementById("errorToast");
    toastEl.querySelector(".toast-body").textContent = message;
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
}

// Function to load the modals from /modals
export async function loadModals(path) {
    try {
        const response = await fetch(path);
        const html = await response.text();
        document.getElementById('modal-container').insertAdjacentHTML('beforeend', html);

        const darkModeToggle = document.getElementById('darkModeToggle');

        // Darkmode toggle functionality
        darkModeToggle.addEventListener('change', () => {
            console.log("check");
            if (darkModeToggle.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('darkMode', 'enabled')
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('darkMode', 'disabled');
            }
        })

    } catch (err) {
        console.error(`Failed to load modals from ${path}:`, err);
    }
}

// Function that fetches teacher data from the DB
export async function fetchTeachers() {
    const response = await fetch('/teachers');

    if (!response.ok) {
        let errorMessage = "Failed to fetch teacher details.";
        try {
            const data = await response.json();
            if (data.error) errorMessage = data.error;
        } catch { }

        throw new Error(errorMessage);
    }

    return response.json();
}

// Populate fields in the add/edit modals
export function populateModal(teachers, edit = false, student = null) {
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
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    lastContact.value = `${yyyy}-${mm}-${dd}`;

    // If editing, populate fields with existing student data
    if (edit && student) {
        document.getElementById('inputFirstName').value = student.firstName || '';
        document.getElementById('inputLastName').value = student.lastName || '';
        document.getElementById('inputAlias').value = student.alias || '';
        document.getElementById('inputStudyProgram').value = student.studyProgram || '';
        document.getElementById('inputStudyPeriod').value = student.studyPeriod || '';
        document.getElementById('inputStatus').value = student.status || '';
        document.getElementById('inputCredits').value = student.credits || 0;
        document.getElementById('inputSubjectCredits').value = student.subjectCredits || 0;
        document.getElementById('inputBreadthCredits').value = student.breadthCredits || 0;
        document.getElementById('inputInternshipCredits').value = student.internshipCredits || 0;
        document.getElementById('inputMethodologyCredits').value = student.methodologyCredits || 0;
        document.getElementById('inputGpa').value = student.gpa || 0;
        document.getElementById('inputCommentShort').value = student.commentShort || '';
        document.getElementById('inputCommentLong').value = student.commentLong || '';

        if (student.supervisor) {
            select.value = student.supervisor.id;
        }

        if (student.lastContact) {
            document.getElementById('inputLastContact').value = formatDateForInput(student.lastContact);
        }
    }
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
        return null; // stop if invalid
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
// IN PROGRESS -----------------------------------------------------------------------------