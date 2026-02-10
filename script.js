document.addEventListener("DOMContentLoaded", () => {
  let entries = JSON.parse(localStorage.getItem("itqaEntries")) || [];

  const form = document.getElementById("entryForm");
  const dateInput = document.getElementById("date");
  const trackingInput = document.getElementById("tracking");
  const firstNameInput = document.getElementById("firstName");
  const lastNameInput = document.getElementById("lastName");
  const phoneInput = document.getElementById("phone");
  const correctionsInput = document.getElementById("corrections");
  const callStatusInput = document.getElementById("callStatus");
  const notesInput = document.getElementById("notes");
  const tableBody = document.querySelector("table tbody");
  const formError = document.getElementById("formError");
  const searchInput = document.getElementById("search");

  if (!form || !tableBody || !formError || !searchInput) {
    console.error("Required DOM elements missing");
    return;
  }

  /* ===============================
     SEARCH
  =============================== */
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase().trim();

    if (!query) {
      loadTable();
      return;
    }

    const filtered = entries.filter(
      (e) =>
        e.tracking.toLowerCase().includes(query) ||
        e.firstName.includes(query) ||
        e.lastName.includes(query)
    );

    loadTable(filtered);
  });

  /* ===============================
     FORM SUBMIT
  =============================== */
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    formError.classList.add("hidden");
    trackingInput.classList.remove("input-error");
    firstNameInput.classList.remove("input-error");
    lastNameInput.classList.remove("input-error");

    const tracking = trackingInput.value.trim();
    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();

    let hasError = false;

    if (!tracking) {
      trackingInput.classList.add("input-error");
      hasError = true;
    }
    if (!firstName) {
      firstNameInput.classList.add("input-error");
      hasError = true;
    }
    if (!lastName) {
      lastNameInput.classList.add("input-error");
      hasError = true;
    }

    if (hasError) {
      formError.classList.remove("hidden");
      return;
    }

    entries.push({
      date: dateInput.value,
      tracking,
      firstName: firstName.toLowerCase(),
      lastName: lastName.toLowerCase(),
      phone: phoneInput.value.trim(),
      corrections: correctionsInput.value.trim(),
      callStatus: callStatusInput.value,
      notes: notesInput.value.trim(),
    });

    saveToStorage();
    searchInput.value = "";
    loadTable();

    form.reset();
    dateInput.valueAsDate = new Date();
  });

  /* ===============================
     TABLE EVENTS (EDIT / DELETE)
  =============================== */
  tableBody.addEventListener("click", (e) => {
    const index = e.target.dataset.index;
    if (index === undefined) return;

    if (e.target.classList.contains("delete-btn")) {
      if (!confirm("Delete this entry?")) return;
      entries.splice(index, 1);
      saveToStorage();
      loadTable();
    }

    if (e.target.classList.contains("edit-btn")) {
      const entry = entries[index];

      dateInput.value = entry.date;
      trackingInput.value = entry.tracking;
      firstNameInput.value = entry.firstName;
      lastNameInput.value = entry.lastName;
      phoneInput.value = entry.phone;
      correctionsInput.value = entry.corrections;
      callStatusInput.value = entry.callStatus;
      notesInput.value = entry.notes;

      entries.splice(index, 1);
      saveToStorage();
      loadTable();
    }
  });

  /* ===============================
     STORAGE
  =============================== */
  function saveToStorage() {
    localStorage.setItem("itqaEntries", JSON.stringify(entries));
  }

  /* ===============================
     TABLE RENDER
  =============================== */
  function loadTable(list = entries) {
    tableBody.innerHTML = "";

    list.forEach((entry, index) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${entry.date}</td>
        <td>${entry.tracking}</td>
        <td>${entry.firstName} ${entry.lastName}</td>
        <td>${entry.corrections}</td>
        <td>${entry.callStatus}</td>
        <td>${entry.notes}</td>
        <td>
          <button class="edit-btn" data-index="${index}">Edit</button>
          <button class="delete-btn" data-index="${index}">Delete</button>
        </td>
      `;

      tableBody.appendChild(row);
    });
  }

  /* ===============================
     INITIAL LOAD
  =============================== */
  dateInput.valueAsDate = new Date();
  loadTable();
});