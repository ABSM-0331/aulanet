<?php
require_once 'DBC.php';

header('Content-Type: application/json');

try {
    $db = DBC::get();

    // Log para depuración (ver en error.log del servidor)
    error_log("POST recibido en agregarParcial.php: " . print_r($_POST, true));

    // Campos requeridos
    $required = ['numero_parcial', 'clave', 'idgru', 'periodo', 'ser', 'hacer', 'saber', 'total', 'restante', 'fecha_apertura', 'fecha_cierre'];
    foreach ($required as $field) {
        if (!isset($_POST[$field]) || trim($_POST[$field]) === '') {
            throw new Exception("Falta el campo: $field");
        }
    }

    // 1. Obtener el id_matcve REAL (entero) a partir de la clave string (matcve)
    $stmtMat = $db->prepare("SELECT id_matcve FROM dmat WHERE matcve = :matcve LIMIT 1");
    $stmtMat->execute([':matcve' => trim($_POST['clave'])]);
    $id_matcve_real = $stmtMat->fetchColumn();

    if (!$id_matcve_real) {
        throw new Exception("No se encontró la materia con clave '{$_POST['clave']}' en la tabla dmat");
    }

    error_log("Materia encontrada: clave {$_POST['clave']} → id_matcve = $id_matcve_real");
    error_log("idgru recibido: {$_POST['idgru']}");

    // 2. Preparar datos correctos para INSERT
    $data = [
        'numero_parcial' => (string)$_POST['numero_parcial'],  // varchar
        'id_matcve'      => (int)$id_matcve_real,              // ¡¡AHORA SÍ ES EL ID ENTERO!!
        'idgru'          => (int)$_POST['idgru'],              // ID del grupo (correcto desde JS)
        'numclave'       => 0,                                 // Como en tu ejemplo
        'periodo'        => $_POST['periodo'],
        'ser'            => (float)$_POST['ser'],
        'hacer'          => (float)$_POST['hacer'],
        'saber'          => (float)$_POST['saber'],
        'total'          => (float)$_POST['total'],
        'restante'       => (float)$_POST['restante'],
        'fecha_apertura' => $_POST['fecha_apertura'],
        'fecha_cierre'   => $_POST['fecha_cierre']
    ];

    error_log("Datos finales para INSERT: " . print_r($data, true));

    // 3. Ejecutar INSERT
    $query = "INSERT INTO parciales (
        numero_parcial, id_matcve, idgru, numclave, periodo,
        ser, hacer, saber, total, restante,
        fecha_apertura, fecha_cierre
    ) VALUES (
        :numero_parcial, :id_matcve, :idgru, :numclave, :periodo,
        :ser, :hacer, :saber, :total, :restante,
        :fecha_apertura, :fecha_cierre
    )";

    $stmt = $db->prepare($query);
    $resultado = $stmt->execute($data);

    if ($resultado) {
        $id_insertado = $db->lastInsertId();
        error_log("¡Parcial insertado exitosamente! idparcial = $id_insertado");
        echo json_encode([
            "respuesta" => true,
            "message"   => "Parcial aperturado correctamente",
            "idparcial" => $id_insertado
        ]);
    } else {
        $errorInfo = $stmt->errorInfo();
        error_log("Error al ejecutar INSERT: " . print_r($errorInfo, true));
        throw new Exception("Falló el INSERT: " . $errorInfo[2]);
    }

} catch (Exception $e) {
    error_log("Error en agregarParcial.php: " . $e->getMessage());
    echo json_encode([
        "respuesta" => false,
        "message"   => $e->getMessage()
    ]);
}