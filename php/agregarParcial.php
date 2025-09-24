<?php
require_once 'DBC.php';

header('Content-Type: application/json');

try {
    $db = DBC::get();
    $materia = $_POST['materia'];
    $grupo = $_POST['grupo'];

    // // Obtener el ID de la materia
    // $queryMateria = "SELECT id FROM dmat WHERE matnom = :materia LIMIT 1";
    // $stmtMateria = $db->prepare($queryMateria);
    // $stmtMateria->execute([':materia' => $materia]);
    // $materiaId = $stmtMateria->fetchColumn(); // Obtiene el valor del ID de la materia

    // if (!$materiaId) {
    //     throw new Exception("No se encontró la materia con el nombre proporcionado.");
    // }

    // // Obtener el ID del grupo
    // $queryGrupo = "SELECT id FROM dgru WHERE paqcve = :grupo AND matcve = :materia LIMIT 1";
    // $stmtGrupo = $db->prepare($queryGrupo);
    // $stmtGrupo->execute([':grupo' => $grupo, ':materia' => $materiaId]);
    // $grupoId = $stmtGrupo->fetchColumn(); // Obtiene el valor del ID del grupo

    // if (!$grupoId) {
    //     throw new Exception("No se encontró el grupo con el nombre proporcionado.");
    // }

    // Get POST data
    $data = [
        'numero_parcial' => $_POST['numero_parcial'],
        'id_matcve' => 1, // Usamos el ID de la materia obtenido
        'idgru' => 1, // Usamos el ID del grupo obtenido
        'numclave' => $_POST['clave'],
        'periodo' => $_POST['periodo'],
        'ser' => $_POST['ser'],
        'hacer' => $_POST['hacer'],
        'saber' => $_POST['saber'],
        'total' => $_POST['total'],
        'restante' => $_POST['restante'],
        'fecha_apertura' => $_POST['fecha_apertura'],
        'fecha_cierre' => $_POST['fecha_cierre']
    ];

    $query = "INSERT INTO parciales (
        numero_parcial, id_matcve, idgru, numclave, 
        periodo, ser, hacer, saber, total, restante,
        fecha_apertura, fecha_cierre
    ) VALUES (
        :numero_parcial, :id_matcve, :idgru, :numclave,
        :periodo, :ser, :hacer, :saber, :total, :restante,
        :fecha_apertura, :fecha_cierre
    )";

    $stmt = $db->prepare($query);
    $stmt->execute($data);
    http_response_code(200);
    echo json_encode([
        "respuesta" => true
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "respuesta" => false,
        "message" => "Error al agregar el parcial: " . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "respuesta" => false,
        "message" => $e->getMessage()
    ]);
}
