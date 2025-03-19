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
            studieInfo: "Studying hard",
            supervisorComment: "Great progress!",
            title: "Project 1",
            comment: "No major issues.",
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
            studieInfo: "Needs improvement",
            supervisorComment: "Waiting on draft.",
            title: "Project 2",
            comment: "Delayed start",
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
            studieInfo: "Excellent work",
            supervisorComment: "Needs minor revisions.",
            title: "Project 3",
            comment: "Keep up the good work.",
            handledare: "Magnus",
            statusUppdaterat: "2025-03-12"
        }
    ];

    const tableBody = document.getElementById("studentTable");
    const addStudentForm = document.getElementById("addStudentForm");
    const entryForm = document.getElementById("entryForm");
    const showFormButton = document.getElementById("showFormButton");
    const hideFormButton = document.getElementById("hideFormButton");
    const searchInput = document.getElementById("searchInput");
    const sortIcon = document.getElementById("sortIcon"); // Sort functionality not yet implemented
    const filterIcon = document.getElementById("filterIcon");

    function renderTable(filteredStudents) {
        tableBody.innerHTML = filteredStudents.map((student, index) => `
            <tr data-index="${index}">
                <td style="width: 8%;">${student.name}</td> 
                <td style="width: 6%;">${student.studierattensSlut}</td> 
                <td style="width: 6%;">${student.tfDatum}</td> 
                <td style="width: 4%;">${student.tfTid}</td> 
                <td style="width: 4%;">${student.arbetetsID}</td> 
                <td style="width: 4%; text-align: center;">${student.anmalTillSisu}</td> 
                <td style="width: 4%; text-align: center;">${student.planenOk}</td> 
                <td style="width: 4%; text-align: center;">${student.bestalldArbete}</td> 
                <td style="width: 4%; text-align: center;">${student.skickadGranskaren}</td> 
                <td style="width: 4%; text-align: center;">${student.reggadSisu}</td> 
                <td style="width: 8%;">${student.studieInfo}</td>  
                <td style="width: 12%;">${student.supervisorComment}</td>  
                <td style="width: 8%;">${student.title}</td>  
                <td style="width: 12%;">${student.comment}</td>  
                <td style="width: 6%;">${student.handledare}</td>  
                <td style="width: 10%;">${student.statusUppdaterat}</td>  
            </tr>
        `).join('');
    }

    let filteredStudents = [];
    filteredStudents = [...students];
    searchInput.addEventListener("input", () => {
        const searchValue = searchInput.value.toLowerCase();
        filteredStudents = students.filter(student =>
            student.name.toLowerCase().includes(searchValue)
        );
        renderTable(filteredStudents);
    })

    filterIcon.addEventListener('click', () => {
        const isVisible = supervisorFilterDropdown.style.display === 'block';
        supervisorFilterDropdown.style.display = isVisible ? 'none' : 'block';

        // Ensure dropdown aligns properly under the icon
        const rect = filterIcon.getBoundingClientRect();
        supervisorFilterDropdown.style.left = `${rect.left}px`; // Align with the left of the Filter icon
        supervisorFilterDropdown.style.top = `${rect.bottom}px`
    })

    // Handle supervisor selection from dropdown
    supervisorFilterDropdown.addEventListener('click', (event) => {
        if (event.target.classList.contains('dropdown-item')) {
            const supervisor = event.target.getAttribute('data-supervisor');

            // Filter the students based on the selected supervisor
            let filteredStudents = students;
            if (supervisor) {
                filteredStudents = students.filter(student => student.handledare === supervisor);
            }

            // Re-render the table with filtered students
            renderTable(filteredStudents);

            // Close the dropdown after selection
            supervisorFilterDropdown.style.display = 'none';
        }
    });

    // Close the dropdown when the mouse leaves the dropdown
    supervisorFilterDropdown.addEventListener('mouseleave', () => {
        supervisorFilterDropdown.style.display = 'none';
    });

    // Close the dropdown when clicking anywhere outside the dropdown or filter icon
    document.addEventListener('click', (e) => {
        if (!filterIcon.contains(e.target) && !supervisorFilterDropdown.contains(e.target)) {
            supervisorFilterDropdown.style.display = 'none';
        }
    });

    showFormButton.addEventListener("click", () => {
        entryForm.style.display = "block";
        showFormButton.style.display = "none";
    });

    hideFormButton.addEventListener("click", () => {
        // Hide the form and reset any modifications
        entryForm.style.display = "none";
        showFormButton.style.display = "block";

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

        renderTable(students);
        addStudentForm.reset();
        entryForm.style.display = "none";
        showFormButton.style.display = "block";
    });

    let originalStudentData = {};
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
            expandRow.innerHTML = `<td colspan="100%">
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
                        <input type="text" id="studieinfo" name="studieInfo" class="form-control" value="${student.studieInfo}">
                    </div>
                    <div class="col-md-3">
                        <label for="editHandledarKommentar">Supervisor's Comment</label>
                        <input type="text" id="handledarKommentar" name="supervisorComment" class="form-control" value="${student.supervisorComment}">
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
                        <input type="date" id="editStatusUppdaterat" name="statusUppdaterat" class="form-control" value="${student.statusUppdaterat}" required>
                    </div>
                    <div class="col-md-12 mt-3">
                        <button type="submit" class="btn btn-success" id="saveEdit">Save</button>
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

            const saveBtn = expandRow.querySelector('#saveEdit')
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

                    // Update the lastUpdated field only if changes were made
                    student.statusUppdaterat = formatDate(new Date());

                    // Re-render the table with updated student data
                    renderTable(students);
                } else {
                    console.log('No changes were made.');
                    document.querySelectorAll(".expand-row").forEach(e => {
                        e.remove(); // Collapse other open rows
                    });
                }
            })
        }
    });

    function formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0'); // Add leading zero if day is a single digit
        const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() returns 0-based month, so add 1
        const year = date.getFullYear();
    
        return `${year}-${month}-${day}`; // Return in DD/MM/YYYY format
    }

    renderTable(students);
});
