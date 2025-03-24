// Function that renders the table and handles the search and filter function
import { showDeleteModal } from "./utils.js"

const tableBody = document.getElementById("studentTable");
const filterIcon = document.getElementById("filterIcon");
const searchInput = document.getElementById("searchInput");
let students = []; // Global variable to store student data
let filteredStudents = []; // Used for searching/filtering
let eventlistenerAdded = false;

export function setStudentList(data) { // Is this smooth? This makes sure that students is the complete list, and only filteredStudents gets changes on search/filter
    students = data.sort((a, b) => a.name.localeCompare(b.name)); // Sorts the list alphabetically by default
    renderTable(students);
}

function renderTable(data) { // Update this when the front-end design is confirmed
    if (data.length == 0 || !data) {
        tableBody.innerHTML = `
        <tr>
            <td colspan="16" style="text-align: center;">No entries found.</td> 
        </tr>
    `;
        return;
    }

    // All info is in data, change this when the front-end design is confirmed
    tableBody.innerHTML = data.map((student) => `
        <tr data-index="${student.id}">
            <td style="width: 8%;">${student.name}</td> 
            <td style="width: 6%;">${student.study_right_end_date}</td> 
            <td style="width: 6%;">${student.tf_date}</td> 
            <td style="width: 4%;">${student.tf_time}</td> 
            <td style="width: 4%;">${student.work_id}</td> 
            <td style="width: 4%; text-align: center;">${student.sisu_registration}</td> 
            <td style="width: 4%; text-align: center;">${student.plan_ok}</td> 
            <td style="width: 4%; text-align: center;">${student.work_ordered}</td> 
            <td style="width: 4%; text-align: center;">${student.sent_to_review}</td> 
            <td style="width: 4%; text-align: center;">${student.sisu_registered}</td> 
            <td style="width: 8%;">${student.studieinfo}</td>  
            <td style="width: 12%;">${student.supervisor_comment}</td>  
            <td style="width: 8%;">${student.title}</td>  
            <td style="width: 12%;">${student.comment}</td>  
            <td style="width: 6%;">${student.thesis.supervisor.name}</td>  
            <td style="width: 10%;">${student.status_updated}</td>  
        </tr>
    `).join('');

    // Once the tableBody has been generated, add an eventlistener to each row ONCE
    if (!eventlistenerAdded) {
        eventlistenerAdded = true;
        addEventListenerToTable();
    }
}

function addEventListenerToTable() {
    // Make rows clickable for editing
    tableBody.addEventListener("click", (event) => {
        if (event.target.tagName === "TD") {
            const row = event.target.closest("tr");
            const index = row.getAttribute('data-index');
            const student = students.find(student => student.id == index);
            const nextRow = row.nextElementSibling;

            // Toggle function to show/hide the expanded row when i click on the same row
            if (nextRow && nextRow.classList.contains("expand-row")) {
                nextRow.remove();
                return;
            }

            // When a row is clicked, collapse all previously expanded rows
            document.querySelectorAll(".expand-row").forEach(e => {
                e.remove(); // Collapse other open rows
            });

            // Generate the expanded row with dynamic data
            const expandRow = document.createElement("tr");
            generateExpandedRow(expandRow, student);

            row.after(expandRow); // Add the expanded-row after the row

            // Expanded row button functionalities
            const cancelBtn = expandRow.querySelector('#hideEditForm');
            const saveBtn = expandRow.querySelector('#saveEdit')
            const deleteBtn = expandRow.querySelector('#deleteUser');

            addCancelBtnFunctionality(cancelBtn, expandRow);
            addSaveBtnFunctionality(saveBtn, student);
            addDeleteBtnFunctionality(deleteBtn, index);
        }
    });
}

