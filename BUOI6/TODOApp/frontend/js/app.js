
/* =====================================
   1. DISPLAY CURRENT DATE
===================================== */

const currentDate = document.getElementById("current-date");

function displayCurrentDate() {

    const today = new Date();

    const options = {
        day: "numeric",
        month: "long",
        year: "numeric"
    };

    currentDate.textContent = today.toLocaleDateString("en-US", options);

}

displayCurrentDate();
