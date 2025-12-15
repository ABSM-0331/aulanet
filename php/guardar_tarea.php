<?php
require_once 'DBC.php';

header('Content-Type: application/json');

try {
    $titulo      = $_POST['titulo'] ?? null;
    $descripcion = $_POST['descripcion'] ?? null;
    $valor       = (float)($_POST['valor'] ?? 0);
    $criterio    = $_POST['criterio'] ?? null;
    $materia     = $_POST['materia'] ?? null;
    $grupo       = $_POST['grupo'] ?? null;
    $idgru       = $_POST['idgru'] ?? null;

    if (!isset($titulo, $descripcion, $valor, $criterio, $materia, $grupo, $idgru) ||
        trim($titulo) === '' || trim($descripcion) === '' || $valor <= 0 ||
        trim($criterio) === '' || trim($materia) === '' || trim($grupo) === '') {
        echo json_encode(['status' => 'error', 'message' => 'Faltan datos obligatorios o valores inválidos.']);
        exit;
    }

    $db = DBC::get();

    // Obtener id_matcve
    $stmtMat = $db->prepare("SELECT id_matcve FROM dmat WHERE matcve = :matcve LIMIT 1");
    $stmtMat->execute([':matcve' => $materia]);
    $id_matcve = $stmtMat->fetchColumn();
    if (!$id_matcve) throw new Exception('Materia no encontrada');

    // Obtener parcial actual y su límite para el criterio
    $stmtParcial = $db->prepare("
        SELECT idparcial, {$criterio} as limite 
        FROM parciales 
        WHERE id_matcve = :id_matcve AND idgru = :idgru 
        ORDER BY numero_parcial DESC LIMIT 1
    ");
    $stmtParcial->execute([':id_matcve' => $id_matcve, ':idgru' => $idgru]);
    $parcialData = $stmtParcial->fetch(PDO::FETCH_ASSOC);
    if (!$parcialData) throw new Exception('No existe parcial aperturado');

    $idparcial = $parcialData['idparcial'];
    $limite = (float)$parcialData['limite'];

    // Calcular suma actual de tareas en este criterio y parcial
    $stmtSuma = $db->prepare("
        SELECT SUM(t.valor) as suma_actual
        FROM tareas t
        INNER JOIN tpintermediaria tp ON t.idtarea = tp.idtarea
        WHERE tp.idparcial = :idparcial AND t.criterio = :criterio
    ");
    $stmtSuma->execute([':idparcial' => $idparcial, ':criterio' => $criterio]);
    $suma_actual = (float)$stmtSuma->fetchColumn() ?: 0;

    // Verificar si cabe la nueva tarea
    if ($suma_actual + $valor > $limite) {
        echo json_encode(['status' => 'error', 'message' => "No se puede agregar: excede el límite de {$limite} puntos para {$criterio} (actual: {$suma_actual}, nuevo: {$valor})"]);
        exit;
    }

    // Insertar tarea
    $stmt = $db->prepare("INSERT INTO tareas (titulo, descripcion, valor, materia, grupo, criterio) 
                          VALUES (:titulo, :descripcion, :valor, :materia, :grupo, :criterio)");
    $stmt->execute([
        ':titulo'      => $titulo,
        ':descripcion' => $descripcion,
        ':valor'       => $valor,
        ':materia'     => $materia,
        ':grupo'       => $grupo,
        ':criterio'    => $criterio
    ]);

    $idtarea = $db->lastInsertId();

    // Asociar a parcial
    $stmtLink = $db->prepare("INSERT INTO tpintermediaria (idparcial, idtarea) VALUES (:idparcial, :idtarea)");
    $stmtLink->execute([':idparcial' => $idparcial, ':idtarea' => $idtarea]);

    echo json_encode([
        'status'    => 'ok',
        'message'   => 'Tarea guardada y asociada al parcial actual.',
        'idtarea'   => $idtarea
    ]);

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Error: ' . $e->getMessage()]);
}