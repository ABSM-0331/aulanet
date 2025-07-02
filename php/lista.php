<?php
require_once 'DBC.php';

function guardar_lista()
{
    header('Content-Type: application/json');

    try {
        $db = DBC::get();

        // Obtener valores del cuerpo de la solicitud POST
        $asignatura = $_POST['asignatura'] ?? null;
        $codigo_alumno = $_POST['codigo_alumno'] ?? null;
        $codigo_lista = $_POST['codigo_lista'] ?? null;
        $parcial = $_POST['parcial'] ?? null;
        // Validar que se hayan recibido todos los datos necesarios
        if ($asignatura === null || $codigo_alumno === null || $codigo_lista === null || $parcial === null) {
            echo json_encode(["error" => "Faltan datos requeridos."]);
            return;
        }

        // Usar la fecha actual
        $fecha_actual = Date('Y-m-d H:i:s');

        // Insertar en la base de datos
        $query = "INSERT INTO control_listas (fecha, asignatura, codigo_alumno, codigo_lista, parcial)
                  VALUES (:fecha, :asignatura, :codigo_alumno, :codigo_lista, :parcial)";

        $stmt = $db->prepare($query);
        $stmt->execute([
            ':fecha' => $fecha_actual,
            ':asignatura' => $asignatura,
            ':codigo_alumno' => $codigo_alumno,
            ':codigo_lista' => $codigo_lista,
            ':parcial' => $parcial
        ]);

        echo json_encode(["success" => "Registro guardado correctamente."]);
    } catch (PDOException $e) {
        echo json_encode(["error" => "Error al guardar: " . $e->getMessage()]);
    }
}

guardar_lista();
