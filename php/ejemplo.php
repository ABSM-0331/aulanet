<?php
// Incluye el archivo de conexión
require_once 'DBC.php';

// Realiza la consulta
try {
    // Obtén la instancia de la conexión
    $db = DBC::get();

    $materia = isset($_GET['materia']) ? $_GET['materia'] : '';
    $grupo = isset($_GET['grupo']) ? $_GET['grupo'] : '';
    // Prepara y ejecuta el SELECT
    $query = "SELECT 
                ROW_NUMBER() OVER (ORDER BY dalu.aluapp ASC) AS num_lista, 
                dalu.aluctr, 
                dalu.alunom, 
                dalu.aluapp, 
                dalu.aluapm 
            FROM dlis JOIN dgru ON dlis.gpocve = dgru.gpocve 
            JOIN dalu ON dlis.aluctr = dalu.aluctr 
            AND dlis.matcve = dgru.matcve 
            WHERE dlis.matcve = ? 
            AND dgru.paqcve = ? 
            AND dlis.idmaestro = 137;";
    $stmt = $db->prepare($query);
    $stmt->bindParam(1, $materia);
    $stmt->bindParam(2, $grupo);
    $stmt->execute();

    // Obtén los resultados
    $resultados = $stmt->fetchAll();

    // Verifica si hay registros
    if (count($resultados) > 0) {

        foreach ($resultados as $alumno) {
            echo "<tr class='fila-alumno'>
            <td>" . $alumno['num_lista'] . "</td>
            <td>" . $alumno['aluctr'] . "</td>
            <td class='gray-cell'>" . $alumno['aluapp'] . " " . $alumno['aluapm'] . " " . $alumno['alunom'] . "</td>
            </tr>";
        }
    } else {
        echo "No se encontraron registros.";
    }
} catch (PDOException $e) {
    echo "Error al realizar la consulta: " . $e->getMessage();
}
