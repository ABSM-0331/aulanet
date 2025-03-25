// DOM Elements
const materiaSelect = document.getElementById("materia-select");
const parcialSelect = document.getElementById("parcial-select");
const btnListar = document.getElementById("btn-listar");
const studentsTable = document.getElementById("students-table");
// const studentsBody = document.getElementById("students-body");
const btnAperturar = document.getElementById("btn-aperturar");
const modalParcial = document.getElementById("modal-parcial");
const closeModal = document.querySelector(".close-modal");
const btnCancelar = document.getElementById("btn-cancelar");
const formParcial = document.getElementById("form-parcial");
const btnEditCriterios = document.getElementById("btn-edit-criterios");

// Sample student data
const students = [
  { id: 1, controlNum: "20210001", name: "Ana García Martínez" },
  { id: 2, controlNum: "20210002", name: "Carlos López Sánchez" },
  { id: 3, controlNum: "20210003", name: "María Rodríguez Pérez" },
  { id: 4, controlNum: "20210004", name: "Juan Hernández González" },
  { id: 5, controlNum: "20210005", name: "Laura Díaz Ramírez" },
  { id: 6, controlNum: "20210006", name: "Roberto Flores Torres" },
  { id: 7, controlNum: "20210007", name: "Sofía Vázquez Reyes" },
  { id: 8, controlNum: "20210008", name: "Daniel Morales Castro" },
  { id: 9, controlNum: "20210009", name: "Patricia Ortiz Mendoza" },
  { id: 10, controlNum: "20210010", name: "Miguel Ángel Ruiz Vargas" },
  { id: 11, controlNum: "20210011", name: "Gabriela Jiménez Lara" },
  { id: 12, controlNum: "20210012", name: "Alejandro Romero Silva" },
  { id: 13, controlNum: "20210013", name: "Fernanda Torres Navarro" },
  { id: 14, controlNum: "20210014", name: "Eduardo Gutiérrez Ríos" },
  { id: 15, controlNum: "20210015", name: "Valeria Sánchez Acosta" },
];

// Flag to track if attendance column is visible
let attendanceColumnVisible = false;

// Initialize the page
function init() {
  // populateStudentsTable();
  setupEventListeners();
  setupFormValidation();
}

// Populate students table with data
// function populateStudentsTable() {
//   studentsBody.innerHTML = "";

//   students.forEach((student) => {
//     const row = document.createElement("tr");

//     // Create cells for list number, control number, and name
//     const listNumCell = document.createElement("td");
//     listNumCell.textContent = student.id;

//     const controlNumCell = document.createElement("td");
//     controlNumCell.textContent = student.controlNum;

//     const nameCell = document.createElement("td");
//     nameCell.textContent = student.name;

//     // Append cells to row
//     row.appendChild(listNumCell);
//     row.appendChild(controlNumCell);
//     row.appendChild(nameCell);

//     // Append row to table body
//     studentsBody.appendChild(row);
//   });
// }

// Set up event listeners
function setupEventListeners() {
  // Subject selection change
  // materiaSelect.addEventListener("change", function () {
  //   // In a real app, this would fetch students for the selected subject
  //   console.log("Selected subject:", this.value);
  // });

  // List button click - add attendance column
  btnListar.addEventListener("click", function () {
    toggleAttendanceColumn();
  });

  // Open modal for new partial
  btnAperturar.addEventListener("click", function () {
    openModal();
  });

  // Close modal
  closeModal.addEventListener("click", function () {
    closeModalFunction();
  });

  btnCancelar.addEventListener("click", function () {
    closeModalFunction();
  });

  // Edit criteria button
  btnEditCriterios.addEventListener("click", function () {
    toggleCriteriaEditing();
  });

  // Close modal when clicking outside
  window.addEventListener("click", function (event) {
    if (event.target === modalParcial) {
      closeModalFunction();
    }
  });
}

// Toggle attendance column
function toggleAttendanceColumn() {
  if (!attendanceColumnVisible) {
    // Add header for attendance
    const headerRow = studentsTable.querySelector("thead tr");
    const attendanceHeader = document.createElement("th");
    attendanceHeader.textContent = "Asistencia";
    attendanceHeader.classList.add("attendance-header");
    headerRow.appendChild(attendanceHeader);

    // Add attendance cells to each row
    const rows = studentsBody.querySelectorAll("tr");
    rows.forEach((row) => {
      const attendanceCell = document.createElement("td");
      attendanceCell.classList.add("attendance-cell");

      // Create attendance options (0=absent, 1=present, 2=late, 3=excused)
      const options = [
        { value: 0, label: "0", class: "option-0", title: "Falta" },
        { value: 1, label: "1", class: "option-1", title: "Asistencia" },
        { value: 2, label: "2", class: "option-2", title: "Retardo" },
        { value: 3, label: "3", class: "option-3", title: "Justificado" },
      ];

      options.forEach((option) => {
        const optionElement = document.createElement("span");
        optionElement.textContent = option.label;
        optionElement.classList.add("attendance-option", option.class);
        optionElement.title = option.title;
        optionElement.dataset.value = option.value;

        optionElement.addEventListener("click", function () {
          // Remove selected class from all options in this cell
          attendanceCell
            .querySelectorAll(".attendance-option")
            .forEach((opt) => {
              opt.classList.remove("selected");
            });

          // Add selected class to clicked option
          this.classList.add("selected");
        });

        attendanceCell.appendChild(optionElement);
      });

      row.appendChild(attendanceCell);
    });

    attendanceColumnVisible = true;
    btnListar.textContent = "Ocultar Lista";
  } else {
    // Remove attendance header
    const attendanceHeader = studentsTable.querySelector(".attendance-header");
    if (attendanceHeader) {
      attendanceHeader.remove();
    }

    // Remove attendance cells
    const rows = studentsBody.querySelectorAll("tr");
    rows.forEach((row) => {
      const lastCell = row.lastElementChild;
      if (lastCell && lastCell.classList.contains("attendance-cell")) {
        lastCell.remove();
      }
    });

    attendanceColumnVisible = false;
    btnListar.innerHTML = '<i class="icon-list"></i> Listar';
  }
}

