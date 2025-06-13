import { fetchStudents } from "./getStudentData.js";
import { setStudentList } from "./utils.js";

// INITIAL SCRIPT THAT RUNS WHEN DOM IS LOADED

document.addEventListener("DOMContentLoaded", () => {
    //let students = [];

    let students = [
        {
          id: 1,  
          namn: "Emil",
          efternamn: "Ivars",
          linje: "Informationteknik, 2021",
          studieTid: "Vår 26",
          handledare: "Dennis",
          senastKontakt: "13.06.2025",
          alias: "ivarsemi",
          sp: 200,
          ämnesstudier: 60,
          breddstudier: 30,
          praktik: 15,
          metodik: 15,
          medeltal: 4.1,
          status: "Semi",
          handledareKommentar: "Planen ok",
          uppdaterad: "28.05.2025"
        },
        {
          id: 2,
          namn: "Dennis",
          efternamn: "Biström",
          linje: "Informationsteknik, 2019",
          studieTid: "Höst 25",
          handledare: "Fredrik",
          senastKontakt: "21.03.2025",
          alias: "bistromd",
          sp: 125,
          ämnesstudier: 80,
          breddstudier: 35,
          praktik: 15,
          metodik: 15,
          medeltal: 3.8,
          status: "Second",
          handledareKommentar: "Needs follow-up",
          uppdaterad: "10.06.2025"
        }
    ];

    async function loadStudents() {
        //students = await fetchStudents(); // Wait for the data to be fetched
        setStudentList(students); // Render the table after data is fetched
    }

    //renderTable(students);
    loadStudents();
});
