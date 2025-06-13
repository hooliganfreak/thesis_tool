import { showDeleteModal, showElements, subHeader, subHeaderText } from "./utils.js";
const deleteButton = document.getElementById('deleteButton');

// Populates the adept details
export function showDetails(studentData) {
    renderProgress(studentData.status);
    document.getElementById("detailNamn").textContent = studentData.namn;
    document.getElementById("detailEfternamn").textContent = studentData.efternamn;
    document.getElementById("detailLinje").textContent = studentData.linje;
    document.getElementById("detailStudieTid").textContent = studentData.studieTid;
    document.getElementById("detailHandledare").textContent = studentData.handledare;
    document.getElementById("detailSenastKontakt").textContent = studentData.senastKontakt;
    document.getElementById("detailSP").textContent = studentData.sp + "/240";
    document.getElementById("detailÄmnesstudier").textContent = studentData.ämnesstudier + "/90";
    document.getElementById("detailBreddstudier").textContent = studentData.breddstudier + "/30";
    document.getElementById("detailPraktik").textContent = studentData.praktik + "/30";
    document.getElementById("detailMetodik").textContent = studentData.metodik + "/30";
    document.getElementById("detailMedeltal").textContent = studentData.medeltal;
    document.getElementById("detailHandledareKommentar").textContent = studentData.handledareKommentar;

    let detailSubHeaderText = subHeaderText + " - " + studentData.namn + " " + studentData.efternamn
    subHeader.innerText = detailSubHeaderText;

    document.getElementById("detail-view").classList.remove("d-none");

    deleteButton.addEventListener('click', () => {
        showDeleteModal(studentData.id);
    });
}

document.getElementById("backButton").addEventListener("click", function () {
    showElements();
});

function renderProgress(currentStatus) {
    const stages = ["Semi", "Plan", "First", "Second", "TF", "Mognad", "Betyg"];
    const index = stages.indexOf(currentStatus);
    const progress = ((index + 1) / stages.length) * 100;

    const mask = document.getElementById("progressMask");
    mask.style.width = `${100 - progress}%`;
}