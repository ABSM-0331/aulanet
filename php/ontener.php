<?php
require_once 'DBC.php';

function cargarListas()
{
    header('Content-Type: application/json'); // Indicar que se devuelve JSON

    // Aquí recibirías los valores que se van a buscar, probablemente por GET o POST
    // Por ejemplo:
    $asignatura = $_GET['asignatura'] ?? null;
    $parcial = $_GET['parcial'] ?? null;

    if ($asignatura === null || $parcial === null) {
        echo json_encode(["error" => "Faltan parámetros: asignatura o parcial"]);
        return;
    }

    try {
        $db = DBC::get();

        // Consulta SQL con condiciones
        $query = "SELECT codigo_lista,codigo_alumno,fecha

                  FROM control_listas 
                  WHERE asignatura = :asignatura 
                  AND parcial = :parcial";

        $resultados = $db->prepare($query);
        $resultados->bindParam(':asignatura', $asignatura);
        $resultados->bindParam(':parcial', $parcial);
        $resultados->execute();

        $respuesta = $resultados->fetchAll();

        if (!empty($respuesta)) {
            echo json_encode($respuesta);
        } else {
            echo json_encode(["error" => "No se encontraron registros."]);
        }
    } catch (PDOException $e) {
        echo json_encode(["error" => "Error al realizar la consulta: " . $e->getMessage()]);
    }
}

cargarListas();
?>
