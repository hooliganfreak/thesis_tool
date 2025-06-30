const deleteButton = document.getElementById('deleteButton');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const subHeader = document.querySelector('#sub-header section span');
const subHeaderText = subHeader.textContent;

// Runs when the details.html is loaded
document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search); // Get the id from the url parameters
    const studentId = Number(params.get("id"));

    const studentData = await fetchStudentDetails(studentId);

    console.log(studentData)
    showDetails(studentData);
})

// Fetches data for the specific student id
async function fetchStudentDetails(id) {
    try {
        const response = await fetch(`/students/${id}`);

        if (!response.ok) throw new Error('Failed to fetch student details');
        const data = await response.json();

        return data;
    } catch (error) {
        console.error(error);
    }
}

// Main function that shows progress bar, populates the fields, and gives the buttons their functionality
function showDetails(studentData) {
    renderProgress(studentData.status);
    populateFields(studentData);
    buttonFunctionality(studentData.id);
}

// Color the progress bar depending on the status value
function renderProgress(currentStatus) {
    const stages = ["Semi", "Plan", "First", "Second", "TF", "Mognad", "Betyg"];
    const index = stages.indexOf(currentStatus);
    const progress = ((index + 1) / stages.length) * 100;

    const mask = document.getElementById("progressMask");
    mask.style.width = `${100 - progress}%`;

    const progressBar = document.getElementById("progressBar");
    progressBar.style.backgroundColor = getProgressColor(progress);
}

//ONLY FOR TESTING
let detailStatus = "Thesis forum bokat 14.4\nSecond draft inlämnad 20.3\nFirst draft inlämnad 11.2"
const statusContainer = document.getElementById("detailStatusList");

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
    document.getElementById("detailHandledareKommentar").textContent = student.commentLong;

    // Testing the detailStatus
    detailStatus.split('\n').forEach(line => {
        const p = document.createElement("p");
        p.textContent = line;
        statusContainer.appendChild(p);
    });

    let detailSubHeaderText = ` - <strong>${student.firstName} ${student.lastName}</strong>`
    subHeader.innerHTML = subHeader.innerHTML + detailSubHeaderText;
}

// Eventlisteners for the back and delete button
function buttonFunctionality(id) {
    document.getElementById("backButton").addEventListener("click", function () {
        window.location.href = `table.html`;
    });

    deleteButton.addEventListener('click', () => {
        showDeleteModal(id);
    });
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

// Initialize the Bootstrap modal
const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'), {
    keyboard: false,
    backdrop: 'static'
});

// Function to show the modal
let currentDeleteIndex = null;
function showDeleteModal(index) {
    currentDeleteIndex = index;
    deleteModal.show();
    confirmDeleteBtn.focus();
}

// Confirm delete button functionality
confirmDeleteBtn.addEventListener('click', () => {
    console.log("The ID you want to delete is: ", currentDeleteIndex);
    deleteModal.hide();
});