// DOM Elements
const materiaSelect = document.getElementById("materia-select");
const parcialSelect = document.getElementById("parcial-select");
const btnListar = document.getElementById("btn-listar");
const tabla = document.getElementById("contenedor-tabla");
const btnAperturar = document.getElementById("btn-aperturar");
const modalParcial = document.getElementById("modal-parcial");
const closeModal = document.querySelector(".close-modal");
const btnCancelar = document.getElementById("btn-cancelar");
const formParcial = document.getElementById("form-parcial");
const btnEditCriterios = document.getElementById("btn-edit-criterios");
const btnGestionarTareas = document.getElementById("btn-actividades"); // Nuevo botón para gestionar tareas
const modalGestionarTareas = document.getElementById("modalGestionarTareas"); // Modal de tareas
const formTareas = document.getElementById("form-tareas"); // Formulario de tareas
const btnGuardarLista = document.getElementById("btn-guardar-lista");
// const studentsTable = document.getElementById("students-table");
// const studentsBody = document.getElementById("datos");
let seleccion = null;
// const studentsTable = document.getElementById("students-table");
// const studentsBody = document.getElementById("datos");

function loadTasksData() {
  const taskListContainer = document.getElementById("task-list");
  taskListContainer.innerHTML = ""; // Limpiar lista antes de agregar nuevas

  if (!seleccion) {
    taskListContainer.innerHTML =
      "<p style='color:red;'>Primero selecciona una materia.</p>";
    return;
  }

  const materia = seleccion.getAttribute("data-value");
  const grupo = seleccion.getAttribute("data-grupo");

  fetch(
    `php/obtener_tareas.php?materia=${encodeURIComponent(
      materia
    )}&grupo=${encodeURIComponent(grupo)}`
  )
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "ok") {
        const tareas = data.tareas;

        if (tareas.length === 0) {
          taskListContainer.innerHTML =
            "<p>No hay tareas registradas para esta materia y grupo.</p>";
          return;
        }

        tareas.forEach((t) => {
          const taskItem = document.createElement("div");
          taskItem.classList.add("task-item");
          taskItem.style.border = "1px solid #ccc";
          taskItem.style.padding = "10px";
          taskItem.style.marginBottom = "10px";
          taskItem.style.borderRadius = "5px";
          taskItem.style.backgroundColor = "#f9f9f9";

          taskItem.innerHTML = `
            <h4 style="margin: 0 0 5px 0;">${t.titulo}</h4>
            <p style="margin: 0 0 5px 0;">${t.descripcion}</p>
            <span style="font-weight: bold;">Valor: ${t.valor}</span>
          `;

          taskListContainer.appendChild(taskItem);
        });
      } else {
        taskListContainer.innerHTML = `<p style="color:red;">Error al obtener tareas: ${data.message}</p>`;
      }
    })
    .catch((err) => {
      taskListContainer.innerHTML =
        "<p style='color:red;'>Hubo un error al cargar las tareas.</p>";
      console.error(err);
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
  // cargarlista();
  setupEventListeners();
  setupFormValidation();
  iniciarMaterias();
}

function savelists() {
  const body = document.getElementById("datos");
  console.log("Botón Guardar Lista clickeado");
  const filas = body.querySelectorAll("tr");
  // const filas = studentsBody.querySelectorAll(".input-list");
  let llenas = true;
  const matriculas = [];
  const datos = [];

  filas.forEach((fila) => {
    const valor = fila.querySelector(".input-list").value;
    if (!valor) {
      llenas = false;
      return;
    }
    matriculas.push(fila.cells[1].textContent.trim());
    datos.push(valor);
  });
  if (llenas) {
    datos.forEach((dato, index) => {
      const parcial = 2;
      fetch("php/lista.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          asignatura: "Matemáticas",
          codigo_alumno: matriculas[index],
          codigo_lista: dato,
          parcial: parcial,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Respuesta del servidor:", data);
        })
        .catch((error) => {
          console.error("Error al hacer la solicitud:", error);
        });
    });
  } else {
    alert("Algunas celdas están vacías.");
  }
}

