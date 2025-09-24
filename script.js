// Variables globales para almacenar la selección
let selectedIdgru = null;
let selectedMatcve = null;

// Código para el botón "Ver Parciales"

// DOM Elements
let materiaSelect = document.getElementById("materia-select");
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
const tabButtons = document.querySelectorAll(".tab-button");
// let btnactivo;
// const body = document.getElementById("datos");
// const studentsTable = document.getElementById("students-table");

let modoTarea = "nuevo"; // Puede ser "nuevo" o "editar"
let tareaEnEdicion = null; // Aquí guardaremos la tarea cuando se edita
let seleccion = null;
// const studentsTable = document.getElementById("students-table");
// const studentsBody = document.getElementById("datos");

function agregarColumnaTarea(nombreTarea, idtarea) {
    const tablaStudents = document.getElementById("students-table");
    if (!tablaStudents) return;

    const thead = tablaStudents.querySelector("thead tr");
    const tbody = tablaStudents.querySelector("tbody");
    if (!thead || !tbody) return;

    // Verificar si ya existe la columna con ese idtarea
    const columnaExistente = thead.querySelector(
        `th[data-idtarea='${idtarea}']`
    );
    if (columnaExistente) return; // Ya está agregada

    // Crear el encabezado
    const th = document.createElement("th");
    th.setAttribute("data-idtarea", idtarea); // Asocia el idtarea al th
    th.classList.add("th-tarea");
    const div = document.createElement("div");

    let parte1 = nombreTarea;
    let parte2 = "";

    if (nombreTarea.length > 10) {
        const palabras = nombreTarea.split(" ");
        const mitad = Math.ceil(palabras.length / 2);
        parte1 = palabras.slice(0, mitad).join(" ");
        parte2 = palabras.slice(mitad).join(" ");
    }

    div.innerHTML = parte2 ? `${parte1}<br>${parte2}` : `${parte1}`;
    div.classList.add("fecha-rotada");

    th.appendChild(div);
    thead.appendChild(th);

    // Agregar celdas en cada fila del tbody
    tbody.querySelectorAll("tr").forEach((fila, index) => {
        const td = document.createElement("td");
        td.className = "attendance-cell";
        const input = document.createElement("input");

        input.className = "input-list";
        input.type = "number";
        input.min = "0";
        input.max = "100";
        input.classList.add("nota-tarea");
        // input.addEventListener("keydown", function (e) {
        //   if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        //     e.preventDefault(); // Evita el comportamiento por defecto de las flechas
        //   }
        // });
        td.appendChild(input);
        fila.appendChild(td);
    });
    tbody.addEventListener("keydown", function (e) {
        if (e.target.tagName === "INPUT" && e.target.type === "number") {
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                e.preventDefault();

                const allInputs = [...tbody.querySelectorAll(".nota-tarea")];
                const index = allInputs.indexOf(e.target);

                if (e.key === "ArrowUp" && index > 0) {
                    allInputs[index - 1].focus();
                }
                if (e.key === "ArrowDown" && index < allInputs.length - 1) {
                    allInputs[index + 1].focus();
                }
            }
        }
    });
}

