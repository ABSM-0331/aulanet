<?php
require_once 'DBC.php';

function insertarParcial() {
    header('Content-Type: application/json');

    try {
        // Leer datos JSON del cuerpo de la solicitud
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);

        if (!$data) {
            http_response_code(400);
            echo json_encode(['error' => 'Datos JSON inválidos']);
            return;
        }

        // Extraer y validar datos
        $id_matcve = isset($data['id_matcve']) ? (int)$data['id_matcve'] : null;
        $idgru = isset($data['idgru']) ? (int)$data['idgru'] : null;
        $numclave = isset($data['numclave']) ? (int)$data['numclave'] : null;
        $numero_parcial = isset($data['numero_parcial']) ? (string)$data['numero_parcial'] : null;
        $periodo = isset($data['periodo']) ? (string)$data['periodo'] : null;
        $saber = isset($data['saber']) ? (float)$data['saber'] : null;
        $hacer = isset($data['hacer']) ? (float)$data['hacer'] : null;
        $ser = isset($data['ser']) ? (float)$data['ser'] : null;
        $total = isset($data['total']) ? (float)$data['total'] : null;
        $restante = isset($data['restante']) ? (float)$data['restante'] : null;
        $fecha_apertura = isset($data['fecha_apertura']) ? (string)$data['fecha_apertura'] : null;
        $fecha_cierre = isset($data['fecha_cierre']) ? (string)$data['fecha_cierre'] : null;

        // Validar campos requeridos
        if (!$id_matcve || !$idgru || !$numclave || !$numero_parcial || !$periodo || 
            $saber === null || $hacer === null || $ser === null || 
            $total === null || $restante === null || !$fecha_apertura || !$fecha_cierre) {
            http_response_code(400);
            echo json_encode(['error' => 'Faltan campos requeridos']);
            return;
        }

        // Validar que las fechas sean válidas
        if (!DateTime::createFromFormat('Y-m-d', $fecha_apertura) || 
            !DateTime::createFromFormat('Y-m-d', $fecha_cierre)) {
            http_response_code(400);
            echo json_encode(['error' => 'Fechas inválidas']);
            return;
        }

        // Validar que la suma de porcentajes sea 100%
        if (abs(($saber + $hacer + $ser) - 1.00) > 0.01) { // Tolerancia de 0.01
            http_response_code(400);
            echo json_encode(['error' => 'La suma de saber, hacer y ser debe ser 100%']);
            return;
        }

        $db = DBC::get();
        $query = "INSERT INTO parciales (
            numero_parcial, id_matcve, idgru, numclave, periodo, 
            saber, hacer, ser, total, restante, 
            fecha_apertura, fecha_cierre
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $db->prepare($query);
        $stmt->execute([
            $numero_parcial,
            $id_matcve,
            $idgru,
            $numclave,
            $periodo,
            $saber,
            $hacer,
            $ser,
            $total,
            $restante,
            $fecha_apertura,
            $fecha_cierre
        ]);

        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al insertar en la base de datos: ' . $e->getMessage()]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error inesperado: ' . $e->getMessage()]);
    }
}

insertarParcial();
?>