// Set up event listeners
function setupEventListeners() {
  btnGuardarLista.addEventListener("click", function () {
    savelists();
    Swal.fire({
      title: "¡Pase de lista exitoso!",
      text: "La lista se guardó correctamente.",
      icon: "success",
      confirmButtonText: "Aceptar",
    });
    listarAlumnos();
  });
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
    const tablaStudents = document.getElementById("students-table");
    const cuerpotabla = document.getElementById("datos");
    const headerRow = tablaStudents.querySelector("thead tr");
    const attendanceHeader = document.createElement("th");
    attendanceHeader.textContent = "Asistencia";
    attendanceHeader.classList.add("attendance-header");
    headerRow.appendChild(attendanceHeader);

    // Add attendance cells to each row
    const rows = cuerpotabla.querySelectorAll("tr");
    rows.forEach((row) => {
      const attendanceCell = document.createElement("td");
      attendanceCell.classList.add("attendance-cell");
      const input = document.createElement("input");
      input.type = "number";
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
    const studentsBody = document.getElementById("datos");
    const studentsTable = document.getElementById("students-table");

    let attendanceHeader = studentsTable.querySelector(".attendance-header");
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
    btnListar.textContent = "Listar";
  }
}
function mostrarFormulario() {
  formTareas.classList.toggle("visible");
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

function iniciarMaterias() {
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
}
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
      seleccion = this;
      listarAlumnos();
    });

    container.appendChild(customOption);
  });
  container.style.display = "none";
}
function listarAlumnos() {
  const name = seleccion.getAttribute("data-name");
  console.log(name);
  comboBoxButton.textContent = name;
  comboBoxOptions.style.display = "none";
  materiaSeleccionada = seleccion.getAttribute("data-value");
  grupo = seleccion.getAttribute("data-grupo");
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
      console.log("Datos recibidos:", data);
      // Muestra la respuesta en el div con ID "datos"
      tabla.innerHTML = data;
      cargarlista();
    })
    .catch((error) => {
      console.error("Hubo un problema con la solicitud Fetch:", error);
    });
}
async function cargarlista() {
  const studentsTable = document.getElementById("students-table");
  const studentsBody = document.getElementById("datos");
  alert("Cargando lista de estudiantes...");
  const res = await fetch(
    `php/obtener_listas.php?asignatura=${encodeURIComponent(
      "Matematicas"
    )}&parcial=${encodeURIComponent(2)}`
  );

  alert("Lista de estudiantes cargada correctamente");
  const registros = await res.json();

  console.log(registros);
  if (!Array.isArray(registros)) {
    alert("Error al obtener los datos");
    return;
  }

  // Obtener todas las fechas únicas
  const fechasUnicas = [...new Set(registros.map((r) => r.fecha))];

  // Agregar cabeceras con las fechas
  const thead = studentsTable.querySelector("thead tr");
  console.log(thead);
  fechasUnicas.forEach((fecha) => {
    console.log(fecha);
    const th = document.createElement("th");

    const div = document.createElement("div");
    const [dia, hora] = fecha.split(" ");
    div.innerHTML = `${dia}<br>${hora}`;
    // console.log(anio);
    // console.log(mes);
    // console.log(dia);
    div.classList.add("fecha-rotada");

    th.appendChild(div); // Agrega el div al th
    // th.innerHTML = `${anio}/${mes}/${dia}`;

    if (thead.appendChild(th)) {
      console.log("Fecha agregada a la cabecera:", fecha);
    }
  });

  // Recorrer filas y agregar datos
  studentsBody.querySelectorAll("tr").forEach((fila) => {
    const codigo = fila.cells[1].textContent.trim(); // Segunda celda = código alumno

    fechasUnicas.forEach((fecha) => {
      const celda = document.createElement("td");
      const entrada = registros.find(
        (r) => r.codigo_alumno === codigo && r.fecha === fecha
      );
      if (entrada) {
        const valor = entrada.codigo_lista;
        console.log(valor);
        celda.textContent = valor;
      } else {
        celda.textContent = "-"; // Sin registro
      }

      fila.appendChild(celda);
    });
  });
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
// Mostrar/ocultar el formulario de tarea
function mostrarFormulario() {
  const formTareas = document.getElementById("form-tareas");
  if (formTareas.style.display === "none" || formTareas.style.display === "") {
    formTareas.style.display = "block";
  } else {
    formTareas.style.display = "none";
  }
}

// Guardar tarea en la base de datos
document.getElementById("save-task-btn").addEventListener("click", function () {
  const titulo = document.getElementById("task-title").value.trim();
  const descripcion = document.getElementById("task-description").value.trim();
  const valor = document.getElementById("task-value").value.trim();

  if (!titulo || !descripcion || !valor) {
    Swal.fire(
      "Campos incompletos",
      "Por favor llena todos los campos.",
      "warning"
    );
    return;
  }

  if (!seleccion) {
    Swal.fire(
      "Selecciona una materia",
      "Debes seleccionar una materia antes de guardar la tarea.",
      "warning"
    );
    return;
  }

  const materia = seleccion.getAttribute("data-value");
  const grupo = seleccion.getAttribute("data-grupo"); // ✅ obtenemos el grupo también

  fetch("php/guardar_tarea.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      titulo,
      descripcion,
      valor,
      materia,
      grupo, // ✅ enviamos el grupo al backend
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "ok") {
        Swal.fire("Tarea guardada", data.message, "success").then(() => {
          // Ocultar formulario
          document.getElementById("form-tareas").style.display = "none";

          // Mostrar botón "Nueva tarea" y ocultar botón "volver"
          document.getElementById("nueva-tarea-wrapper").style.display =
            "block";

          document.getElementById("task-list").style.display = "block";

          const volverBtn = document.getElementById("btn-volver-tareas");
          if (volverBtn) volverBtn.style.display = "none";

          // Limpiar formulario
          document.getElementById("task-title").value = "";
          document.getElementById("task-description").value = "";
          document.getElementById("task-value").value = "";

          // Recargar tareas
          loadTasksData();
        });
      } else {
        Swal.fire("Error", data.message, "error");
      }
    })
    .catch((err) => {
      Swal.fire("Error", "Hubo un problema al guardar la tarea.", "error");
      console.error(err);
    });
});
let tareaFormVisible = false;

