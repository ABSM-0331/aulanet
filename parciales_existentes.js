console.log('parciales_existentes.js: Script iniciado');

document.addEventListener("DOMContentLoaded", () => {
  console.log('parciales_existentes.js: DOMContentLoaded disparado');

  const parcialesExistentesBtn = document.getElementById('parcialesExistentes');
  const tablaParcialesExistentes = document.getElementById('tablaParcialesExistentes');
  const parcialesExistentesBody = document.getElementById('parcialesExistentesBody');

  if (!parcialesExistentesBtn) {
    console.error('parciales_existentes.js: Error: Botón #parcialesExistentes no encontrado en el DOM');
    return;
  }
  console.log('parciales_existentes.js: Botón #parcialesExistentes encontrado');

  if (!tablaParcialesExistentes) {
    console.error('parciales_existentes.js: Error: Tabla #tablaParcialesExistentes no encontrada en el DOM');
    return;
  }
  console.log('parciales_existentes.js: Tabla #tablaParcialesExistentes encontrada');

  if (!parcialesExistentesBody) {
    console.error('parciales_existentes.js: Error: <tbody> #parcialesExistentesBody no encontrado en el DOM');
    return;
  }
  console.log('parciales_existentes.js: <tbody> #parcialesExistentesBody encontrado');

  parcialesExistentesBtn.addEventListener('click', () => {
    console.log('parciales_existentes.js: Botón Parciales Existentes clickeado');

    // Asegurar que la tabla sea visible
    tablaParcialesExistentes.style.display = 'block';
    parcialesExistentesBody.innerHTML = '<tr><td colspan="3">Cargando...</td></tr>';

    fetch('php/listar_parciales.php')
      .then(response => {
        console.log('parciales_existentes.js: Respuesta recibida de listar_parciales.php:', response);
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('parciales_existentes.js: Datos recibidos:', data);
        parcialesExistentesBody.innerHTML = '';

        if (data.error) {
          console.log('parciales_existentes.js: Error en la respuesta:', data.error);
          if (typeof Swal !== 'undefined') {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: data.error,
            });
          } else {
            console.error('parciales_existentes.js: SweetAlert2 no está cargado');
            alert('Error: ' + data.error);
          }
          parcialesExistentesBody.innerHTML = `<tr><td colspan="3">Error: ${data.error}</td></tr>`;
          return;
        }

        if (!Array.isArray(data) || data.length === 0) {
          console.log('parciales_existentes.js: No hay registros para mostrar');
          if (typeof Swal !== 'undefined') {
            Swal.fire({
              icon: 'info',
              title: 'Sin datos',
              text: 'No se encontraron parciales.',
            });
          } else {
            console.error('parciales_existentes.js: SweetAlert2 no está cargado');
            alert('No se encontraron parciales.');
          }
          parcialesExistentesBody.innerHTML = '<tr><td colspan="3">No hay datos disponibles</td></tr>';
          return;
        }

        data.forEach(item => {
          console.log('parciales_existentes.js: Agregando fila:', item);
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${item.numero_parcial || '-'}</td>
            <td>${item.id_matcve || '-'}</td>
            <td>${item.periodo || '-'}</td>
          `;
          parcialesExistentesBody.appendChild(row);
        });
      })
      .catch(error => {
        console.error('parciales_existentes.js: Error fetching parciales:', error);
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al cargar los parciales: ' + error.message,
          });
        } else {
          console.error('parciales_existentes.js: SweetAlert2 no está cargado');
          alert('Error al cargar los parciales: ' + error.message);
        }
        parcialesExistentesBody.innerHTML = `<tr><td colspan="3">Error al cargar los datos: ${error.message}</td></tr>`;
      });
  });
});