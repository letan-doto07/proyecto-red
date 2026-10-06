<?php
session_start();

$errorRegistro = "";

if (
    $_SERVER["REQUEST_METHOD"] === "POST" &&
    isset($_POST["accion"]) &&
    $_POST["accion"] === "registro"
) {
    $conexion = new mysqli("localhost", "root", "", "drawery");

    if ($conexion->connect_error) {
        $errorRegistro = "Error de conexión: " . $conexion->connect_error;
    } else {
        $usuario = trim($_POST["usuario"] ?? "");
        $contraseña = $_POST["contraseña"] ?? "";

        if (strlen($contraseña) < 4 || strlen($contraseña) > 12) {
            $errorRegistro = "La contraseña debe tener entre 4 y 12 caracteres.";
        } elseif ($usuario === "") {
            $errorRegistro = "El nombre de usuario no puede estar vacío.";
        } else {
            $consultaExistente = $conexion->prepare("SELECT id FROM usuarios WHERE usuario = ?");
            $consultaExistente->bind_param("s", $usuario);
            $consultaExistente->execute();
            $resultadoExistente = $consultaExistente->get_result();

            if ($resultadoExistente->num_rows > 0) {
                $errorRegistro = "Ese nombre de usuario ya está elegido. Prueba otro.";
            } else {
                $sql = "INSERT INTO usuarios (usuario, contraseña) VALUES (?, ?)";
                $stmt = $conexion->prepare($sql);
                $stmt->bind_param("ss", $usuario, $contraseña);
                $stmt->execute();

                $_SESSION["usuario"] = $usuario;
                $_SESSION["usuario_id"] = $stmt->insert_id;

                header("Location: index.php");
                exit;
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Crear usuario</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="registro pagina-auth">
        <?php if (!empty($errorRegistro)): ?>
            <p style="color: red; font-weight: bold;">
                <?php echo htmlspecialchars($errorRegistro, ENT_QUOTES, 'UTF-8'); ?>
            </p>
        <?php endif; ?>
        <h2>Crear usuario</h2>
        <form method="post">
            <input type="hidden" name="accion" value="registro">
            <p>
                <label>Usuario:</label>
                <input type="text" name="usuario" required>
            </p>
            <p>
                <label>Contraseña:</label>
                <input type="password" name="contraseña" minlength="4" maxlength="12" required>
            </p>
            <button type="submit">Crear usuario</button>
        </form>
        <p class="link-auth">
            <a href="login.php">Ya tengo cuenta</a>
        </p>
        <p class="link-auth">
            <a href="index.php">Volver al inicio</a>
        </p>
    </div>
</body>
</html>