// Open modal
function openModal() {
  modalParcial.style.display = "block";

  // Set default values
  document.getElementById("materia-id").value = materiaSelect.value || "";
  document.getElementById("fecha-apertura").value = getCurrentDate();

  // Calculate default closing date (30 days from now)
  const closingDate = new Date();
  closingDate.setDate(closingDate.getDate() + 30);
  document.getElementById("fecha-cierre").value = formatDate(closingDate);
}

// Close modal
function closeModalFunction() {
  modalParcial.style.display = "none";
  formParcial.reset();
}

// Toggle criteria editing
function toggleCriteriaEditing() {
  const criteriaInputs = document.querySelectorAll(".criterios input");
  const isReadOnly = criteriaInputs[0].readOnly;

  criteriaInputs.forEach((input) => {
    input.readOnly = !isReadOnly;
    if (!isReadOnly) {
      input.style.backgroundColor = "white";
    } else {
      input.style.backgroundColor = "var(--light-gray)";
    }
  });

  // Update button text
  if (isReadOnly) {
    btnEditCriterios.innerHTML = '<i class="icon-edit"></i> Guardar criterios';
  } else {
    btnEditCriterios.innerHTML = '<i class="icon-edit"></i> Editar criterios';
    updateTotals();
  }
}

// Update totals when criteria change
function updateTotals() {
  const saber = parseInt(document.getElementById("saber-percent").value) || 0;
  const hacer = parseInt(document.getElementById("hacer-percent").value) || 0;
  const ser = parseInt(document.getElementById("ser-percent").value) || 0;

  const total = saber + hacer + ser;
  document.getElementById("total-percent").value = total;

  const restante = 100 - total;
  document.getElementById("restante-percent").value = restante;
}

// Set up form validation
function setupFormValidation() {
  // Add input event listeners to criteria inputs
  const criteriaInputs = document.querySelectorAll(".criterios input");
  criteriaInputs.forEach((input) => {
    input.addEventListener("input", updateTotals);
  });

  // Form submission
  formParcial.addEventListener("submit", function (event) {
    event.preventDefault();

    // Validate form
    const total = parseInt(document.getElementById("total-percent").value);

    if (total !== 100) {
      alert("La suma de los criterios debe ser 100%");
      return;
    }

    // In a real app, this would save the partial data
    alert("Parcial aperturado correctamente");
    closeModalFunction();
  });
}

// Helper function to get current date in YYYY-MM-DD format
function getCurrentDate() {
  const now = new Date();
  return formatDate(now);
}

// Format date as YYYY-MM-DD
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Initialize the page when DOM is loaded
document.addEventListener("DOMContentLoaded", init);

fetch("php/materias.php")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Error al obtener los datos");
    }
    return response.json();
  })
  .then((materias) => {
    generarMaterias(materias);
  })
  .catch((error) => console.error("Error:", error));

function generarMaterias(options) {
  const container = document.getElementById("comboBoxOptions");
  container.style.display = "none";

  // Limpia antes de agregar
  options.forEach((option) => {
    const customOption = document.createElement("div");
    customOption.classList.add("custom-option");
    customOption.setAttribute("id", option.idgru);
    customOption.setAttribute("data-value", option.matcve);
    customOption.setAttribute("data-name", option.matnom);
    customOption.setAttribute("data-grupo", option.paqcve);

    customOption.innerHTML = `
      <div>${option.matcve}</div>
      <div>${option.paqcve}</div>
      <div>${option.matnom}</div>
      <div></div>
      <div>/</div>
    `;

    customOption.addEventListener("click", function () {
      const name = this.getAttribute("data-name");
      comboBoxButton.textContent = name;
      comboBoxOptions.style.display = "none";
      materiaSeleccionada = this.getAttribute("data-value");
      grupo = this.getAttribute("data-grupo");
      const url = `php/ejemplo.php?materia=${encodeURIComponent(
        materiaSeleccionada
      )}&grupo=${encodeURIComponent(grupo)}`;
      console.log(url);
      // Realiza la solicitud GET con Fetch
      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status}`);
          }
          return response.text(); // Devuelve la respuesta como texto
        })
        .then((data) => {
          // Muestra la respuesta en el div con ID "datos"
          document.getElementById("datos").innerHTML = data;
        })
        .catch((error) => {
          console.error("Hubo un problema con la solicitud Fetch:", error);
        });
    });

    container.appendChild(customOption);
  });
  container.style.display = "none";
}

// Mostrar/ocultar el comboBox
comboBoxButton.addEventListener("click", () => {
  const isVisible = comboBoxOptions.style.display === "block";
  comboBoxOptions.style.display = isVisible ? "none" : "block";
});

// Cerrar si se hace clic fuera
document.addEventListener("click", (event) => {
  if (!event.target.closest(".combo-box")) {
    comboBoxOptions.style.display = "none";
  }
});
