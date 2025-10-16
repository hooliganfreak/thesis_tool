// Fetch helper
export async function fetchJSON(url, options = {}, errorMessage = "Request failed") {
    /* Makes the header contain e.g. : 
    { 
    "Content-Type": "application/json",
    Authorization: "Bearer abc123"
    }   
    */
    options.headers = { ...options.headers, ...getAuthHeaders() };

    // Do the fetch with the token in the header
    const response = await fetch(url, options);

    // If server sent a new token, update localStorage
    const newToken = response.headers.get("x-access-token");
    console.log("New token:", newToken)
    if (newToken) localStorage.setItem("jwtToken", newToken);


    if (!response.ok) {
        let data;

        try {
            data = await response.json();
        } catch (error) { }

        // If auth failed (401) stop here
        if (response.status === 401) {
            handleUnauthorized();
            return;
        }

        // If auth ok but fetch failed for some other reason, throw an error
        let errMsg = `${errorMessage}: ${response.status}`;
        if (data?.error) errMsg = `${errorMessage}: ${data.error}`;
        if (data?.message) errMsg = `${errorMessage}: ${data.message}`;
        throw new Error(errMsg);
    }
    return response.json();
}

export async function fetchStudentData() {
    return fetchJSON(`/students`, { method: "GET" }, "Failed to fetch student data");
}

export async function fetchStudentDetails(id) {
    return fetchJSON(`/students/${id}`, { method: "GET" }, "Failed to fetch student details");
}

export async function deleteStudent(id) {
    return fetchJSON(`/student/${id}`, { method: "DELETE" }, "Failed to delete student");
}

export async function addStudent(studentData) {
    return fetchJSON(`/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentData),
    }, "Failed to create student");
}

export async function updateStudent(id, studentData) {
    return fetchJSON(`/students/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentData),
    }, "Failed to update student data");
}

export async function loginUser(username, password) {
    return fetchJSON(`/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    }, "Login failed");
}

// Function that fetches teacher data from the DB
export async function fetchTeachers() {
    return fetchJSON(`/teachers`, { method: "GET" }, "Failed to fetch teacher details");
}

// Returns headers object containing JWT if it exists
function getAuthHeaders() {
    const token = localStorage.getItem("jwtToken"); // Get JWT from localStorage
    return token ? { Authorization: `Bearer ${token}` } : {}; // Return authorization header if token exists
}

let confirmLogout = false;
let resetTimeout;
export function logOut(logoutBtn) {
    const originalBtnHTML = logoutBtn.innerHTML;
    
    // If the user clicks "Log Out"
    logoutBtn.addEventListener('click', async (e) => {
        if (!confirmLogout) {
            confirmLogout = true;
            logoutBtn.textContent = "Are you sure?"; // Change text

            resetTimeout = setTimeout(() => { // Change back to original if not clicked again within 5 sec
                confirmLogout = false;
                logoutBtn.innerHTML = originalBtnHTML;
            }, 5000);

            return;
        }

        clearTimeout(resetTimeout);

        // If user clicks "Are you sure?", confirm logout
        try {
            await fetch('/logout', { method: "POST", credentials: "include" });

            localStorage.removeItem('jwtToken');
            localStorage.setItem('logoutSuccess', "Logout successful");

            window.location.href = "/login.html"
        } catch (error) {
            logoutBtn.innerHTML = originalBtnHTML;
            showToast('error', 'Logout failed');
        }
    })
}

// Function to check validity of token
export function checkAuth() {
    const token = localStorage.getItem("jwtToken");

    if (!token) {
        handleUnauthorized();
        return false; // Token doesnt exist
    }

    return true;
}

// Redirects to login if the token is invalid
function handleUnauthorized() {
    localStorage.setItem("authError", "Invalid or expired token. Please log in again.");
    localStorage.removeItem("jwtToken");
    window.location.href = "/login.html"; // Redirect to login page
}