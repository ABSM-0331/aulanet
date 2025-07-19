<?php
require_once 'DBC.php';

header('Content-Type: application/json');

try {
    $materia = $_GET['materia'] ?? null;
    $grupo = $_GET['grupo'] ?? null;

    if (!$materia || !$grupo) {
        echo json_encode(['status' => 'error', 'message' => 'Faltan parámetros']);
        exit;
    }

    $db = DBC::get();
    $stmt = $db->prepare("SELECT idtarea, titulo, descripcion, valor FROM tareas WHERE materia = :materia AND grupo = :grupo");
    $stmt->execute([
        ':materia' => $materia,
        ':grupo' => $grupo
    ]);

    $tareas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['status' => 'ok', 'tareas' => $tareas]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
