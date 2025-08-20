import { settingsButton, populateModal, fetchTeachers, submitStudent, loadModals, showErrorToast } from "./utils.js";

const subHeader = document.querySelector('#sub-header section span');
const editButton = document.getElementById('showFormButton');

let studentData;
let currentEditId;
let teachers;

// Runs when the details.html is loaded
document.addEventListener("DOMContentLoaded", async () => {
    try {
        await loadModals('../modals/sharedModals.html');
        await loadModals('../modals/detailsModals.html');

        const params = new URLSearchParams(window.location.search);
        const studentId = Number(params.get("id")); // Get the student id from the url parameter

        // Initialize buttons and modals
        settingsButton();
        initEditModal();
        initDeleteModal();
        initBackBtn();

        try { // Try to fetch info and display it
            studentData = await fetchStudentDetails(studentId);
            teachers = await fetchTeachers();
            showDetails(studentData);
        } catch (error) {
            console.error(error);
            showErrorToast(`Load failed: ${error.message}`);
        }
    } catch (error) {
        console.error(error);
        showErrorToast("Initialization failed.");
    }
});

// Fetches data for the specific student id
async function fetchStudentDetails(id) {
    const response = await fetch(`/students/${id}`);

    if (!response.ok) { // If response not ok, generate an error message
        let errorMessage = "Failed to fetch student details.";
        try {
            const data = await response.json();
            if (data.error) errorMessage = data.error;
        } catch {}

        throw new Error(errorMessage);
    }

    return response.json();
}

// Main function that shows progress bar, populates the fields, and gives the buttons their functionality
function showDetails(studentData) {
    renderProgress(studentData.status);
    populateFields(studentData);
}

// --- EDIT ENTRY MODAL ---
function initEditModal() {
    document.body.addEventListener("click", async (e) => {
        // Click listener for the "Edit" button in the edit modal
        if (e.target.matches("#submitEditData")) {
            e.preventDefault();

            // If the required fields arent filled, show validation and exit early
            const form = document.getElementById("editEntryForm");
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            // Collect updated student data from modal inputs
            studentData = submitStudent(teachers);
            if (!studentData) return; // Return if this fails

            try { // Send updated data back to the backend
                const response = await fetch(`/students/${currentEditId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(studentData),
                });

                if (!response.ok) throw new Error("Failed to edit student data");

                // Update local data with response from server
                const updatedStudent = await response.json();
                studentData = updatedStudent;

                // Hide the modal and refresh the details view
                bootstrap.Modal.getInstance(document.getElementById("editEntryModal")).hide();
                showDetails(studentData);
            } catch (error) {
                console.error(error);
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
            const deleteModal = bootstrap.Modal.getOrCreateInstance(deleteModalEl);

            // Save student id in a data attribute on the confirm button
            const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
            confirmDeleteBtn.dataset.id = studentData.id;

            deleteModal.show();
        }

        // When user confirms delete, send a delete to the backend
        if (e.target.matches("#confirmDeleteBtn")) {
            const studentId = e.target.dataset.id; // Extracts the student id from the confirm button
            try {
                const response = await fetch(`/student/${studentId}`, {
                    method: "DELETE",
                });

                if (!response.ok) throw new Error("Failed to delete data");

                // Redirect back to the table page after deletion
                window.location.href = `table.html`;
            } catch (error) {
                console.error(error);
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
            mask.style.width = `${100 - progress}%`;
        });
    });

    // Update progress bar color
    progressBar.style.backgroundColor = getProgressColor(progress);
}

// Functionality for the edit button
editButton.addEventListener('click', () => {
    currentEditId = studentData.id;
    populateModal(teachers, true, studentData); // true = edit mode
});

// Function that populates the fields with student data
function populateFields(student) {
    document.getElementById("detailNamn").textContent = student.firstName;
    document.getElementById("detailEfternamn").textContent = student.lastName;
    document.getElementById("detailLinje").textContent = student.studyProgram;
    document.getElementById("detailStudieTid").textContent = student.studyPeriod;
    document.getElementById("detailHandledare").textContent = student.supervisor.firstName + " " + student.supervisor.lastName.charAt(0);
    document.getElementById("detailSenastKontakt").textContent = student.lastContact;
    document.getElementById("detailSP").textContent = student.credits + "/240";
    document.getElementById("detailÄmnesstudier").textContent = student.subjectCredits + "/90";
    document.getElementById("detailBreddstudier").textContent = student.breadthCredits + "/30";
    document.getElementById("detailPraktik").textContent = student.internshipCredits + "/30";
    document.getElementById("detailMetodik").textContent = student.methodologyCredits + "/30";
    document.getElementById("detailMedeltal").textContent = student.gpa;

    // Preserve line breaks for the long comment
    document.getElementById("detailHandledareKommentar").innerHTML = student.commentLong.replace(/\n/g, "<br>");

    let detailSubHeaderText = ` - <strong>${student.firstName} ${student.lastName}</strong>`
    subHeader.innerHTML = subHeader.innerHTML + detailSubHeaderText;
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