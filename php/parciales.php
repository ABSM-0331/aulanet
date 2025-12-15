<?php
require_once 'DBC.php';

function cargarParciales($idgru, $matcve_string) {
    header('Content-Type: application/json');
    try {
        if (empty($idgru) || empty($matcve_string)) {
            echo json_encode(["error" => "Parámetros idgru o matcve vacíos."]);
            return;
        }

        $db = DBC::get();

        // Primero: obtener el id_matcve real (entero) desde la clave string
        $stmtMat = $db->prepare("SELECT id_matcve FROM dmat WHERE matcve = :matcve LIMIT 1");
        $stmtMat->execute([':matcve' => $matcve_string]);
        $id_matcve = $stmtMat->fetchColumn();

        if (!$id_matcve) {
            echo json_encode(["error" => "No se encontró la materia con clave $matcve_string"]);
            return;
        }

        // Ahora buscar parciales con el id_matcve entero
        $query = "SELECT numero_parcial, fecha_apertura, fecha_cierre 
                  FROM parciales 
                  WHERE idgru = :idgru AND id_matcve = :id_matcve 
                  ORDER BY numero_parcial ASC";

        $stmt = $db->prepare($query);
        $stmt->bindParam(':idgru', $idgru, PDO::PARAM_INT);
        $stmt->bindParam(':id_matcve', $id_matcve, PDO::PARAM_INT);
        $stmt->execute();
        $respuesta = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (!empty($respuesta)) {
            echo json_encode($respuesta);
        } else {
            echo json_encode([]); // Vacío pero válido (no error)
        }
    } catch (PDOException $e) {
        echo json_encode(["error" => "Error al realizar la consulta: " . $e->getMessage()]);
    }
}

// Recibir parámetros: idgru (int) y matcve (string, la clave como ACF0903)
if (isset($_GET['idgru']) && isset($_GET['matcve'])) {
    cargarParciales($_GET['idgru'], $_GET['matcve']);
} else {
    echo json_encode(["error" => "Parámetros requeridos no proporcionados."]);
}