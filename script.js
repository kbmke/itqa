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

  const undoBar = document.getElementById("undoBar");
  const undoBtn = document.getElementById("undoBtn");

  let lastDeletedEntry = null;
  let lastDeletedIndex = null;

  /* ===============================
     GUARD
  =============================== */
  if (
    !form ||
    !tableBody ||
    !formError ||
    !searchInput ||
    !undoBar ||
    !undoBtn
  ) {
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
        e.lastName.includes(query),
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
  let undoTimeout = null;

  tableBody.addEventListener("click", (e) => {
    if (!e.target.dataset.index) return;

    const index = Number(e.target.dataset.index);

    /* DELETE */
    if (e.target.classList.contains("delete-btn")) {
      lastDeletedEntry = entries[index];
      lastDeletedIndex = index;
// Disable delete while editing
      if (editingRowIndex !== null) return;
      entries.splice(index, 1);
      saveToStorage();
      loadTable();

      undoBar.classList.remove("hidden");

      clearTimeout(undoTimeout);
      undoTimeout = setTimeout(() => {
        undoBar.classList.add("hidden");
        lastDeletedEntry = null;
        lastDeletedIndex = null;
      }, 5000);
    }

    /* EDIT */

    // “editing lock” (prevents multiple rows editing)
  let editingRowIndex = null;
 
 
  if (e.target.classList.contains("edit-btn")) {
  if (editingRowIndex !== null) return; // block multiple edits

  const row = e.target.closest("tr");
  const entry = entries[index];
  editingRowIndex = index;

  row.innerHTML = `
    <td><input type="date" value="${entry.date}"></td>
    <td><input value="${entry.tracking}"></td>
    <td>
      <input value="${entry.firstName}" placeholder="First">
      <input value="${entry.lastName}" placeholder="Last">
    </td>
    <td><input value="${entry.corrections}"></td>
    <td>
      <select>
        <option value="">Select</option>
        <option ${entry.callStatus === "Called – Talked to Customer" ? "selected" : ""}>Called – Talked to Customer</option>
        <option ${entry.callStatus === "Called – Left Voicemail" ? "selected" : ""}>Called – Left Voicemail</option>
        <option ${entry.callStatus === "Called – No Answer" ? "selected" : ""}>Called – No Answer</option>
        <option ${entry.callStatus === "Did Not Call" ? "selected" : ""}>Did Not Call</option>
      </select>
    </td>
    <td><input value="${entry.notes}"></td>
    <td>
      <button class="save-edit" data-index="${index}">Save</button>
      <button class="cancel-edit">Cancel</button>
    </td>
  `;
  // SAVE INLINE EDITS
  if (e.target.classList.contains("save-edit")) {
  const row = e.target.closest("tr");
  const inputs = row.querySelectorAll("input, select");

  entries[index] = {
    date: inputs[0].value,
    tracking: inputs[1].value,
    firstName: inputs[2].value.toLowerCase(),
    lastName: inputs[3].value.toLowerCase(),
    corrections: inputs[4].value,
    callStatus: inputs[5].value,
    notes: inputs[6].value,
    phone: entries[index].phone // preserve phone if not edited
  };

  saveToStorage();
  editingRowIndex = null;
  loadTable();
}
// CANCEL INLINE EDITS
if (e.target.classList.contains("cancel-edit")) {
  editingRowIndex = null;
  loadTable(); // discard changes
}
}
  /* ===============================
     STORAGE
  =============================== */
  function saveToStorage() {
    localStorage.setItem("itqaEntries", JSON.stringify(entries));
  }

  /* ===============================
     TABLE RENDER
  =============================== */
  undoBtn.addEventListener("click", () => {
    if (lastDeletedEntry === null) return;

    entries.splice(lastDeletedIndex, 0, lastDeletedEntry);
    saveToStorage();
    loadTable();

    lastDeletedEntry = null;
    lastDeletedIndex = null;
    undoBar.classList.add("hidden");
  });
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
</td>      `;

      tableBody.appendChild(row);
    });
  }

  /* ===============================
     INITIAL LOAD
  =============================== */
  dateInput.valueAsDate = new Date();
  loadTable();
});
