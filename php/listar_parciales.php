<?php
require_once 'DBC.php';

function listarParcialesExistentes()
{
    header('Content-Type: application/json');

    try {
        $db = DBC::get();
        // Consulta para obtener todos los registros de parciales
        $query = "SELECT numero_parcial, id_matcve, periodo 
                  FROM parciales;";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $respuesta = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (!empty($respuesta)) {
            echo json_encode($respuesta);
        } else {
            echo json_encode(["error" => "No se encontró ningún parcial aperturado."]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Error al realizar la consulta: " . $e->getMessage()]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => "Error inesperado: " . $e->getMessage()]);
    }
}

listarParcialesExistentes();
