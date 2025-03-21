// Function that fetches all the students from DB

export async function fetchStudents() {
    try {
        const response = await fetch('http://localhost:3000/students');
        const responseJSON = await response.json();
        const students = handleData(responseJSON);
        return students;
    } catch (error) {
        console.error('Error fetching students:', error);
        return [];
    }
}

function handleData(students) {
    return students.map(student => ({
        ...student,
        end_date: formatDate(student.end_date),
        tf_date: formatDate(student.tf_date),
        tf_time: formatTime(student.tf_time),
        sisu_registration: formatBool(student.sisu_registration),
        plan_ok: formatBool(student.plan_ok),
        work_ordered: formatBool(student.work_ordered),
        sent_to_review: formatBool(student.sent_to_review),
        sisu_registered: formatBool(student.sisu_registered),
        status_updated: formatDate(student.status_updated)
    }));
}

function formatDate(data) { // Making sure that date is in a specific format. Right now it is YYYY-MM-DD !! CAN BE IMPROVED !! 
    if (typeof data === "string" && data.includes('T')) {
        const date = new Date(data);
        return date.toISOString().split('T')[0];
    }
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