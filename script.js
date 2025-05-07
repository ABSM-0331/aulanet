// DOM Elements
const materiaSelect = document.getElementById("materia-select");
const parcialSelect = document.getElementById("parcial-select");
const btnListar = document.getElementById("btn-listar");
const studentsTable = document.getElementById("students-table");
const studentsBody = document.getElementById("datos");
const btnAperturar = document.getElementById("btn-aperturar");
const modalParcial = document.getElementById("modal-parcial");
const closeModal = document.querySelector(".close-modal");
const btnCancelar = document.getElementById("btn-cancelar");
const formParcial = document.getElementById("form-parcial");
const btnEditCriterios = document.getElementById("btn-edit-criterios");
const btnGestionarTareas = document.getElementById("btn-actividades"); // Nuevo botón para gestionar tareas
const modalGestionarTareas = document.getElementById("modalGestionarTareas"); // Modal de tareas

function loadTasksData() {
  const tasks = [
    {
      id: 1,
      title: "Tarea 1",
      description: "Descripción de la tarea 1",
      status: "Pendiente",
    },
    {
      id: 2,
      title: "Tarea 2",
      description: "Descripción de la tarea 2",
      status: "En progreso",
    },
    {
      id: 3,
      title: "Tarea 3",
      description: "Descripción de la tarea 3",
      status: "Completada",
    },
  ];

  const taskListContainer = document.getElementById("task-list");
  taskListContainer.innerHTML = ""; // Limpiar la lista antes de agregar nuevas tareas

  tasks.forEach((task) => {
    const taskItem = document.createElement("div");
    taskItem.classList.add("task-item");

    const taskTitle = document.createElement("h4");
    taskTitle.textContent = task.title;

    const taskDescription = document.createElement("p");
    taskDescription.textContent = task.description;

    const taskStatus = document.createElement("span");
    taskStatus.textContent = task.status;
    taskStatus.classList.add(
      "status",
      task.status.toLowerCase().replace(" ", "-")
    );

    // Botón para editar tarea
    const editBtn = document.createElement("button");
    editBtn.textContent = "Editar";
    editBtn.onclick = () => openEditTaskForm(task);

    taskItem.appendChild(taskTitle);
    taskItem.appendChild(taskDescription);
    taskItem.appendChild(taskStatus);
    taskItem.appendChild(editBtn);

    taskListContainer.appendChild(taskItem);
  });
}

function closeModalTareasFunction() {
  modalGestionarTareas.style.display = "none";
}
function abrirModal() {
  modalGestionarTareas.style.display = "block";
  loadTasksData(); // Cargar datos de tareas al abrir el modal
}
// Flag to track if attendance column is visible
let attendanceColumnVisible = false;

// Initialize the page
function init() {
  // populateStudentsTable();
  setupEventListeners();
  setupFormValidation();
}

// Set up event listeners
function setupEventListeners() {
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
      const input = document.createElement("input");
      input.type = "text";
      input.classList.add("input-list");
      input.setAttribute("onblur", "predeterminado(this)");
      input.addEventListener("click", function () {
        this.select();
      });
      attendanceCell.appendChild(input);
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
function predeterminado(input) {
  if (input.value.trim() === "") {
    input.value = "1";
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
