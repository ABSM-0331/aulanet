<?php 
require_once 'DBC.php'; // Asegúrate de que esta ruta esté correcta

header('Content-Type: application/json');

try {
    // Obtener datos enviados vía POST
    $titulo = $_POST['titulo'] ?? null;
    $descripcion = $_POST['descripcion'] ?? null;
    $valor = $_POST['valor'] ?? null;

    // 🪵 Log para depuración: guarda en archivo lo recibido
    file_put_contents("debug_guardar.txt", json_encode($_POST, JSON_PRETTY_PRINT));

    // Validación más estricta
    if (!isset($titulo, $descripcion, $valor) || trim($titulo) === '' || trim($descripcion) === '' || trim($valor) === '') {
        echo json_encode(['status' => 'error', 'message' => 'Faltan datos obligatorios o están vacíos.']);
        exit;
    }

    // Por ahora, materia vacía
    $materia = "";

    // Conectar a la base de datos
    $db = DBC::get();

    // Preparar e insertar la tarea
    $stmt = $db->prepare("INSERT INTO tareas (titulo, descripcion, valor, materia) 
                          VALUES (:titulo, :descripcion, :valor, :materia)");
    $stmt->execute([
        ':titulo' => $titulo,
        ':descripcion' => $descripcion,
        ':valor' => $valor,
        ':materia' => $materia
    ]);

    echo json_encode(['status' => 'ok', 'message' => 'Tarea guardada exitosamente.']);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Error al guardar la tarea: ' . $e->getMessage()]);
}