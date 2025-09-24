console.log('aperturar_parcial.js: Script iniciado');

document.addEventListener("DOMContentLoaded", () => {
  console.log('aperturar_parcial.js: DOMContentLoaded disparado');

  const formParcial = document.getElementById('form-parcial');
  if (!formParcial) {
    console.error('aperturar_parcial.js: Error: Formulario #form-parcial no encontrado en el DOM');
    return;
  }
  console.log('aperturar_parcial.js: Formulario #form-parcial encontrado');

  formParcial.addEventListener('submit', (event) => {
    event.preventDefault(); // Evitar el envío predeterminado del formulario
    console.log('aperturar_parcial.js: Formulario #form-parcial enviado');

    // Recopilar valores de los inputs
    const materiaId = document.getElementById('materia-id').value;
    const grupoId = document.getElementById('grupo-id').value;
    const claveId = document.getElementById('clave-id').value;
    const numeroParcial = document.getElementById('numero-parcial').value;
    const periodoId = document.getElementById('periodo-id').value;
    const saberPercent = parseFloat(document.getElementById('saber-percent').value) / 100; // Convertir a decimal
    const hacerPercent = parseFloat(document.getElementById('hacer-percent').value) / 100; // Convertir a decimal
    const serPercent = parseFloat(document.getElementById('ser-percent').value) / 100; // Convertir a decimal
    const totalPercent = parseFloat(document.getElementById('total-percent').value) / 100; // Convertir a decimal
    const restantePercent = parseFloat(document.getElementById('restante-percent').value) / 100; // Convertir a decimal
    const fechaApertura = document.getElementById('fecha-apertura').value;
    const fechaCierre = document.getElementById('fecha-cierre').value;

    console.log('aperturar_parcial.js: Datos recopilados:', {
      materiaId,
      grupoId,
      claveId,
      numeroParcial,
      periodoId,
      saberPercent,
      hacerPercent,
      serPercent,
      totalPercent,
      restantePercent,
      fechaApertura,
      fechaCierre
    });

    // Validar que los campos requeridos no estén vacíos
    if (!materiaId || !grupoId || !claveId || !numeroParcial || !periodoId || !fechaApertura || !fechaCierre) {
      console.error('aperturar_parcial.js: Error: Campos requeridos vacíos');
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Por favor, completa todos los campos requeridos.',
        });
      } else {
        console.error('aperturar_parcial.js: SweetAlert2 no está cargado');
        alert('Por favor, completa todos los campos requeridos.');
      }
      return;
    }

    // Enviar datos al servidor
    fetch('php/insertar_parcial.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id_matcve: materiaId,
        idgru: grupoId,
        numclave: claveId,
        numero_parcial: numeroParcial,
        periodo: periodoId,
        saber: saberPercent,
        hacer: hacerPercent,
        ser: serPercent,
        total: totalPercent,
        restante: restantePercent,
        fecha_apertura: fechaApertura,
        fecha_cierre: fechaCierre
      })
    })
      .then(response => {
        console.log('aperturar_parcial.js: Respuesta recibida de insertar_parcial.php:', response);
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('aperturar_parcial.js: Respuesta del servidor:', data);
        if (data.success) {
          if (typeof Swal !== 'undefined') {
            Swal.fire({
              icon: 'success',
              title: 'Éxito',
              text: 'Parcial aperturado correctamente.',
            });
          } else {
            alert('Parcial aperturado correctamente.');
          }
          // Limpiar el formulario
          formParcial.reset();
          // Restaurar valores predeterminados
          document.getElementById('saber-percent').value = '40';
          document.getElementById('hacer-percent').value = '50';
          document.getElementById('ser-percent').value = '10';
          document.getElementById('total-percent').value = '100';
          document.getElementById('restante-percent').value = '0';
          // Cerrar el modal
          const modal = document.getElementById('modal-parcial');
          modal.style.display = 'none';
        } else {
          console.error('aperturar_parcial.js: Error del servidor:', data.error);
          if (typeof Swal !== 'undefined') {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: data.error || 'Error al aperturar el parcial.',
            });
          } else {
            alert('Error: ' + (data.error || 'Error al aperturar el parcial.'));
          }
        }
      })
      .catch(error => {
        console.error('aperturar_parcial.js: Error fetching:', error);
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al conectar con el servidor: ' + error.message,
          });
        } else {
          alert('Error al conectar con el servidor: ' + error.message);
        }
      });
  });

  // Manejar el botón "Cancelar"
  const btnCancelar = document.getElementById('btn-cancelar');
  if (btnCancelar) {
    btnCancelar.addEventListener('click', () => {
      console.log('aperturar_parcial.js: Botón Cancelar clickeado');
      formParcial.reset();
      // Restaurar valores predeterminados
      document.getElementById('saber-percent').value = '40';
      document.getElementById('hacer-percent').value = '50';
      document.getElementById('ser-percent').value = '10';
      document.getElementById('total-percent').value = '100';
      document.getElementById('restante-percent').value = '0';
      // Cerrar el modal
      const modal = document.getElementById('modal-parcial');
      modal.style.display = 'none';
    });
  } else {
    console.error('aperturar_parcial.js: Error: Botón #btn-cancelar no encontrado');
  }

  // Manejar el botón de cerrar modal
  const closeModal = document.querySelector('#modal-parcial .close-modal');
  if (closeModal) {
    closeModal.addEventListener('click', () => {
      console.log('aperturar_parcial.js: Botón cerrar modal clickeado');
      formParcial.reset();
      // Restaurar valores predeterminados
      document.getElementById('saber-percent').value = '40';
      document.getElementById('hacer-percent').value = '50';
      document.getElementById('ser-percent').value = '10';
      document.getElementById('total-percent').value = '100';
      document.getElementById('restante-percent').value = '0';
      // Cerrar el modal
      const modal = document.getElementById('modal-parcial');
      modal.style.display = 'none';
    });
  } else {
    console.error('aperturar_parcial.js: Error: Botón .close-modal no encontrado');
  }
});