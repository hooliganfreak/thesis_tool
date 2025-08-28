import {
    fetchStudentData, showErrorToast, showLoadFailed,
    loadHeaderAndToasts, highlightCurrentPage, loadModalsAndSettings
} from "./utils.js";

// Runs after DOMContentLoaded
document.addEventListener("DOMContentLoaded", async () => {
    initPage().catch(error => {
            console.error("Initialization error:", error);
            showErrorToast(`Initialization failed: ${error.message}`);
    });
});

// Main initialization function
async function initPage() {
    const container = document.getElementById("mainContainer")

    // Loads the header and toast html
    await loadHeaderAndToasts(container)

    // Initialize modals and settings
    await loadModalsAndSettings();

    // Underscores the selected page
    highlightCurrentPage();

    // Renders the data into the graphs
    await renderData();
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
        showErrorToast("Failed to load overview data.");
        showLoadFailed("chartContainer", "Data initalization failed.")
        chartContainer.classList.remove("d-none");
        loadingWrapper.classList.add("d-none");
    }
}

// Help from ChatGPT
function renderStatusChart(students) {
    const ctx = document.getElementById('statusChart').getContext('2d');

    // Count students per status
    const statusCounts = students.reduce((acc, s) => {
        acc[s.status] = (acc[s.status] || 0) + 1;
        return acc;
    }, {});

    if (window.statusChartInstance) window.statusChartInstance.destroy();

    window.statusChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(statusCounts),
            datasets: [{
                data: Object.values(statusCounts),
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56',
                    '#8BC34A', '#9C27B0', '#FF9800', '#607D8B'
                ],
            }]
        },
        options: {
            aspectRatio: 1.25,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false },
            },
            hover: {
                mode: null,
            },
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
                            const label = chart.data.labels[index];
                            const position = arc.getCenterPoint();
                            ctx.fillText(`${label}: ${value}`, position.x, position.y);
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
    console.log(students)
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