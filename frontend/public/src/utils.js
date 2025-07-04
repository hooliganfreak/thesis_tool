// IN PROGRESS -----------------------------------------------------------------------------
const darkModeToggle = document.getElementById('darkModeToggle');

// Settings button functionality
export function settingsButton() {
    const btn = document.getElementById('settingsBtn');
    const modal = new bootstrap.Modal(document.getElementById('settingsModal'));

    if (btn) {
        btn.addEventListener('click', () => {
            modal.show();
        });
    }
}

// Dark mode setting saves in localStorage
if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    darkModeToggle.checked = true;
}

// Darkmode toggle functionality
darkModeToggle.addEventListener('change', () => {
    console.log("check");
    if (darkModeToggle.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'enabled')
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'disabled');
    }
})

// IN PROGRESS -----------------------------------------------------------------------------