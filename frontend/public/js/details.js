import { populateModal, highlightCurrentPage, loadHeaderAndToasts, loadModalsAndSettings } from "./modals.js";
import { fetchTeachers, fetchStudentDetails, updateStudent, deleteStudent, checkAuth } from "./api.js";
import { submitStudent, checkFormValidity, showLoadFailed, showToast  } from "./modals.js";

let subHeader;
let baseSubHeader;
let studentData;
let currentEditId;
let teachers;
const editButton = document.getElementById('showFormButton');

// Main function that runs when DOMContentLoaded
document.addEventListener("DOMContentLoaded", async () => {
    const auth = checkAuth();
    if (!auth) return; // Stop page initialization if theres no token

    initPage().catch(error => {
        console.error("Initialization error:", error);
        showToast("error", `Initialization failed: ${error.message}`);
    });
});

// Function that loads modals and initializes the UI
async function initPage() {
    const params = new URLSearchParams(window.location.search);
    const studentId = Number(params.get("id")); // Get the student id from the url parameter
    const container = document.getElementById("mainContainer");

    // Load header and toasts (critical)
    await loadHeaderAndToasts(container); // Throws an error if fails => fatal and stops initPage
    subHeader = document.querySelector("#sub-header section span");
    baseSubHeader = subHeader.innerHTML;

    // Loads modals and settings
    await loadModalsAndSettings();

    // Underscores the selected page
    highlightCurrentPage()

    // Functionality of the buttons
    initUI()

    // Load and show student details
    await loadAndShowStudent(studentId)
}

// Initializes buttons
function initUI() {
    initEditModal();
    initDeleteModal();
    initBackBtn();
}

// Loads and shows the student details
async function loadAndShowStudent(studentId) {
    try {
        studentData = await fetchStudentDetails(studentId);
        teachers = await fetchTeachers();
        showDetails(studentData);
    } catch (error) {
        console.error("Error loading student:", error);
        showToast("error", `Load failed: ${error.message}`);
        showLoadFailed('detail-view', "The fetch for this user failed.");
    }
}

// Main function that shows progress bar, populates the fields, and gives the buttons their functionality
function showDetails(studentData) {
    renderProgress(studentData.status);
    populateFields(studentData);

    const detailView = document.getElementById("detail-view")
    const loadingWrapper = document.getElementById('loadingWrapper');

    loadingWrapper.classList.add('d-none');
    detailView.classList.remove('d-none');
}

// --- EDIT ENTRY MODAL ---
function initEditModal() {
    document.body.addEventListener("click", async (e) => {
        // Click listener for the "Edit" button in the edit modal
        if (e.target.matches("#submitEditData")) {
            e.preventDefault();
            const form = document.getElementById("editEntryForm"); // The form element

            if (!checkFormValidity(form)) return; // Stop here if form invalid

            try {
                // Collect updated student data from modal inputs
                studentData = submitStudent(teachers);
                const updatedStudent = await updateStudent(currentEditId, studentData);
                studentData = updatedStudent;

                // Hide modal and refresh view
                bootstrap.Modal.getInstance(document.getElementById("editEntryModal")).hide();
                showDetails(studentData);
                showToast("success", 'Data edited successfully.');
            } catch (error) {
                console.error(error);
                showToast("error", error.message);
            }
        }
    });
}

// --- DELETE MODAL ---
function initDeleteModal() {
    document.body.addEventListener("click", async (e) => {
        // Click listener for the "Delete" button in the details view
        if (e.target.matches("#deleteButton")) {
            const deleteModalEl = document.getElementById("deleteModal");

            try {
                const deleteModal = bootstrap.Modal.getOrCreateInstance(deleteModalEl);
                // Save student id in a data attribute on the confirm button
                const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
                confirmDeleteBtn.dataset.id = studentData.id;

                deleteModal.show();
            } catch (error) {
                console.error("Failed to show delete modal:", error);
                showToast("error", "Could not open delete confirmation dialog.");
            }
        }

        // When user confirms delete, send a delete to the backend
        if (e.target.matches("#confirmDeleteBtn")) {
            const studentId = e.target.dataset.id; // Extracts the student id from the confirm button
            try {
                await deleteStudent(studentId);

                // Redirect back to the table page after deletion
                localStorage.setItem("successMessage", "Student deleted successfully!");
                window.location.href = "table.html";
            } catch (error) {
                console.error(error);
                showToast("error", error.message);
            }
        }
    });
}

// --- BACK BUTTON ---
function initBackBtn() {
    document.body.addEventListener("click", (e) => {
        if (e.target.matches("#backButton")) { // Navigate back to the table view
            window.location.href = "table.html";
        }
    });
}

// Color the progress bar depending on the status value
function renderProgress(currentStatus) {
    const stages = ["Semi", "Plan", "First", "Second", "TF", "Mognad", "Betyg"];
    const index = stages.indexOf(currentStatus);
    const progress = ((index + 1) / stages.length) * 100;

    const mask = document.getElementById("progressMask");
    const progressBar = document.getElementById("progressBar");

    // Reset mask to 100% (no color is shown)
    mask.style.transition = 'none';
    mask.style.width = '100%';

    requestAnimationFrame(() => { // Apply transition and slide to the new width
        requestAnimationFrame(() => { // Trick to make it work smoothly (don't know why, found online)
            mask.style.transition = 'width 0.5s ease-in-out';
            mask.style.width = `${100 - progress}% `;
        });
    });

    // Update progress bar color
    progressBar.style.backgroundColor = getProgressColor(progress);
}

// Edit button functionality
editButton.addEventListener('click', () => {
    currentEditId = studentData.id;
    populateModal(teachers, true, studentData); // true = edit mode
});

// Function that populates the fields with student data
function populateFields(student) {
    const fieldMap = { // Map the ids an values
        detailNamn: student.firstName,
        detailEfternamn: student.lastName,
        detailLinje: student.studyProgram || "-",
        detailStudieTid: student.studyPeriod || "-",
        detailHandledare: `${student.supervisor.firstName} ${student.supervisor.lastName.charAt(0)}`,
        detailSenastKontakt: student.lastContact || "-",
        detailSP: `${student.credits || 0}/240`,
        detailÄmnesstudier: `${student.subjectCredits || 0}/90`,
        detailBreddstudier: `${student.breadthCredits || 0}/30`,
        detailPraktik: `${student.internshipCredits || 0}/30`,
        detailMetodik: `${student.methodologyCredits || 0}/30`,
        detailMedeltal: student.gpa || "-"
    };

    for (const [id, value] of Object.entries(fieldMap)) {
        const el = document.getElementById(id); // Find the element
        if (el) el.textContent = value; // Give the element the corresponding value
    }

    // Preserve line breaks for the long comment
    document.getElementById("detailHandledareKommentar").innerHTML = student.commentLong.replace(/\n/g, "<br>");

    // Reset subheader each time, then add the name
    subHeader.innerHTML = `Informationsteknik - <strong>${student.firstName} ${student.lastName}</strong>`;
}

// Get a color along a red -> yellow -> green color gradient corresponding to the progress value
function getProgressColor(progress) {
    let r, g;
    if (progress < 50) {
        // 0% to 50% → red to yellow
        r = 255;
        g = Math.round(255 * (progress / 50));
    } else {
        // 50% to 100% → yellow to green
        r = Math.round(255 * (1 - (progress - 50) / 50));
        g = 255;
    }
    return `rgb(${r}, ${g}, 0)`;
}