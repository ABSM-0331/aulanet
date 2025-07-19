<?php
require_once 'DBC.php';
header('Content-Type: application/json');

try {
    $idtarea = $_POST['idtarea'] ?? null;
    $titulo = $_POST['titulo'] ?? null;
    $descripcion = $_POST['descripcion'] ?? null;
    $valor = $_POST['valor'] ?? null;

    if (!$idtarea || !$titulo || !$descripcion || !$valor) {
        echo json_encode(['status' => 'error', 'message' => 'Faltan datos.']);
        exit;
    }

    $db = DBC::get();
    $stmt = $db->prepare("UPDATE tareas SET titulo = :titulo, descripcion = :descripcion, valor = :valor WHERE idtarea = :idtarea");
    $stmt->execute([
        ':titulo' => $titulo,
        ':descripcion' => $descripcion,
        ':valor' => $valor,
        ':idtarea' => $idtarea
    ]);

    echo json_encode(['status' => 'ok', 'message' => 'Tarea modificada correctamente.']);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Error: ' . $e->getMessage()]);
}
