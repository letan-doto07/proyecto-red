<?php
session_start();
header("Content-Type: application/json; charset=utf-8");

function responder($datos, $estado = 200)
{
    http_response_code($estado);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}

$usuarioId = (int) ($_SESSION["usuario_id"] ?? 0);
$modo = $_GET["modo"] ?? "mis";

if ($_SERVER["REQUEST_METHOD"] === "GET" && $usuarioId === 0 && $modo !== "all") {
    responder([]);
}

if ($_SERVER["REQUEST_METHOD"] !== "GET" && $usuarioId === 0) {
    responder(["error" => "Inicia sesión para guardar tus dibujos."], 401);
}

try {
    $conexion = new mysqli("localhost", "root", "", "drawery");
    $conexion->set_charset("utf8mb4");

    if ($_SERVER["REQUEST_METHOD"] === "GET") {
        if ($modo === "all") {
            $consulta = $conexion->prepare(
                "SELECT d.id, d.nombre, d.imagen, u.usuario,
                        COALESCE(AVG(v1.estrellas), 0) AS valoracion,
                        COALESCE(MAX(CASE WHEN v2.usuario_id = ? THEN v2.estrellas END), 0) AS mi_valoracion
                FROM dibujos d
                INNER JOIN usuarios u ON u.id = d.usuario_id
                LEFT JOIN valoraciones v1 ON v1.dibujo_id = d.id
                LEFT JOIN valoraciones v2 ON v2.dibujo_id = d.id AND v2.usuario_id = ?
                WHERE d.usuario_id != ?
                GROUP BY d.id, d.nombre, d.imagen, u.usuario
                ORDER BY d.fecha_creacion DESC, d.id DESC"
            );
            $consulta->bind_param("iii", $usuarioId, $usuarioId, $usuarioId);
        } else {
            $consulta = $conexion->prepare(
                "SELECT d.id, d.nombre, d.imagen,
                        COALESCE(AVG(v1.estrellas), 0) AS valoracion,
                        COALESCE(MAX(CASE WHEN v2.usuario_id = ? THEN v2.estrellas END), 0) AS mi_valoracion
                FROM dibujos d
                LEFT JOIN valoraciones v1 ON v1.dibujo_id = d.id
                LEFT JOIN valoraciones v2 ON v2.dibujo_id = d.id AND v2.usuario_id = ?
                WHERE d.usuario_id = ?
                GROUP BY d.id, d.nombre, d.imagen
                ORDER BY d.fecha_creacion DESC, d.id DESC"
            );
            $consulta->bind_param("iii", $usuarioId, $usuarioId, $usuarioId);
        }

        $consulta->execute();
        $dibujos = $consulta->get_result()->fetch_all(MYSQLI_ASSOC);
        responder($dibujos);
    }

    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        responder(["error" => "Método no permitido."], 405);
    }

    $datos = json_decode(file_get_contents("php://input"), true);
    if (!is_array($datos)) {
        responder(["error" => "La solicitud no es válida."], 400);
    }

    $accion = $datos["accion"] ?? "";

    if ($accion === "crear" || $accion === "editar") {
        $nombre = trim($datos["nombre"] ?? "");
        $imagen = $datos["imagen"] ?? "";

        if ($nombre === "" || mb_strlen($nombre) > 100) {
            responder(["error" => "El nombre debe tener entre 1 y 100 caracteres."], 400);
        }

        if (!is_string($imagen) || !str_starts_with($imagen, "data:image/png;base64,")) {
            responder(["error" => "La imagen del dibujo no es válida."], 400);
        }

        if ($accion === "crear") {
            $consulta = $conexion->prepare(
                "INSERT INTO dibujos (usuario_id, nombre, imagen) VALUES (?, ?, ?)"
            );
            $consulta->bind_param("iss", $usuarioId, $nombre, $imagen);
        } else {
            $dibujoId = (int) ($datos["id"] ?? 0);
            $consulta = $conexion->prepare(
                "UPDATE dibujos SET nombre = ?, imagen = ? WHERE id = ? AND usuario_id = ?"
            );
            $consulta->bind_param("ssii", $nombre, $imagen, $dibujoId, $usuarioId);
        }

        $consulta->execute();
        responder(["ok" => true]);
    }

    if ($accion === "valorar") {
        $dibujoId = (int) ($datos["id"] ?? 0);
        $estrellas = (int) ($datos["estrellas"] ?? 0);

        if ($estrellas < 1 || $estrellas > 5) {
            responder(["error" => "La valoración debe ser de 1 a 5 estrellas."], 400);
        }

        $verificar = $conexion->prepare(
            "SELECT id FROM dibujos WHERE id = ?"
        );
        $verificar->bind_param("i", $dibujoId);
        $verificar->execute();

        if ($verificar->get_result()->num_rows === 0) {
            responder(["error" => "No se encontró ese dibujo."], 404);
        }

        $consulta = $conexion->prepare(
            "INSERT INTO valoraciones (dibujo_id, usuario_id, estrellas)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE estrellas = VALUES(estrellas)"
        );
        $consulta->bind_param("iii", $dibujoId, $usuarioId, $estrellas);
        $consulta->execute();

        responder(["ok" => true]);
    }

    if ($accion === "eliminar") {
        $dibujoId = (int) ($datos["id"] ?? 0);
        $consulta = $conexion->prepare(
            "DELETE FROM dibujos WHERE id = ? AND usuario_id = ?"
        );
        $consulta->bind_param("ii", $dibujoId, $usuarioId);
        $consulta->execute();

        if ($consulta->affected_rows === 0) {
            responder(["error" => "No se encontró ese dibujo."], 404);
        }

        responder(["ok" => true]);
    }

    responder(["error" => "Acción no reconocida."], 400);
} catch (Throwable $error) {
    responder(["error" => "No se pudo completar la operación con la base de datos."], 500);
}