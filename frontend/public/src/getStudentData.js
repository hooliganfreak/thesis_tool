// Function that fetches all the students from DB

export async function fetchStudents() {
    try {
        const response = await fetch('http://localhost:3000/students');
        const responseJSON = await response.json();
        const students = handleData(responseJSON);
        console.log(students);
        return students;
    } catch (error) {
        console.error('Error fetching students:', error);
        return [];
    }
}

// Function that formats the data from the DB 
function handleData(students) {
    return students.map(student => ({
        ...student,
        study_right_end_date: formatDate(student.study_right_end_date),
        thesis: {
            ...student.thesis,
            presentation_date: formatDate(student.thesis.presentation_date),
            registered_date: formatDate(student.thesis.registered_date),
            research_plan_finished_date: formatDate(student.thesis.research_plan_finished_date),
            status_updated_date: formatDate(student.thesis.status_updated_date),
            commissioned_thesis: formatBool(student.thesis.commissioned_thesis),
            added_to_sisu: formatBool(student.thesis.added_to_sisu),
            presentation_time: formatTime(student.thesis.presentation_time)
        }
    }))
}

function formatDate(isoString) { // Making sure that date is in a specific format (DD/MM/YY)
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, "0"); // Ensure day is two digits (07 not 7)
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Ensure month is two digits (03 not 3)
    const year = String(date.getFullYear()).slice(-2); // Extracts the last two digits from the year (25 not 2025)

    // Returns the date as DD/MM/YY
    return `${day}/${month}/${year}`;
}

function formatBool(data) { // Converts true/false to Yes/No !! CAN BE IMPROVED !! 
    if (typeof data === "boolean") {
        return data ? 'Yes' : 'No';
    }
}

function formatTime(data) { // Makes sure that time is in the HH:MM format !! CAN BE IMPROVED !! 
    if (typeof data === "string" && data.includes(':')) {
        return data.slice(0, 5);
    }
}