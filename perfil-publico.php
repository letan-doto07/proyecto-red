<?php
session_start();

$usuarioId = filter_input(INPUT_GET, "id", FILTER_VALIDATE_INT, [
    "options" => ["min_range" => 1],
]);

if (!$usuarioId) {
    http_response_code(404);
    $usuario = null;
    $dibujos = [];
} else {
    $conexion = new mysqli("localhost", "root", "", "drawery");
    $conexion->set_charset("utf8mb4");

    $consultaUsuario = $conexion->prepare(
        "SELECT usuario, foto_perfil FROM usuarios WHERE id = ?"
    );
    $consultaUsuario->bind_param("i", $usuarioId);
    $consultaUsuario->execute();
    $usuario = $consultaUsuario->get_result()->fetch_assoc();

    if (!$usuario) {
        http_response_code(404);
        $dibujos = [];
    } else {
        $consultaDibujos = $conexion->prepare(
            "SELECT nombre, imagen FROM dibujos WHERE usuario_id = ? ORDER BY fecha_creacion DESC, id DESC"
        );
        $consultaDibujos->bind_param("i", $usuarioId);
        $consultaDibujos->execute();
        $dibujos = $consultaDibujos->get_result()->fetch_all(MYSQLI_ASSOC);
    }
}

$nombreUsuario = $usuario["usuario"] ?? "Perfil no encontrado";
$fotoPerfil = $usuario["foto_perfil"] ?? "";
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($nombreUsuario, ENT_QUOTES, "UTF-8"); ?> | Perfil</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <main class="perfil-wrapper">
        <section class="perfil-card">
            <?php if (!$usuario): ?>
                <h1>Perfil no encontrado</h1>
                <p>Ese usuario no existe o el enlace no es válido.</p>
            <?php else: ?>
                <header class="perfil-header">
                    <img
                        class="perfil-foto"
                        src="<?php echo htmlspecialchars($fotoPerfil !== "" ? $fotoPerfil : "https://placehold.co/220x220/2d2d2d/ffffff?text=" . rawurlencode($nombreUsuario), ENT_QUOTES, "UTF-8"); ?>"
                        alt="Foto de <?php echo htmlspecialchars($nombreUsuario, ENT_QUOTES, "UTF-8"); ?>"
                    >
                    <div class="perfil-info">
                        <h1><?php echo htmlspecialchars($nombreUsuario, ENT_QUOTES, "UTF-8"); ?></h1>
                        <a href="explorar.php" class="btn-descarga">Volver a explorar dibujos</a>
                    </div>
                </header>

                <section class="perfil-dibujos">
                    <h2>Dibujos de <?php echo htmlspecialchars($nombreUsuario, ENT_QUOTES, "UTF-8"); ?></h2>
                    <?php if (count($dibujos) === 0): ?>
                        <p class="vacio-perfil">Este usuario todavía no tiene dibujos guardados.</p>
                    <?php else: ?>
                        <div class="galeria perfil-galeria">
                            <?php foreach ($dibujos as $dibujo): ?>
                                <article class="tarjeta">
                                    <img src="<?php echo htmlspecialchars($dibujo["imagen"], ENT_QUOTES, "UTF-8"); ?>" alt="<?php echo htmlspecialchars($dibujo["nombre"], ENT_QUOTES, "UTF-8"); ?>">
                                    <h3><?php echo htmlspecialchars($dibujo["nombre"], ENT_QUOTES, "UTF-8"); ?></h3>
                                    <a href="<?php echo htmlspecialchars($dibujo["imagen"], ENT_QUOTES, "UTF-8"); ?>" download="<?php echo htmlspecialchars($dibujo["nombre"], ENT_QUOTES, "UTF-8"); ?>.png" class="btn-descarga">Descargar dibujo</a>
                                </article>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>
                </section>
            <?php endif; ?>
        </section>
    </main>
</body>
</html>