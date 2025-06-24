<?php
require_once 'DBC.php';
function cargarListas()
{
    header('Content-Type: application/json');

    $asignatura = $_GET['asignatura'] ?? null;
    $parcial = $_GET['parcial'] ?? null;

    if ($asignatura === null || $parcial === null) {
        echo json_encode(["Error" => "Faltan parámetros: asignatura o parcial"]);
        return;
    }
    try {
        $db = DBC::get();

        $query = "SELECT codigo_lista, codigo_alumno, fecha
                    FROM control_listas
                    WHERE asignatura = :asignatura
                    AND parcial = :parcial";

        $resultados = $db->prepare($query);
        $resultados->bindParam(':asignatura', $asignatura);
        $resultados->bindParam(':parcial', $parcial);
        $resultados->execute();
        $respuesta = $resultados->fetchAll();

        if (!empty($respuesta)) {
            echo json_encode(($respuesta));
        } else {
            echo json_encode(["Error" => "No se encontraron registros."]);
        }
    } catch (PDOException $e) {
        echo json_encode(["Error" => "Error al realizar la consulta: " . $e->getMessage()]);
    }
}
cargarListas();
