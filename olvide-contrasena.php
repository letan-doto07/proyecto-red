<?php
$mensaje = "";
$error = "";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $usuario = trim($_POST["usuario"] ?? "");
    $contrasena = $_POST["contrasena"] ?? "";
    $confirmacion = $_POST["confirmacion"] ?? "";

    if ($usuario === "") {
        $error = "Escribe tu nombre de usuario.";
    } elseif (strlen($contrasena) < 4 || strlen($contrasena) > 12) {
        $error = "La contraseña debe tener entre 4 y 12 caracteres.";
    } elseif ($contrasena !== $confirmacion) {
        $error = "Las contraseñas no coinciden.";
    } else {
        $conexion = new mysqli("localhost", "phpmyadmin", "RedesInformaticas", "drawery");

        if ($conexion->connect_error) {
            $error = "No se pudo conectar con la base de datos.";
        } else {
            $consulta = $conexion->prepare(
                "UPDATE usuarios SET contraseña = ? WHERE usuario = ?"
            );

            if ($consulta) {
                $consulta->bind_param("ss", $contrasena, $usuario);
                $consulta->execute();
                $mensaje = $consulta->affected_rows > 0
                    ? "Contraseña actualizada. Ya puedes iniciar sesión."
                    : "No se pudo actualizar. Comprueba el usuario e inténtalo de nuevo.";
                $consulta->close();
            } else {
                $error = "No se pudo preparar el cambio de contraseña.";
            }

            $conexion->close();
        }
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperar contraseña</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <main class="pagina-auth">
        <h2>¿Olvidaste tu contraseña?</h2>
        <?php if ($error !== ""): ?>
            <p class="mensaje-login"><?php echo htmlspecialchars($error, ENT_QUOTES, "UTF-8"); ?></p>
        <?php endif; ?>
        <?php if ($mensaje !== ""): ?>
            <p class="mensaje-login"><?php echo htmlspecialchars($mensaje, ENT_QUOTES, "UTF-8"); ?></p>
        <?php endif; ?>
        <form method="post">
            <label for="usuario">Usuario:</label>
            <input id="usuario" type="text" name="usuario" required>
            <label for="contrasena">Nueva contraseña:</label>
            <input id="contrasena" type="password" name="contrasena" minlength="4" maxlength="12" required>
            <label for="confirmacion">Repite la contraseña:</label>
            <input id="confirmacion" type="password" name="confirmacion" minlength="4" maxlength="12" required>
            <button type="submit">Cambiar contraseña</button>
        </form>
        <p class="link-auth">
            <a href="login.php">Volver al inicio de sesión</a>
        </p>
    </main>
</body>
</html>