function mostrarFormulario() {
  const formTareas = document.getElementById("form-tareas");
  const taskList = document.getElementById("task-list");
  const botonNueva = document.getElementById("nueva-tarea-wrapper");

  if (!tareaFormVisible) {
    // Mostrar formulario y ocultar lista de tareas
    formTareas.style.display = "block";
    taskList.style.display = "none";
    botonNueva.style.display = "none";

    // Agregar flechita de regreso
    if (!document.getElementById("back-arrow")) {
      const backArrow = document.createElement("span");
      backArrow.id = "back-arrow";
      backArrow.innerHTML = "← Volver";
      backArrow.style.cursor = "pointer";
      backArrow.style.color = "#007bff";
      backArrow.style.marginBottom = "10px";
      backArrow.style.display = "inline-block";
      backArrow.onclick = confirmarSalirDelFormulario;
      formTareas.prepend(backArrow);
    }

    tareaFormVisible = true;
  }
}

function confirmarSalirDelFormulario() {
  const titulo = document.getElementById("task-title").value.trim();
  const descripcion = document.getElementById("task-description").value.trim();
  const valor = document.getElementById("task-value").value.trim();

  if (titulo || descripcion || valor) {
    Swal.fire({
      title: "¿Estás seguro de salir?",
      text: "No has guardado tus cambios.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        ocultarFormularioTareas();
      }
    });
  } else {
    ocultarFormularioTareas();
  }
}

function ocultarFormularioTareas() {
  const formTareas = document.getElementById("form-tareas");
  const taskList = document.getElementById("task-list");
  const botonNueva = document.getElementById("nueva-tarea-wrapper");

  formTareas.style.display = "none";
  taskList.style.display = "block";
  botonNueva.style.display = "block";
  tareaFormVisible = false;

  // Limpiar campos
  // formTareas.reset();

  const backArrow = document.getElementById("back-arrow");
  if (backArrow) backArrow.remove();
}

// ✅ Reemplaza tu función abrirModal con esta versión:
function abrirModal() {
  modalGestionarTareas.style.display = "block";

  // Asegurarse de que el formulario esté oculto
  document.getElementById("form-tareas").style.display = "none";
  document.getElementById("task-list").style.display = "block";
  document.getElementById("nueva-tarea-wrapper").style.display = "block";

  const backArrow = document.getElementById("back-arrow");
  if (backArrow) backArrow.remove();

  tareaFormVisible = false;
  loadTasksData(); // Cargar las tareas
}
