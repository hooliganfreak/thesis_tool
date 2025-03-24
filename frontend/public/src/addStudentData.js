// Function to add student data
const entryForm = document.getElementById("entryForm");
const showFormButton = document.getElementById("showFormButton");
const hideFormButton = document.getElementById("hideFormButton");
const addStudentForm = document.getElementById("addStudentForm");

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
