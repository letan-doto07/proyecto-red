<?php
session_start();

$mensaje = "";

if (
    $_SERVER["REQUEST_METHOD"] === "POST" &&
    isset($_POST["accion"]) &&
    $_POST["accion"] === "login"
) {
    $conexionLogin = new mysqli("localhost", "root", "", "drawery");

    if ($conexionLogin->connect_error) {
        $mensaje = "Error de conexión: " . $conexionLogin->connect_error;
    } else {
        $usuario = $_POST["usuario"] ?? "";
        $contraseña = $_POST["contraseña"] ?? "";
        $consulta = $conexionLogin->prepare(
            "SELECT id, usuario FROM usuarios WHERE usuario = ? AND contraseña = ?"
        );

        if ($consulta) {
            $consulta->bind_param("ss", $usuario, $contraseña);
            $consulta->execute();
            $resultado = $consulta->get_result();
            $cuenta = $resultado->fetch_assoc();

            if ($cuenta) {
                $_SESSION["usuario_id"] = (int) $cuenta["id"];
                $_SESSION["usuario"] = $cuenta["usuario"];
                header("Location: index.php");
                exit;
            } else {
                $mensaje = "Usuario o contraseña incorrectos.";
            }

            $consulta->close();
        } else {
            $mensaje = "No se pudo validar el inicio de sesión.";
        }

        $conexionLogin->close();
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Iniciar sesión</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="inicio-sesion pagina-auth">
        <h2>Iniciar sesión</h2>
        <form method="post">
            <input type="hidden" name="accion" value="login">
            <p>
                <label>Usuario:</label>
                <input type="text" name="usuario" required>
            </p>
            <p>
                <label>Contraseña:</label>
                <input type="password" name="contraseña" required>
            </p>
            <button type="submit">Ingresar</button>
        </form>
        <?php if ($mensaje !== ""): ?>
            <p class="mensaje-login"><?php echo htmlspecialchars($mensaje, ENT_QUOTES, "UTF-8"); ?></p>
        <?php endif; ?>
        <p class="link-auth">
            <a href="registro.php">Crear una cuenta</a>
        </p>
        <p class="link-auth">
            <a href="index.php">Volver al inicio</a>
        </p>
    </div>
</body>
</html>
