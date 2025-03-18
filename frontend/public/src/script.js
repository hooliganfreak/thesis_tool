document.addEventListener("DOMContentLoaded", () => {
    const students = [
        {
            name: "Alice",
            studierattensSlut: "2025-06-01",
            tfDatum: "2025-03-15",
            tfTid: "14:00",
            arbetetsID: "12345",
            anmalTillSisu: "Yes",
            planenOk: "Yes",
            bestalldArbete: "Yes",
            skickadGranskaren: "Yes",
            reggadSisu: "Yes",
            studieinfo: "Studying hard",
            handledarKommentar: "Great progress!",
            rubrik: "Project 1",
            kommentarer: "No major issues.",
            handledare: "Jonny",
            statusUppdaterat: "2025-03-10"
        },
        {
            name: "Bob",
            studierattensSlut: "2025-08-15",
            tfDatum: "2025-03-10",
            tfTid: "10:30",
            arbetetsID: "67890",
            anmalTillSisu: "No",
            planenOk: "No",
            bestalldArbete: "No",
            skickadGranskaren: "No",
            reggadSisu: "No",
            studieinfo: "Needs improvement",
            handledarKommentar: "Waiting on draft.",
            rubrik: "Project 2",
            kommentarer: "Delayed start",
            handledare: "Dennis",
            statusUppdaterat: "2025-03-05"
        },
        {
            name: "Charlie",
            studierattensSlut: "2025-12-20",
            tfDatum: "2025-03-20",
            tfTid: "12:00",
            arbetetsID: "11223",
            anmalTillSisu: "Yes",
            planenOk: "Yes",
            bestalldArbete: "Yes",
            skickadGranskaren: "No",
            reggadSisu: "Yes",
            studieinfo: "Excellent work",
            handledarKommentar: "Needs minor revisions.",
            rubrik: "Project 3",
            kommentarer: "Keep up the good work.",
            handledare: "Magnus",
            statusUppdaterat: "2025-03-12"
        }
    ];

    const tableBody = document.getElementById("studentTable");
    const addStudentForm = document.getElementById("addStudentForm");
    const entryForm = document.getElementById("entryForm");
    const showFormButton = document.getElementById("showFormButton");
    const hideFormButton = document.getElementById("hideFormButton");

    let currentIndex = null;  // To store the index of the student being edited

    function renderTable(filteredStudents) {
        tableBody.innerHTML = filteredStudents.map((student, index) => `
            <tr data-index="${index}">
                ${Object.values(student).map(value => `<td>${value}</td>`).join('')}
            </tr>
        `).join('');
    }

    showFormButton.addEventListener("click", () => {
        entryForm.style.display = "block";
        showFormButton.style.display = "none";
    });

    hideFormButton.addEventListener("click", () => {
        // Hide the form and reset any modifications
        entryForm.style.display = "none";
        showFormButton.style.display = "block";

        // Reset the form title and button text back to "Add Entry" and "Add"
        document.querySelector("#entryForm h4").textContent = "Add New Entry";
        const submitButton = addStudentForm.querySelector("button[type='submit']");
        submitButton.textContent = "Add";

        // Reset the currentIndex to null as we're no longer editing
        currentIndex = null;

        // Reset the form fields
        addStudentForm.reset();
    });

    addStudentForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const formData = new FormData(addStudentForm);
        const newStudent = {};
        formData.forEach((value, key) => {
            newStudent[key] = value;
        });

        // If we're editing, update the existing student
        if (currentIndex !== null) {
            students[currentIndex] = newStudent;
            currentIndex = null; // Reset the edit mode
        } else {
            students.push(newStudent);
        }

        renderTable(students);
        addStudentForm.reset();
        entryForm.style.display = "none";
        showFormButton.style.display = "block";
    });

    // Make rows clickable for editing
    tableBody.addEventListener("click", (event) => {
        if (event.target.tagName === "TD") {
            const row = event.target.closest("tr");
            const index = row.getAttribute('data-index');
            const student = students[index];
            const nextRow = row.nextElementSibling;

            if (nextRow && nextRow.classList.contains("expand-row")) {
                nextRow.remove();
                return;
            }

            document.querySelectorAll(".expand-row").forEach(e => {
                e.remove(); // Collapse other open rows
            });

            const expandRow = document.createElement("tr");
            expandRow.classList.add('expand-row');
            expandRow.innerHTML = `<td colspan="100%" class="expand-content">
            <div class="expand-row">
                <form id="editStudentForm" class="row g-3">
                    <div class="col-md-3">
                        <label for="editName">Name</label>
                        <input type="text" id="editName" name="name" class="form-control" value="${student.name}" required>
                    </div>
                    <div class="col-md-3">
                        <label for="editStudierattensSlut">End Date</label>
                        <input type="date" id="editStudierattensSlut" name="studierattensSlut" class="form-control" value="${student.studierattensSlut}" required>
                    </div>
                    <div class="col-md-3">
                        <label for="editTfDatum">TF Date</label>
                        <input type="date" id="editTfDatum" name="tfDatum" class="form-control" value="${student.tfDatum}" required>
                    </div>
                    <div class="col-md-3">
                        <label for="editTfTid">TF Time</label>
                        <input type="text" id="editTfTid" name="tfTid" class="form-control" value="${student.tfTid}">
                    </div>
                    <div class="col-md-3">
                        <label for="editArbetetsID">Work ID</label>
                        <input type="text" id="editArbetetsID" name="arbetetsID" class="form-control" value="${student.arbetetsID}">
                    </div>
                    <div class="col-md-3">
                        <label for="editAnmalTillSisu">Sisu Registered</label>
                        <select id="editAnmalTillSisu" name="anmalTillSisu" class="form-control">
                            <option ${student.anmalTillSisu === 'Yes' ? 'selected' : ''}>Yes</option>
                            <option ${student.anmalTillSisu === 'No' ? 'selected' : ''}>No</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label for="editplanenOk">Plan OK</label>
                        <select id="editplanenOk" name="planenOk" class="form-control">
                            <option ${student.planenOk === 'Yes' ? 'selected' : ''}>Yes</option>
                            <option ${student.planenOk === 'No' ? 'selected' : ''}>No</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label for="editBestalldArbete">Ordered Work</label>
                        <select id="editBestalldArbete" name="bestalldArbete" class="form-control">
                            <option ${student.bestalldArbete === 'Yes' ? 'selected' : ''}>Yes</option>
                            <option ${student.bestalldArbete === 'No' ? 'selected' : ''}>No</option>
                        </select>
                    </div>

                     <div class="col-md-3">
                        <label for="editSkickadGranskaren">Sent for Review</label>
                        <select id="editSkickadGranskaren" name="skickadGranskaren" class="form-control">
                            <option ${student.skickadGranskaren === 'Yes' ? 'selected' : ''}>Yes</option>
                            <option ${student.skickadGranskaren === 'No' ? 'selected' : ''}>No</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label for="editReggadSisu">Sisu Registered</label>
                        <select id="editReggadSisu" name="reggadSisu" class="form-control">
                            <option ${student.reggadSisu === 'Yes' ? 'selected' : ''}>Yes</option>
                            <option ${student.reggadSisu === 'No' ? 'selected' : ''}>No</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label for="editStudieinfo">Studieinfo</label>
                        <input type="text" id="studieinfo" name="name" class="form-control" value="${student.studieinfo}">
                    </div>
                    <div class="col-md-3">
                        <label for="editHandledarKommentar">Supervisor's Comment</label>
                        <input type="text" id="handledarKommentar" name="name" class="form-control" value="${student.handledarKommentar}">
                    </div>
                    <div class="col-md-3">
                        <label for="editRubrik">Title</label>
                        <input type="text" id="rubrik" name="name" class="form-control" value="${student.rubrik}">
                    </div>
                    <div class="col-md-3">
                        <label for="editKommentarer">Title</label>
                        <input type="text" id="kommentarer" name="name" class="form-control" value="${student.kommentarer}">
                    </div>
                    <div class="col-md-3">
                        <label for="editHandledare">Supervisor</label>
                        <select id="editHandledare" name="handledare" class="form-control">
                            <option ${student.handledare === 'Jonny' ? 'selected' : ''}>Jonny</option>
                            <option ${student.handledare === 'Dennis' ? 'selected' : ''}>Dennis</option>
                            <option ${student.handledare === 'Magnus' ? 'selected' : ''}>Magnus</option>
                            <option ${student.handledare === 'André' ? 'selected' : ''}>André</option>
                            <option ${student.handledare === 'Niraj' ? 'selected' : ''}>Niraj</option>
                            <option ${student.handledare === 'Fredrik' ? 'selected' : ''}>Fredrik</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label for="editStatusUppdaterat">Status Updated</label>
                        <input type="date" id="editStatusUppdaterat" name="statusUppdaterat" class="form-control" value="${new Date().toISOString().split('T')[0]}" required>
                    </div>
                    <div class="col-md-12 mt-3">
                        <button type="submit" class="btn btn-success">Save</button>
                        <button type="button" class="btn btn-secondary" id="hideEditForm">Cancel</button>
                    </div>
                </form>
            </div>
        </td>
            `;

            row.after(expandRow);

            const cancelBtn = expandRow.querySelector('#hideEditForm');
            cancelBtn.addEventListener("click", (event) => {
                expandRow.remove(); // Remove the expanded row when cancel is clicked
            });
        }
    });

    renderTable(students);
});