// Generates expanded row innerHTML dynamically
function generateExpandedRow(expandRow, student) {
    expandRow.classList.add('expand-row');
    expandRow.innerHTML = `<td colspan="100%">
            <div class="expand-row">
                <form id="editStudentForm" class="row g-3">
                    <div class="col-md-3">
                        <label for="editName">Name</label>
                        <input type="text" id="editName" name="name" class="form-control" value="${student.name}" required>
                    </div>
                    <div class="col-md-3">
                        <label for="editStudierattensSlut">End Date</label>
                        <input type="date" id="editStudierattensSlut" name="studierattensSlut" class="form-control" value="${student.end_date}" required>
                    </div>
                    <div class="col-md-3">
                        <label for="editTfDatum">TF Date</label>
                        <input type="date" id="editTfDatum" name="tfDatum" class="form-control" value="${student.tf_date}" required>
                    </div>
                    <div class="col-md-3">
                        <label for="editTfTid">TF Time</label>
                        <input type="text" id="editTfTid" name="tfTid" class="form-control" value="${student.tf_time}">
                    </div>
                    <div class="col-md-3">
                        <label for="editArbetetsID">Work ID</label>
                        <input type="text" id="editArbetetsID" name="arbetetsID" class="form-control" value="${student.work_id}">
                    </div>
                    <div class="col-md-3">
                        <label for="editAnmalTillSisu">Sisu Registered</label>
                        <select id="editAnmalTillSisu" name="anmalTillSisu" class="form-control">
                            <option ${student.sisu_registration === 'Yes' ? 'selected' : ''}>Yes</option>
                            <option ${student.sisu_registration === 'No' ? 'selected' : ''}>No</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label for="editplanenOk">Plan OK</label>
                        <select id="editplanenOk" name="planenOk" class="form-control">
                            <option ${student.plan_ok === 'Yes' ? 'selected' : ''}>Yes</option>
                            <option ${student.plan_ok === 'No' ? 'selected' : ''}>No</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label for="editBestalldArbete">Ordered Work</label>
                        <select id="editBestalldArbete" name="bestalldArbete" class="form-control">
                            <option ${student.work_ordered === 'Yes' ? 'selected' : ''}>Yes</option>
                            <option ${student.work_ordered === 'No' ? 'selected' : ''}>No</option>
                        </select>
                    </div>

                     <div class="col-md-3">
                        <label for="editSkickadGranskaren">Sent for Review</label>
                        <select id="editSkickadGranskaren" name="skickadGranskaren" class="form-control">
                            <option ${student.sent_to_review === 'Yes' ? 'selected' : ''}>Yes</option>
                            <option ${student.sent_to_review === 'No' ? 'selected' : ''}>No</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label for="editReggadSisu">Sisu Registered</label>
                        <select id="editReggadSisu" name="reggadSisu" class="form-control">
                            <option ${student.sisu_registered === 'Yes' ? 'selected' : ''}>Yes</option>
                            <option ${student.sisu_registered === 'No' ? 'selected' : ''}>No</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label for="editStudieinfo">Studieinfo</label>
                        <input type="text" id="studieinfo" name="studieInfo" class="form-control" value="${student.studieinfo}">
                    </div>
                    <div class="col-md-3">
                        <label for="editHandledarKommentar">Supervisor's Comment</label>
                        <input type="text" id="handledarKommentar" name="supervisorComment" class="form-control" value="${student.supervisor_comment}">
                    </div>
                    <div class="col-md-3">
                        <label for="editRubrik">Title</label>
                        <input type="text" id="rubrik" name="title" class="form-control" value="${student.title}">
                    </div>
                    <div class="col-md-3">
                        <label for="editKommentarer">Comment</label>
                        <input type="text" id="kommentarer" name="comment" class="form-control" value="${student.comment}">
                    </div>
                    <div class="col-md-3">
                        <label for="editHandledare">Supervisor</label>
                        <select id="editHandledare" name="handledare" class="form-control">
                            <option ${student.supervisor === 'Jonny' ? 'selected' : ''}>Jonny</option>
                            <option ${student.supervisor === 'Dennis' ? 'selected' : ''}>Dennis</option>
                            <option ${student.supervisor === 'Magnus' ? 'selected' : ''}>Magnus</option>
                            <option ${student.supervisor === 'André' ? 'selected' : ''}>André</option>
                            <option ${student.supervisor === 'Niraj' ? 'selected' : ''}>Niraj</option>
                            <option ${student.supervisor === 'Fredrik' ? 'selected' : ''}>Fredrik</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label for="editStatusUppdaterat">Status Updated</label>
                        <input type="date" id="editStatusUppdaterat" name="statusUppdaterat" class="form-control" value="${student.status_updated}" required>
                    </div>
                    <div class="col-md-12 mt-3">
                        <button type="submit" class="btn btn-success" id="saveEdit">Save</button>
                        <button type="button" class="btn btn-secondary" id="hideEditForm">Cancel</button>
                        <button type="button" class="btn btn-danger" id="deleteUser">Delete User</button>
                    </div>
                </form>
            </div>
        </td>
            `;
}