function loadTasksData() {
    let total = 0;
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
                    total += t.valor;
                    console.log("Valor de tarea:", t.valor);
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
    <br><br>
    <button class="btn btn-warning btn-editar">Editar</button>
    <button class="btn btn-danger btn-eliminar">Eliminar</button>
  `;

                    // Botones de editar y eliminar
                    const btnEditar = taskItem.querySelector(".btn-editar");
                    const btnEliminar = taskItem.querySelector(".btn-eliminar");

                    btnEditar.addEventListener("click", () => {
                        editarTarea(t);
                    });

                    btnEliminar.addEventListener("click", () => {
                        eliminarTarea(t);
                    });

                    taskListContainer.appendChild(taskItem);
                });
                document.querySelector(
                    ".total-tareas"
                ).textContent = `${total}/40`;
                console.log("total" + total);
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
    // populateAllStudentsTables();
    setupEventListeners();
    setupFormValidation();
    iniciarMaterias();
    setupTabSystem();
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
        const valor = fila.querySelector(".codigo-lista").value;
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
                    Swal.fire({
                        title: "¡Pase de lista exitoso!",
                        text: "La lista se guardó correctamente.",
                        icon: "success",
                        confirmButtonText: "Aceptar",
                    });
                    attendanceColumnVisible = false;
                })
                .catch((error) => {
                    console.error("Error al hacer la solicitud:", error);
                });
        });
        listarAlumnos();
    } else {
        alert("Algunas celdas están vacías.");
    }
}

// Set up event listeners
function setupEventListeners() {
    btnGuardarLista.addEventListener("click", function () {
        savelists();
        listarAlumnos();
    });
    // List button click - add attendance column
    btnListar.addEventListener("click", function () {
        let criterio = Array.from(tabButtons)
            .find((btn) => btn.classList.contains("active"))
            .getAttribute("data-tab");
        if (criterio === "ser") {
            toggleAttendanceColumn();
        } else {
            Swal.fire(
                "Cambiar a criterio 'Ser'",
                "Para poder tomar lista, debes cambiar al criterio 'Ser'.",
                "warning"
            );
        }
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
            input.classList.add("codigo-lista");
            input.setAttribute("onblur", "predeterminado(this)");
            input.addEventListener("click", function () {
                this.select();
            });

            attendanceCell.appendChild(input);
            row.appendChild(attendanceCell);
        });
        cuerpotabla.addEventListener("keydown", function (e) {
            if (e.target.tagName === "INPUT" && e.target.type === "number") {
                if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                    e.preventDefault();

                    const allInputs = [
                        ...cuerpotabla.querySelectorAll(".codigo-lista"),
                    ];
                    const index = allInputs.indexOf(e.target);

                    if (e.key === "ArrowUp" && index > 0) {
                        allInputs[index - 1].focus();
                    }
                    if (e.key === "ArrowDown" && index < allInputs.length - 1) {
                        allInputs[index + 1].focus();
                    }
                }
            }
        });

        attendanceColumnVisible = true;
    } else {
        const studentsBody = document.getElementById("datos");
        const studentsTable = document.getElementById("students-table");

        let attendanceHeader =
            studentsTable.querySelector(".attendance-header");
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
    // Set default values
    if (seleccion) {
        modalParcial.style.display = "block";
        document.getElementById("materia-id").value =
            seleccion.getAttribute("data-name") || "";
        document.getElementById("grupo-id").value =
            seleccion.getAttribute("data-grupo") || "";
        document.getElementById("clave-id").value =
            seleccion.getAttribute("data-value") || "";
        document.getElementById("periodo-id").value = "AGO25ENE26";
        document.getElementById("fecha-apertura").value = getCurrentDate();

        // Calculate default closing date (30 days from now)
        const closingDate = new Date();
        closingDate.setDate(closingDate.getDate() + 30);
        document.getElementById("fecha-cierre").value = formatDate(closingDate);
    } else {
        Swal.fire(
            "Selecciona una materia",
            "Debes seleccionar una materia antes de aperturar un parcial.",
            "warning"
        );
    }
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
        btnEditCriterios.innerHTML =
            '<i class="icon-edit"></i> Guardar criterios';
    } else {
        btnEditCriterios.innerHTML =
            '<i class="icon-edit"></i> Editar criterios';
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
        const formData = new FormData(formParcial);
        console.log(formData);
        fetch("php/agregarParcial.php", {
            method: "POST",
            body: formData,
        })
            .then((response) => {
                console.log(response);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                console.log("Respuesta del servidor:", data);
                if (data["respuesta"]) {
                }
            })
            .catch((error) => {
                console.error("Error en fetch:", error);
            });

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
            // console.log(response);
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
            // listarAlumnos();
            listarParciales();
        });

        container.appendChild(customOption);
    });
    container.style.display = "none";
}

async function agregarTareasExistentes() {
    if (!seleccion) return;

    const materia = seleccion.getAttribute("data-value");
    const grupo = seleccion.getAttribute("data-grupo");
    const criterio = Array.from(tabButtons)
        .find((btn) => btn.classList.contains("active"))
        ?.getAttribute("data-tab");

    try {
        const res = await fetch(
            `php/obtener_tareas.php?materia=${encodeURIComponent(
                materia
            )}&grupo=${encodeURIComponent(grupo)}&criterio=${encodeURIComponent(
                criterio
            )}`
        );
        const data = await res.json();

        if (data.status === "ok") {
            const tareas = data.tareas;

            tareas.forEach((t) => {
                agregarColumnaTarea(t.titulo, t.idtarea);
            });
        } else {
            console.error("Error al obtener tareas:", data.message);
        }
    } catch (error) {
        console.error("Error en agregarTareasExistentes:", error);
    }
}

function listarAlumnos() {
    if (!seleccion) {
        Swal.fire(
            "Selecciona una materia",
            "Debes seleccionar una materia para ver la lista.",
            "warning"
        );
        return;
    }
    let criterio = Array.from(tabButtons)
        .find((btn) => btn.classList.contains("active"))
        ?.getAttribute("data-tab");
    console.log("Criterio activo:", criterio);
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
            // console.log("Datos recibidos:", data);
            // Muestra la respuesta en el div con ID "datos"
            tabla.innerHTML = data;
            if (criterio === "ser") {
                cargarlista();
            }
            agregarTareasExistentes();
        })
        .catch((error) => {
            console.error("Hubo un problema con la solicitud Fetch:", error);
        });
}
async function cargarlista() {
    const studentsTable = document.getElementById("students-table");
    const studentsBody = document.getElementById("datos");
    alert("Cargando lista de estudiantes...");
    console.log("Cargando lista de estudiantes...");
    const res = await fetch(
        `php/obtener_listas.php?asignatura=${encodeURIComponent(
            "Matematicas"
        )}&parcial=${encodeURIComponent(2)}`
    );

    alert("Lista de estudiantes cargada correctamente");
    console.log("Lista de estudiantes cargada correctamente");
    const registros = await res.json();

    // console.log(registros);
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
        th.classList.add("th-fecha");
        const div = document.createElement("div");
        const [dia, hora] = fecha.split(" ");
        div.innerHTML = `${dia}<br>${hora}`;
        // console.log(anio);
        // console.log(mes);
        // console.log(dia);
        div.classList.add("fecha-rotada");

        th.appendChild(div); // Agrega el div al th
        // th.innerHTML = `${anio}/${mes}/${dia}`;
        thead.appendChild(th);
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
    crearClik();
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
    if (
        formTareas.style.display === "none" ||
        formTareas.style.display === ""
    ) {
        formTareas.style.display = "block";
    } else {
        formTareas.style.display = "none";
    }
}

document.getElementById("save-task-btn").addEventListener("click", function () {
    const titulo = document.getElementById("task-title").value.trim();
    const descripcion = document
        .getElementById("task-description")
        .value.trim();
    const criterio = document.getElementById("task-criterio").value.trim();
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

    if (modoTarea === "nuevo") {
        guardarNuevaTarea(titulo, descripcion, valor, criterio);
    } else if (modoTarea === "editar") {
        modificarTareaExistente(titulo, descripcion, valor, criterio);
    }
});

function guardarNuevaTarea(titulo, descripcion, valor, criterio) {
    const materia = seleccion.getAttribute("data-value");
    const grupo = seleccion.getAttribute("data-grupo");

    fetch("php/guardar_tarea.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            titulo,
            descripcion,
            valor,
            criterio,
            materia,
            grupo,
        }),
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.status === "ok") {
                Swal.fire("Tarea guardada", data.message, "success").then(
                    () => {
                        //agregarColumnaTarea(titulo, data.idtarea); // Usa el id real
                        ocultarFormularioTareas();
                        loadTasksData();
                        listarAlumnos();
                    }
                );
            } else {
                Swal.fire("Error", data.message, "error");
            }
        })
        .catch((err) => {
            Swal.fire(
                "Error",
                "Hubo un problema al guardar la tarea.",
                "error"
            );
            console.error(err);
        });
}

function modificarTareaExistente(titulo, descripcion, valor) {
    fetch("php/modificar_tarea.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            idtarea: tareaEnEdicion.idtarea,
            titulo,
            descripcion,
            valor,
        }),
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.status === "ok") {
                Swal.fire("Tarea modificada", data.message, "success").then(
                    () => {
                        const thTarea = document.querySelector(
                            `th[data-idtarea='${tareaEnEdicion.idtarea}']`
                        );
                        if (thTarea) {
                            const div = thTarea.querySelector("div");
                            let parte1 = titulo;
                            let parte2 = "";

                            if (titulo.length > 10) {
                                const palabras = titulo.split(" ");
                                const mitad = Math.ceil(palabras.length / 2);
                                parte1 = palabras.slice(0, mitad).join(" ");
                                parte2 = palabras.slice(mitad).join(" ");
                            }

                            div.innerHTML = parte2
                                ? `${parte1}<br>${parte2}`
                                : `${parte1}`;
                        }

                        ocultarFormularioTareas();
                        loadTasksData();
                    }
                );
            } else {
                Swal.fire("Error", data.message, "error");
            }
        })
        .catch((err) => {
            Swal.fire(
                "Error",
                "Hubo un problema al modificar la tarea.",
                "error"
            );
            console.error(err);
        });
}

function mostrarFormulario() {
    const formTareas = document.getElementById("form-tareas");
    const taskList = document.getElementById("task-list");
    const botonNueva = document.getElementById("nueva-tarea-wrapper");

    //if (!tareaFormVisible) {
    // Mostrar formulario y ocultar lista de tareas
    formTareas.style.display = "block";
    taskList.style.display = "none";
    botonNueva.style.display = "none";

    // Limpiar campos

    document.getElementById("task-title").value = "";
    document.getElementById("task-description").value = "";
    document.getElementById("task-value").value = "";

    // Establecer modo
    modoTarea = "nuevo";
    tareaEnEdicion = null;

    // Cambiar texto del botón
    document.getElementById("save-task-btn").textContent = "Guardar tarea";

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
    // }
}

function confirmarSalirDelFormulario() {
    const titulo = document.getElementById("task-title").value.trim();
    const descripcion = document
        .getElementById("task-description")
        .value.trim();
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

function editarTarea(tarea) {
    // Mostrar formulario y ocultar lista
    mostrarFormulario();

    document.getElementById("task-title").value = tarea.titulo;
    document.getElementById("task-description").value = tarea.descripcion;
    document.getElementById("task-value").value = tarea.valor;

    document.getElementById("save-task-btn").textContent = "Modificar tarea";

    modoTarea = "editar";
    tareaEnEdicion = tarea;
}

function eliminarTarea(tarea) {
    console.log("Función eliminarTarea llamada", tarea);
    Swal.fire({
        title: "¿Estás seguro?",
        text: "Esta acción eliminará la tarea.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
    }).then((result) => {
        if (result.isConfirmed) {
            fetch("php/eliminar_tarea.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    idtarea: tarea.idtarea,
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.status === "ok") {
                        Swal.fire("Eliminada", data.message, "success").then(
                            () => {
                                // Eliminar la columna de la tabla de alumnos en tiempo real
                                const thTarea = document.querySelector(
                                    `th[data-idtarea='${tarea.idtarea}']`
                                );
                                if (thTarea) {
                                    const index = Array.from(
                                        thTarea.parentNode.children
                                    ).indexOf(thTarea);
                                    thTarea.remove();

                                    // Eliminar las celdas correspondientes en cada fila
                                    const filas = document.querySelectorAll(
                                        "#students-table tbody tr"
                                    );
                                    filas.forEach((fila) => {
                                        fila.removeChild(fila.children[index]);
                                    });
                                }
                                loadTasksData();
                            }
                        );
                    } else {
                        Swal.fire("Error", data.message, "error");
                    }
                })
                .catch((err) => {
                    Swal.fire(
                        "Error",
                        "Hubo un problema al eliminar la tarea.",
                        "error"
                    );
                    console.error(err);
                });
        }
    });
}

// Sidebar nueva parte uwu para mostrar asistencias/faltas
function ensureAttendanceSidebar() {
    let sidebar = document.getElementById("attendance-sidebar");
    if (sidebar) return sidebar;

    sidebar = document.createElement("div");
    sidebar.id = "attendance-sidebar";
    sidebar.style.position = "fixed";
    sidebar.style.top = "80px";
    sidebar.style.right = "20px";
    sidebar.style.width = "320px";
    sidebar.style.maxHeight = "70vh";
    sidebar.style.overflowY = "auto";
    sidebar.style.background = "#fff";
    sidebar.style.border = "1px solid #ddd";
    sidebar.style.boxShadow = "0 6px 18px rgba(0,0,0,0.08)";
    sidebar.style.padding = "16px";
    sidebar.style.borderRadius = "8px";
    sidebar.style.zIndex = "9999";
    sidebar.style.display = "none";

    // Encabezado con cerrar
    const header = document.createElement("div");
    header.style.display = "flex";
    header.style.justifyContent = "space-between";
    header.style.alignItems = "center";
    header.style.marginBottom = "10px";

    const title = document.createElement("strong");
    title.textContent = "Asistencias / Faltas";
    header.appendChild(title);

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "✕";
    closeBtn.style.border = "none";
    closeBtn.style.background = "transparent";
    closeBtn.style.cursor = "pointer";
    closeBtn.style.fontSize = "16px";
    closeBtn.onclick = () => (sidebar.style.display = "none");
    header.appendChild(closeBtn);

    sidebar.appendChild(header);

    const content = document.createElement("div");
    content.id = "attendance-sidebar-content";
    sidebar.appendChild(content);

    document.body.appendChild(sidebar);
    return sidebar;
}

// Renderiza el resumen en el panel lateral
function renderAttendanceSidebar(info) {
    // info: { nombre, codigo, counts: {0: n, 1: n, 2: n, 3: n}, total }
    const sidebar = ensureAttendanceSidebar();
    const content = document.getElementById("attendance-sidebar-content");
    content.innerHTML = ""; // limpiar

    const nombre = document.createElement("div");
    nombre.style.marginBottom = "8px";
    nombre.innerHTML = `<strong style="font-size:16px">${
        info.nombre || "Alumno"
    }</strong><br><small>Código: ${info.codigo}</small>`;
    content.appendChild(nombre);

    const ul = document.createElement("div");
    ul.style.marginTop = "8px";
    ul.innerHTML = `
    <div style="margin:6px 0;"><strong>Total registros:</strong> ${
        info.total
    }</div>
    <div style="margin:6px 0;"><strong style="color: #28a745">Asistencias (1):</strong> ${
        info.counts[1] || 0
    }</div>
    <div style="margin:6px 0;"><strong style="color: #dc3545">Faltas (0):</strong> ${
        info.counts[0] || 0
    }</div>
    <div style="margin:6px 0;"><strong style="color: #ffc107">Retardos (2):</strong> ${
        info.counts[2] || 0
    }</div>
    <div style="margin:6px 0;"><strong style="color: #17a2b8">Justificaciones (3):</strong> ${
        info.counts[3] || 0
    }</div>
  `;
    content.appendChild(ul);

    sidebar.style.display = "block";
}

// Obtener conteo leyendo la fila (si la tabla ya contiene columnas con los códigos)
function getCountsFromRow(row) {
    const counts = { 0: 0, 1: 0, 2: 0, 3: 0 };
    const cells = Array.from(row.querySelectorAll("td"));

    cells.forEach((td) => {
        // prioridad: inputs dentro de la celda
        const input = td.querySelector("input");
        if (input) {
            const v = String(input.value || "").trim();
            if (/^[0-3]$/.test(v)) {
                counts[Number(v)] = (counts[Number(v)] || 0) + 1;
            }
            return;
        }

        const text = td.textContent.trim();
        if (/^[0-3]$/.test(text)) {
            counts[Number(text)] = (counts[Number(text)] || 0) + 1;
        }
    });

    const total = counts[0] + counts[1] + counts[2] + counts[3];
    return { counts, total };
}

// Llama al endpoint obtener_asistencias.php y normaliza la respuesta
function fetchCountsFromServer(codigo) {
    // si no hay materia seleccionada, aún así intentamos usar texto del combo (si existe)
    const materia = seleccion
        ? seleccion.getAttribute("data-value")
        : document.getElementById("comboBoxButton")?.textContent || "";
    const parcialSeleccionado = document.getElementById("parcial-select")
        ? document.getElementById("parcial-select").value
        : "";

    const url = `php/obtener_asistencias.php?asignatura=${encodeURIComponent(
        materia
    )}&parcial=${encodeURIComponent(
        parcialSeleccionado
    )}&codigo=${encodeURIComponent(codigo)}`;

    return fetch(url)
        .then((res) => {
            if (!res.ok) throw new Error("Respuesta del servidor no OK");
            return res.json();
        })
        .then((json) => {
            // Normalizar estructura:
            // Tu PHP devuelve: { status: 'ok', counts: { asistencias, faltas, retrasos, justificaciones }, total_registros }
            // o en otra forma. Creamos un objeto con counts[0..3] y total.
            if (json.status && json.status !== "ok") {
                return json; // pasamos el error al manejador
            }

            // Si vino con json.counts que contiene nombres:
            const source = json.counts || json;
            const countsNormalized = {
                0: Number(source.faltas ?? source[0] ?? 0),
                1: Number(source.asistencias ?? source[1] ?? 0),
                2: Number(source.retrasos ?? source[2] ?? 0),
                3: Number(source.justificaciones ?? source[3] ?? 0),
            };

            const total = Number(
                json.total_registros ??
                    json.total ??
                    countsNormalized[0] +
                        countsNormalized[1] +
                        countsNormalized[2] +
                        countsNormalized[3]
            );

            return {
                status: "ok",
                counts: countsNormalized,
                total,
                nombre: json.nombre ?? null,
            };
        });
}
function crearClik() {
    document.getElementById("datos")?.addEventListener("click", function (e) {
        console.log("Click en tbody", e.target);
        // busca la fila <tr> más cercana
        const tr = e.target.closest("tr");
        if (!tr) return;

        // Marca visualmente la fila seleccionada
        const previously = document.querySelector("#datos tr.selected-row");
        if (previously) previously.classList.remove("selected-row");
        tr.classList.add("selected-row");

        // Extrae nombre y código según la estructura de tu fila.
        // Ajusta los índices: supongamos columna 0 = nro, 1 = codigo, 2 = nombre (ejemplo)
        let codigo = "";
        let nombre = "";
        const cells = tr.querySelectorAll("td");
        if (cells.length >= 3) {
            codigo = cells[1].textContent.trim();
            nombre = cells[2].textContent.trim();
        } else {
            // si tu fila tiene otra estructura, intenta atributos data-*
            codigo = tr.getAttribute("data-codigo") || tr.dataset.codigo || "";
            nombre = tr.getAttribute("data-nombre") || tr.dataset.nombre || "";
        }

        // Primero intenta obtener conteos desde la propia fila (si hay columnas con datos)
        const local = getCountsFromRow(tr);
        if (local.total > 0) {
            renderAttendanceSidebar({
                nombre,
                codigo,
                counts: local.counts,
                total: local.total,
            });
            return;
        }

        // Si la tabla no tiene columnas con los datos, pide al servidor
        if (!codigo) {
            renderAttendanceSidebar({
                nombre: nombre || "Alumno",
                codigo: "N/A",
                counts: { 0: 0, 1: 0, 2: 0, 3: 0 },
                total: 0,
            });
            return;
        }

        fetchCountsFromServer(codigo)
            .then((resp) => {
                if (resp.status === "ok") {
                    renderAttendanceSidebar({
                        nombre: resp.nombre || nombre,
                        codigo,
                        counts: resp.counts || { 0: 0, 1: 0, 2: 0, 3: 0 },
                        total: resp.total || 0,
                    });
                } else {
                    // Si el servidor devolvió error (estructura distinta)
                    console.warn(
                        "Error servidor obtener asistencias:",
                        resp.message || resp
                    );
                    renderAttendanceSidebar({
                        nombre,
                        codigo,
                        counts: { 0: 0, 1: 0, 2: 0, 3: 0 },
                        total: 0,
                    });
                }
            })
            .catch((err) => {
                console.error("Error fetch asistencias:", err);
                renderAttendanceSidebar({
                    nombre,
                    codigo,
                    counts: { 0: 0, 1: 0, 2: 0, 3: 0 },
                    total: 0,
                });
            });
    });
}

// Setup tab system
function setupTabSystem() {
    tabButtons.forEach((button) => {
        button.addEventListener("click", function () {
            const tabName = this.getAttribute("data-tab");
            switchTab(tabName);
            listarAlumnos();
        });
    });
}

// Switch between tabs
function switchTab(tabName) {
    // Remove active class from all buttons and contents
    tabButtons.forEach((btn) => btn.classList.remove("active"));

    // Add active class to selected button and content
    document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");
}

function listarParciales() {
    tablaParcialesExistentes.style.display = "block";
    parcialesExistentesBody.innerHTML =
        '<tr><td colspan="3">Cargando...</td></tr>';

    fetch("php/listar_parciales.php")
        .then((response) => {
            console.log(
                "parciales_existentes.js: Respuesta recibida de listar_parciales.php:",
                response
            );
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            console.log("parciales_existentes.js: Datos recibidos:", data);
            parcialesExistentesBody.innerHTML = "";

            if (data.error) {
                console.log(
                    "parciales_existentes.js: Error en la respuesta:",
                    data.error
                );
                if (typeof Swal !== "undefined") {
                    Swal.fire({
                        icon: "warning",
                        title: "Error",
                        text: data.error,
                    });
                } else {
                    console.error(
                        "parciales_existentes.js: SweetAlert2 no está cargado"
                    );
                    alert("Error: " + data.error);
                }
                parcialesExistentesBody.innerHTML = `<tr><td colspan="3">Error: ${data.error}</td></tr>`;
                return;
            }

            if (!Array.isArray(data) || data.length === 0) {
                console.log(
                    "parciales_existentes.js: No hay registros para mostrar"
                );
                if (typeof Swal !== "undefined") {
                    Swal.fire({
                        icon: "info",
                        title: "Sin datos",
                        text: "No se encontraron parciales.",
                    });
                } else {
                    console.error(
                        "parciales_existentes.js: SweetAlert2 no está cargado"
                    );
                    alert("No se encontraron parciales.");
                }
                parcialesExistentesBody.innerHTML =
                    '<tr><td colspan="3">No hay datos disponibles</td></tr>';
                return;
            }
            listarAlumnos();
            data.forEach((item) => {
                console.log("parciales_existentes.js: Agregando fila:", item);
                const row = document.createElement("tr");
                row.innerHTML = `
            <td>${item.numero_parcial || "-"}</td>
            <td>${item.id_matcve || "-"}</td>
            <td>${item.periodo || "-"}</td>
          `;
                parcialesExistentesBody.appendChild(row);
            });
        })
        .catch((error) => {
            console.error(
                "parciales_existentes.js: Error fetching parciales:",
                error
            );
            if (typeof Swal !== "undefined") {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Error al cargar los parciales: " + error.message,
                });
            } else {
                console.error(
                    "parciales_existentes.js: SweetAlert2 no está cargado"
                );
                alert("Error al cargar los parciales: " + error.message);
            }
            parcialesExistentesBody.innerHTML = `<tr><td colspan="3">Error al cargar los datos: ${error.message}</td></tr>`;
        });
}
