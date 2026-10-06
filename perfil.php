<?php
session_start();

if (!isset($_SESSION["usuario_id"])) {
    header("Location: login.php");
    exit;
}

$conexion = new mysqli("localhost", "root", "", "drawery");
$conexion->set_charset("utf8mb4");

$userId = (int) $_SESSION["usuario_id"];
$usuarioActual = $_SESSION["usuario"] ?? "Usuario";
$fotoPerfil = "";
$mensajePerfil = "";
$errorPerfil = "";

if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["accion"]) && $_POST["accion"] === "guardar_perfil") {
    $foto = $_POST["foto_perfil"] ?? "";

    if (!preg_match('/^data:image\/(png|jpeg|jpg|gif|webp);base64,/', $foto)) {
        $errorPerfil = "La foto no es válida.";
    } else {
        $stmt = $conexion->prepare("UPDATE usuarios SET foto_perfil = ? WHERE id = ?");
        $stmt->bind_param("si", $foto, $userId);
        $stmt->execute();
        $fotoPerfil = $foto;
        $mensajePerfil = "Foto actualizada correctamente.";
    }
}

try {
    $stmtUsuario = $conexion->prepare("SELECT usuario, foto_perfil FROM usuarios WHERE id = ?");
    $stmtUsuario->bind_param("i", $userId);
    $stmtUsuario->execute();
    $usuarioDatos = $stmtUsuario->get_result()->fetch_assoc();

    if ($usuarioDatos) {
        $usuarioActual = $usuarioDatos["usuario"] ?? $usuarioActual;
        $fotoPerfil = $usuarioDatos["foto_perfil"] ?? $fotoPerfil;
    }
} catch (Throwable $e) {
    $stmtUsuario = $conexion->prepare("SELECT usuario FROM usuarios WHERE id = ?");
    $stmtUsuario->bind_param("i", $userId);
    $stmtUsuario->execute();
    $usuarioDatos = $stmtUsuario->get_result()->fetch_assoc();

    if ($usuarioDatos) {
        $usuarioActual = $usuarioDatos["usuario"] ?? $usuarioActual;
    }
}

$dibujos = [];
$stmtDibujos = $conexion->prepare(
    "SELECT id, nombre, imagen FROM dibujos WHERE usuario_id = ? ORDER BY fecha_creacion DESC"
);
$stmtDibujos->bind_param("i", $userId);
$stmtDibujos->execute();
$dibujos = $stmtDibujos->get_result()->fetch_all(MYSQLI_ASSOC);
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mi perfil</title>
    <link rel="stylesheet" href="style.css">
</head>
<body data-usuario-id="<?php echo (int) ($_SESSION["usuario_id"] ?? 0); ?>">
    <div class="perfil-wrapper">
        <div class="perfil-card">
            <div class="perfil-header">
                <img
                    id="perfil-foto-preview"
                    class="perfil-foto"
                    src="<?php echo htmlspecialchars($fotoPerfil !== "" ? $fotoPerfil : "https://placehold.co/220x220/2d2d2d/ffffff?text=" . rawurlencode($usuarioActual), ENT_QUOTES, 'UTF-8'); ?>"
                    alt="Foto de perfil"
                >
                <div class="perfil-info">
                    <h1><?php echo htmlspecialchars($usuarioActual, ENT_QUOTES, 'UTF-8'); ?></h1>

                    <form method="post" id="form-perfil" enctype="multipart/form-data">
                        <input type="hidden" name="accion" value="guardar_perfil">
                        <input type="hidden" name="foto_perfil" id="foto_perfil" value="<?php echo htmlspecialchars($fotoPerfil, ENT_QUOTES, 'UTF-8'); ?>">

                        <label for="input-foto" class="boton-foto">Cambiar foto</label>
                        <input id="input-foto" type="file" accept="image/*">
                        <button type="submit">Guardar foto</button>
                    </form>

                    <?php if ($mensajePerfil !== ""): ?>
                        <p class="mensaje-perfil ok"><?php echo htmlspecialchars($mensajePerfil, ENT_QUOTES, 'UTF-8'); ?></p>
                    <?php endif; ?>

                    <?php if ($errorPerfil !== ""): ?>
                        <p class="mensaje-perfil error"><?php echo htmlspecialchars($errorPerfil, ENT_QUOTES, 'UTF-8'); ?></p>
                    <?php endif; ?>
                </div>
            </div>

            <div class="perfil-dibujos">
                <h2>Mis dibujos</h2>

                <?php if (count($dibujos) === 0): ?>
                    <p class="vacio-perfil">Todavía no tienes dibujos guardados.</p>
                <?php else: ?>
                    <div class="galeria perfil-galeria">
                        <?php foreach ($dibujos as $dibujo): ?>
                            <div class="tarjeta">
                                <img src="<?php echo htmlspecialchars($dibujo["imagen"], ENT_QUOTES, 'UTF-8'); ?>" alt="<?php echo htmlspecialchars($dibujo["nombre"], ENT_QUOTES, 'UTF-8'); ?>">
                                <h3><?php echo htmlspecialchars($dibujo["nombre"], ENT_QUOTES, 'UTF-8'); ?></h3>
                                <a href="<?php echo htmlspecialchars($dibujo["imagen"], ENT_QUOTES, 'UTF-8'); ?>" download="<?php echo htmlspecialchars($dibujo["nombre"], ENT_QUOTES, 'UTF-8'); ?>.png" class="btn-descarga">📥 Descargar</a>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>

    <div class="menu-acciones" aria-label="Menú de acciones">
        <button id="menu-acciones-toggle" class="menu-acciones-toggle" type="button" aria-expanded="false">☰</button>
        <div id="menu-acciones" class="menu-acciones-panel">
            <button id="menu-crear-usuario" type="button">Crear usuario</button>
            <button id="menu-iniciar-sesion" type="button">Iniciar sesión</button>
            <button id="menu-mi-usuario" type="button">Ver mi usuario</button>
            <button id="menu-mis-dibujos" type="button">Ver mis dibujos</button>
            <button id="menu-otros-dibujos" type="button">Ver dibujos de otros</button>
        </div>
    </div>

    <script src="perfil.js"></script>
</body>
</html>