// Expanded row cancel button functionality
function addCancelBtnFunctionality(saveBtn, expandRow) {
    saveBtn.addEventListener("click", () => {
        expandRow.remove(); // Remove the expanded row when cancel is clicked
    });
}

// Expanded row save button functionality
function addSaveBtnFunctionality(saveBtn, student) {
    saveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const formData = new FormData(document.getElementById('editStudentForm')); // Get the form inside expandRow

        // Create an object to store the updated data
        const updatedStudent = {};

        // Loop through the FormData entries and update the corresponding student data
        formData.forEach((value, key) => {
            updatedStudent[key] = value; // key is the form field name, value is the input value
        });

        // Check if the student data has changed
        let hasChanges = false;

        // Compare original and updated values
        for (const key in updatedStudent) {
            if (updatedStudent[key] !== student[key]) {
                hasChanges = true;
                break; // If any value is different, break the loop
            }
        }

        if (hasChanges) {
            // Update the student object with the new data
            Object.assign(student, updatedStudent);

            // Format and update the lastUpdated field only if changes were made
            student.status_updated = formatDate(new Date());

            // Re-render the table with updated student data
            renderTable(students);
        } else {
            document.querySelectorAll(".expand-row").forEach(e => {
                e.remove(); // Collapse other open rows
            });
        }
    })
}

// Expanded row delete button functionality
function addDeleteBtnFunctionality(deleteButton, index) {
    deleteButton.addEventListener('click', () => {
        // Show the modal when the delete button is clicked
        showDeleteModal(index);
    });
}

// Formats the status updated date
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0'); // Add leading zero if day is a single digit
    const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() returns 0-based month, so add 1
    const year = date.getFullYear();

    return `${year}-${month}-${day}`; // Return in DD/MM/YYYY format
}

// Handles the search function
filteredStudents = [...students];
searchInput.addEventListener("input", () => {
    const searchValue = searchInput.value.toLowerCase();
    filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchValue)
    );
    renderTable(filteredStudents);
})

// Handles the filter dropdown menu
filterIcon.addEventListener('click', () => {
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
            filteredStudents = students.filter(student => student.supervisor === supervisor); // Denna hämtar bara den valda handledaren
        }

        // Re-render the table with filtered students
        renderTable(filteredStudents);

        // Close the dropdown after selection
        supervisorFilterDropdown.style.display = 'none';
    }
});

// Check if the mouse moves from the filterIcon to NEITHER the filterIcon OR the supervisorFilterDropdown
filterIcon.addEventListener('mouseleave', (event) => {
    if (!supervisorFilterDropdown.contains(event.relatedTarget) && // Check if mouse is leaving to the dropdown
        !filterIcon.contains(event.relatedTarget) // Check if mouse is leaving to the filter icon itself
    ) {
        supervisorFilterDropdown.style.display = 'none'; // Hide the dropdown
    }
});

// Check if the mouse moves from the supervisorFilterDropdown to NEITHER the supervisorFilterDropdown OR the filterIcon 
supervisorFilterDropdown.addEventListener('mouseleave', (event) => {
    if (
        !supervisorFilterDropdown.contains(event.relatedTarget) && // Check if mouse is leaving to the dropdown
        !filterIcon.contains(event.relatedTarget) // Check if mouse is leaving to the filter icon
    ) {
        supervisorFilterDropdown.style.display = 'none'; // Hide the dropdown
    }
});