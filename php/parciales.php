<?php
require_once 'DBC.php';

function cargarParciales($idgru, $matcve) {
    header('Content-Type: application/json');
    try {
        if (empty($idgru) || empty($matcve)) {
            echo json_encode(["error" => "Parámetros idgru o matcve vacíos."]);
            return;
        }

        $db = DBC::get();
        // Consulta para comparar parciales.idgru y parciales.matcve (coincidiendo con dgru.idgru y dmat.id_matcve)
        $query = "SELECT numero_parcial, fecha_apertura 
                  FROM parciales 
                  WHERE idgru = :idgru AND matcve = :matcve;";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':idgru', $idgru);
        $stmt->bindParam(':matcve', $matcve);
        $stmt->execute();
        $respuesta = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (!empty($respuesta)) {
            echo json_encode($respuesta);
        } else {
            echo json_encode(["error" => "No se encontraron registros para idgru: $idgru, matcve: $matcve."]);
        }
    } catch (PDOException $e) {
        echo json_encode(["error" => "Error al realizar la consulta: " . $e->getMessage()]);
    }
}

if (isset($_GET['idgru']) && isset($_GET['matcve'])) {
    cargarParciales($_GET['idgru'], $_GET['matcve']);
} else {
    header('Content-Type: application/json');
    echo json_encode(["error" => "Parámetros requeridos no proporcionados."]);
}