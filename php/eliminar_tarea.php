<?php
require_once 'DBC.php';
header('Content-Type: application/json');

try {
    $idtarea = $_POST['idtarea'] ?? null;

    if (!$idtarea) {
        echo json_encode(['status' => 'error', 'message' => 'Falta el id de la tarea.']);
        exit;
    }

    $db = DBC::get();
    $stmt = $db->prepare("DELETE FROM tareas WHERE idtarea = :idtarea");
    $stmt->execute([':idtarea' => $idtarea]);

    echo json_encode(['status' => 'ok', 'message' => 'Tarea eliminada correctamente.']);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Error: ' . $e->getMessage()]);
}
