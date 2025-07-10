<?php
require_once 'DBC.php'; // Asegúrate de que esta ruta esté correcta

header('Content-Type: application/json');

try {
    // Obtener datos enviados vía POST
    $titulo = $_POST['titulo'] ?? null;
    $descripcion = $_POST['descripcion'] ?? null;
    $valor = $_POST['valor'] ?? null;
    $materia = $_POST['materia'] ?? null;
    $grupo = $_POST['grupo'] ?? null;

    // Validación estricta
    if (!isset($titulo, $descripcion, $valor, $materia, $grupo) || 
        trim($titulo) === '' || trim($descripcion) === '' || 
        trim($valor) === '' || trim($materia) === '' || trim($grupo) === '') {
        echo json_encode(['status' => 'error', 'message' => 'Faltan datos obligatorios o están vacíos.']);
        exit;
    }

    // Conectar a la base de datos
    $db = DBC::get();

    // Preparar e insertar la tarea con grupo incluido
    $stmt = $db->prepare("INSERT INTO tareas (titulo, descripcion, valor, materia, grupo) 
                          VALUES (:titulo, :descripcion, :valor, :materia, :grupo)");
    $stmt->execute([
        ':titulo' => $titulo,
        ':descripcion' => $descripcion,
        ':valor' => $valor,
        ':materia' => $materia,
        ':grupo' => $grupo
    ]);

    echo json_encode(['status' => 'ok', 'message' => 'Tarea guardada exitosamente.']);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Error al guardar la tarea: ' . $e->getMessage()]);
}
