
import { showToast, loadToasts, initDarkModeToggle } from "./modals.js";
import { loginUser } from "./api.js";

const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

// Runs after DOMContentLoaded
document.addEventListener('DOMContentLoaded', async () => {
    await loadToasts(); // Loads toasts to enable error/success messages
    initDarkModeToggle(); // Initializes darkmode toggle and applies it if enabled

    const authError = localStorage.getItem("authError");
    if (authError) { // If authError exists in localStorage, display the error with toast
        showToast("error", authError);
        localStorage.removeItem("authError"); // Remove authError
    }

    const logoutSuccess = localStorage.getItem("logoutSuccess");
    if (logoutSuccess) { // If logoutSuccess exists in localStorage, display the error with toast
        showToast('success', logoutSuccess);
        localStorage.removeItem("logoutSuccess"); // Remove logoutSuccess
    }
});

// eventListener for the login form
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    const result = validateInput(username, password); // Simple frontend input validation
    if (!result.valid) {
        showToast("error", result.message)
        passwordInput.value = '';
        if (!username) usernameInput.focus();
        else passwordInput.focus();
        return; // Stop here if invalid inputs
    }

    const loginBtn = document.getElementById('loginBtn');
    loginBtn.disabled = true; // Disable the button to prevent double submits

    try {
        const data = await loginUser(username, password); // Try to login

        if (data.accessToken) { // If successful login, server returns a token
            localStorage.setItem("jwtToken", data.accessToken);
            window.location.href = '/overview.html';
        } else { // If login fails, show the toast error
            showToast("error", data.message || 'Login failed');
            passwordInput.value = '';
            passwordInput.focus();
        }
    } catch (err) { // If the login fails for some other reason
        const message = err.message || "An unexpected error occurred";
        showToast("error", message);
        passwordInput.value = '';
    } finally {
        loginBtn.disabled = false;
    }
});

// Function to validate inputs
function validateInput(username, password) {
    username = username.trim();
    password = password.trim();

    if (!username) return { valid: false, message: "Username is required" };
    if (!password) return { valid: false, message: "Password is required" };

    if (password.length < 6) {
        return { valid: false, message: "Password must be at least 6 characters" };
    }

    return { valid: true };
}