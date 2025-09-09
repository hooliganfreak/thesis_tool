import {
    fetchStudentData, showToast, showLoadFailed,
    loadHeaderAndToasts, highlightCurrentPage, loadModalsAndSettings,
    checkAuth
} from "./utils.js";

// Runs after DOMContentLoaded
document.addEventListener("DOMContentLoaded", async () => {
    const auth = await checkAuth();
    if (!auth || !auth.valid) return; // Stop page initialization if token is invalid

    initPage().catch(error => {
        console.error("Initialization error:", error);
        showToast("error", `Initialization failed: ${error.message}`);
    });
});

// Main initialization function
async function initPage() {
    const container = document.getElementById("mainContainer")

    // Load header and toasts
    await loadHeaderAndToasts(container); // Throws an error if fails => fatal and stops initPage

    // Loads modals and settings
    await loadModalsAndSettings();

    // Underscores the selected page
    highlightCurrentPage()

    // Renders the data into the graphs
    await renderData()
}

// Fetches and renders the data for the graphs
async function renderData() {
    const chartContainer = document.getElementById("chartContainer");
    const loadingWrapper = document.getElementById("loadingWrapper");

    try {
        // Fetch data & render charts
        const students = await fetchStudentData();
        renderSummaries(students);
        renderStatusChart(students);
        renderCreditsChart(students);
        renderSupervisorChart(students);

        // Hide spinner, show charts
        loadingWrapper.classList.add('d-none');
        chartContainer.classList.remove('d-none');

    } catch (error) {
        console.error(error);
        showToast("error", "Failed to load overview data.");
        showLoadFailed("chartContainer", "Data initialization failed.")
        chartContainer.classList.remove("d-none");
        loadingWrapper.classList.add("d-none");
    }
}

// Help from ChatGPT
function renderStatusChart(students) {
    const ctx = document.getElementById('statusChart').getContext('2d');

    // Force clockwise order according to status
    const STATUS_ORDER = ["Semi", "Plan", "First", "Second", "TF", "Mognad", "Betyg"];
    const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#8BC34A', '#9C27B0', '#FF9800', '#607D8B'];

    // Count how many students are in each status
    const counts = students.reduce((acc, s) => {
        // If this status already exists in acc, add 1, else start at 1
        if (STATUS_ORDER.includes(s.status)) acc[s.status] = (acc[s.status] || 0) + 1;
        return acc; // This returns e.g. : counts = { Semi: 2, Plan: 1, TF: 1 }
    }, {});

    const labels = STATUS_ORDER;

    // Take STATUS_ORDER and look up each status in counts
    // If it doesn’t exist, default to 0
    const data = STATUS_ORDER.map(s => counts[s] || 0);
    // data becomes e.g. : [2, 1, 0, 0, 1, 0, 0] in the correct order

    // Map each label index to a color from COLORS
    const backgroundColor = STATUS_ORDER.map((_, i) => COLORS[i]);

    if (window.statusChartInstance) window.statusChartInstance.destroy();

    window.statusChartInstance = new Chart(ctx, {
        type: 'pie',
        data: { labels, datasets: [{ data, backgroundColor }] },
        options: {
            aspectRatio: 1.25,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false },
            },
            hover: { mode: null },
            animation: {
                onComplete: function () {
                    const chart = this;
                    const ctx = chart.ctx;
                    ctx.font = 'bold 12px Arial';
                    ctx.fillStyle = 'white';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';

                    chart.data.datasets.forEach((dataset, i) => {
                        const meta = chart.getDatasetMeta(i);
                        meta.data.forEach((arc, index) => {
                            const value = dataset.data[index];
                            if (!value) return;
                            const label = chart.data.labels[index];
                            const pos = arc.getCenterPoint();
                            ctx.fillText(`${label}: ${value}`, pos.x, pos.y);
                        });
                    });
                }
            }
        }
    });
}

// Credit summary bar graph
function renderCreditsChart(students) {
    const ctx = document.getElementById("creditsChart");
    const bins = { "0-60": 0, "61-120": 0, "121-180": 0, "181-240": 0 };
    students.forEach(s => {
        const c = s.credits || 0;
        if (c <= 60) bins["0-60"]++;
        else if (c <= 120) bins["61-120"]++;
        else if (c <= 180) bins["121-180"]++;
        else bins["181-240"]++;
    });

    new Chart(ctx, {
        type: "bar",
        data: {
            labels: Object.keys(bins),
            datasets: [{
                label: "Students",
                data: Object.values(bins)
            }]
        },
        options: {
            aspectRatio: 2.75,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        precision: 0
                    }
                }
            }
        }
    });
}

// Student per supervisor bar graph
function renderSupervisorChart(students) {
    const ctx = document.getElementById("supervisorChart");
    const counts = {};
    students.forEach(s => {
        const sup = s.supervisor?.firstName || "Unknown";
        counts[sup] = (counts[sup] || 0) + 1;
    });

    new Chart(ctx, {
        type: "bar",
        data: {
            labels: Object.keys(counts),
            datasets: [{
                label: "Students",
                data: Object.values(counts)
            }]
        },
        options: {
            aspectRatio: 2.75,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        precision: 0
                    }
                }
            }
        }
    });
}

// Summary cards
function renderSummaries(students) {
    const total = students.length;
    const graduated = students.filter(s => s.status === "Betyg").length;
    const inProgress = students.filter(s => s.status !== "Betyg").length;
    const inactive = isInactive(students);

    document.getElementById("totalStudents").textContent = total;
    document.getElementById("graduatedCount").textContent = graduated;
    document.getElementById("inProgressCount").textContent = inProgress;
    document.getElementById("inactiveCount").textContent = inactive;
}

// Function that checks if a student has last been updated 3 months ago = inactive
function isInactive(students) {
    const now = new Date(); // Date for now
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(now.getMonth() - 3); // Date three months ago

    let amountInactive = 0;

    for (const student of students) { // Loop through the students
        const [day, month, year] = student.updated.split('.'); // Date is in "dd.mm.yyyy" format
        const updatedDate = new Date(year, month - 1, day) // Date is in "yyyy.mm.dd" format (must be this format for new Date() to work)

        if (updatedDate < threeMonthsAgo) { // If updatedDate is before three months ago, add 1 to inactive count
            amountInactive++;
        }
    }

    return amountInactive;
}