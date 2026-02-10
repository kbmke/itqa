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
// guard against missing elements
if (!form || !tableBody || !formError || !searchInput) {
  console.error("Required DOM elements missing");
  return;
}

/* ===============================
     FORM SUBMIT
  =============================== */
searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase().trim();

  if (!query) {
    loadTable(); // show all entries when search is empty
    return;
  }

  const filteredEntries = entries.filter((entry) =>
    entry.tracking.toLowerCase().includes(query) ||
    entry.firstName.includes(query) ||
    entry.lastName.includes(query)
  );

  loadTable(filteredEntries);
});
  form.addEventListener("submit", (e) => {
  e.preventDefault();

  // Clear previous errors
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
searchInput.value = ""; // clear search
loadTable();

  form.reset();
  dateInput.valueAsDate = new Date();
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
function loadTable(filteredEntries = entries) {
  tableBody.innerHTML = "";

  filteredEntries.forEach((entry, index) => {
    const isRepeatCustomer = entries.some(
      (e, i) =>
        i < index &&
        e.firstName === entry.firstName &&
        e.lastName === entry.lastName &&
        e.phone === entry.phone
    );

    function addRow(entry, isRepeatCustomer, index) {
}

  row.innerHTML = `
  <td>${entry.date}</td>
  <td>${entry.tracking}</td>
  <td>
    <span class="${isRepeatCustomer ? "repeat-customer" : ""}">
      ${entry.firstName} ${entry.lastName}
    </span>
  </td>
  <td>${entry.corrections}</td>
  <td>${entry.callStatus}</td>
  <td>${entry.notes}</td>
  <td>
    <button class="edit-btn" data-index="${index}">Edit</button>
    <button class="delete-btn" data-index="${index}">Delete</button>
  </td>
`;

    tableBody.appendChild(row);
  }

  /* ===============================
     INITIAL LOAD
  =============================== */
  dateInput.valueAsDate = new Date();
  loadTable();
});