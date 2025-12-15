<?php
require_once 'DBC.php';

header('Content-Type: application/json');

try {
    $materia  = $_GET['materia'] ?? null;
    $grupo    = $_GET['grupo'] ?? null;
    $criterio = $_GET['criterio'] ?? null;

    if (!$materia || !$grupo || !$criterio) {
        echo json_encode(['status' => 'error', 'message' => 'Faltan parámetros']);
        exit;
    }

    $db = DBC::get();

    // Obtener id_matcve real
    $stmtMat = $db->prepare("SELECT id_matcve FROM dmat WHERE matcve = :matcve LIMIT 1");
    $stmtMat->execute([':matcve' => $materia]);
    $id_matcve = $stmtMat->fetchColumn();
    if (!$id_matcve) throw new Exception('Materia no encontrada');

    // Obtener idgru real
    $stmtGru = $db->prepare("SELECT idgru FROM dgru WHERE matcve = :matcve AND paqcve = :paqcve LIMIT 1");
    $stmtGru->execute([':matcve' => $materia, ':paqcve' => $grupo]);
    $idgru = $stmtGru->fetchColumn();
    if (!$idgru) throw new Exception('Grupo no encontrado');

    // Obtener idparcial actual
    $stmtParcial = $db->prepare("SELECT idparcial, ser, hacer, saber FROM parciales WHERE id_matcve = :id_matcve AND idgru = :idgru ORDER BY numero_parcial DESC LIMIT 1");
    $stmtParcial->execute([':id_matcve' => $id_matcve, ':idgru' => $idgru]);
    $parcialData = $stmtParcial->fetch(PDO::FETCH_ASSOC);
    if (!$parcialData) {
        echo json_encode(['status' => 'ok', 'tareas' => [], 'limits' => ['hacer' => 0, 'saber' => 0, 'ser' => 0], 'sumas' => ['hacer' => 0, 'saber' => 0, 'ser' => 0]]);
        exit;
    }

    $idparcial = $parcialData['idparcial'];
    $limits = [
        'hacer' => (float)$parcialData['hacer'],
        'saber' => (float)$parcialData['saber'],
        'ser'   => (float)$parcialData['ser']
    ];

    // Obtener tareas del parcial actual y criterio
    $stmtTareas = $db->prepare("
        SELECT t.idtarea, t.titulo, t.descripcion, t.valor
        FROM tareas t
        INNER JOIN tpintermediaria tp ON t.idtarea = tp.idtarea
        WHERE tp.idparcial = :idparcial AND t.criterio = :criterio
    ");
    $stmtTareas->execute([':idparcial' => $idparcial, ':criterio' => $criterio]);
    $tareas = $stmtTareas->fetchAll(PDO::FETCH_ASSOC);

    // Calcular sumas actuales por criterio (para mostrar en UI)
    $sumas = ['hacer' => 0, 'saber' => 0, 'ser' => 0];
    foreach (['hacer', 'saber', 'ser'] as $crit) {
        $stmtSuma = $db->prepare("
            SELECT SUM(t.valor) as suma
            FROM tareas t
            INNER JOIN tpintermediaria tp ON t.idtarea = tp.idtarea
            WHERE tp.idparcial = :idparcial AND t.criterio = :crit
        ");
        $stmtSuma->execute([':idparcial' => $idparcial, ':crit' => $crit]);
        $sumas[$crit] = (float)$stmtSuma->fetchColumn() ?: 0;
    }

    echo json_encode([
        'status' => 'ok',
        'tareas' => $tareas,
        'limits' => $limits,
        'sumas'  => $sumas
    ]);

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}