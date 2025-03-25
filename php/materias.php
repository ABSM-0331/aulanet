<?php
require_once 'DBC.php';

function cargarMaterias()
{
    header('Content-Type: application/json'); // Indicar que se devuelve JSON

    try {
        $db = DBC::get();

        // Consulta SQL
        $query = "SELECT DISTINCT
                    dgru.idgru,
                    dgru.matcve,
                    dgru.paqcve,
                    dmat.matnom 
                FROM dgru 
                JOIN dmat 
                ON dgru.matcve = dmat.matcve
                WHERE dgru.idmaestro = 137;";

        $resultados = $db->prepare($query);
        $resultados->execute();

        // Obtener resultados
        $respuesta = $resultados->fetchAll();

        // Verificar si hay registros
        if (!empty($respuesta)) {
            echo json_encode($respuesta);
        } else {
            echo json_encode(["error" => "No se encontraron registros."]);
        }
    } catch (PDOException $e) {
        // Devolver error en formato JSON
        echo json_encode(["error" => "Error al realizar la consulta: " . $e->getMessage()]);
    }
}

cargarMaterias();
