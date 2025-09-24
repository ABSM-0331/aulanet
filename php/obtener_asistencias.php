<?php
require_once 'DBC.php';

function obtenerAsistencias()
{
    header('Content-Type: application/json; charset=utf-8');

    $asignatura = $_GET['asignatura'] ?? null;
    $parcial     = $_GET['parcial'] ?? null;
    $codigo      = $_GET['codigo'] ?? null; // opcional: si se provee, devolvemos solo ese alumno

    if ($asignatura === null || $parcial === null) {
        echo json_encode(["status" => "error", "message" => "Faltan parámetros: asignatura o parcial"]);
        return;
    }

    try {
        $db = DBC::get();

        if ($codigo !== null && trim($codigo) !== '') {
            // Devuelve conteo por tipo (0/1/2/3) para un alumno específico
            $sql = "SELECT 
                        SUM(CASE WHEN codigo_lista = 1 THEN 1 ELSE 0 END) AS asistencias,
                        SUM(CASE WHEN codigo_lista = 0 THEN 1 ELSE 0 END) AS faltas,
                        SUM(CASE WHEN codigo_lista = 2 THEN 1 ELSE 0 END) AS retrasos,
                        SUM(CASE WHEN codigo_lista = 3 THEN 1 ELSE 0 END) AS justificaciones,
                        COUNT(*) AS total_registros
                    FROM control_listas
                    WHERE asignatura = :asignatura
                      AND parcial = :parcial
                      AND codigo_alumno = :codigo";
            $stmt = $db->prepare($sql);
            $stmt->execute([
                ':asignatura' => $asignatura,
                ':parcial'    => $parcial,
                ':codigo'     => $codigo
            ]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            // Normalizar respuesta (si null, devolver 0)
            $row = array_map(function ($v) {
                return $v === null ? 0 : (int)$v;
            }, $row ?: []);

            echo json_encode([
                'status' => 'ok',
                'codigo' => $codigo,
                'counts' => $row
            ]);
            return;
        }

        // Si no hay código: devolver resumen por alumno (lista)
        $sql2 = "SELECT 
                    codigo_alumno,
                    SUM(CASE WHEN codigo_lista = 1 THEN 1 ELSE 0 END) AS asistencias,
                    SUM(CASE WHEN codigo_lista = 0 THEN 1 ELSE 0 END) AS faltas,
                    SUM(CASE WHEN codigo_lista = 2 THEN 1 ELSE 0 END) AS retrasos,
                    SUM(CASE WHEN codigo_lista = 3 THEN 1 ELSE 0 END) AS justificaciones,
                    COUNT(*) AS total_registros
                 FROM control_listas
                 WHERE asignatura = :asignatura
                   AND parcial = :parcial
                 GROUP BY codigo_alumno
                 ORDER BY codigo_alumno ASC";
        $stmt2 = $db->prepare($sql2);
        $stmt2->execute([
            ':asignatura' => $asignatura,
            ':parcial'    => $parcial
        ]);
        $rows = $stmt2->fetchAll(PDO::FETCH_ASSOC);

        // Convertir a enteros y normalizar
        foreach ($rows as &$r) {
            $r['asistencias']     = isset($r['asistencias']) ? (int)$r['asistencias'] : 0;
            $r['faltas']          = isset($r['faltas']) ? (int)$r['faltas'] : 0;
            $r['retrasos']        = isset($r['retrasos']) ? (int)$r['retrasos'] : 0;
            $r['justificaciones'] = isset($r['justificaciones']) ? (int)$r['justificaciones'] : 0;
            $r['total_registros'] = isset($r['total_registros']) ? (int)$r['total_registros'] : 0;
        }
        unset($r);

        echo json_encode([
            'status' => 'ok',
            'asignatura' => $asignatura,
            'parcial' => $parcial,
            'alumnos' => $rows
        ]);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}

obtenerAsistencias();
