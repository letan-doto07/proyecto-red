<?php
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
				$mensaje = "Ingreso correcto. Bienvenido, " . $usuario;
				$_SESSION["usuario_id"] = (int) $cuenta["id"];
				$_SESSION["usuario"] = $cuenta["usuario"];
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
<?php if (!isset($_SESSION["usuario"])): ?>
<div class="inicio-sesion">
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
<button type="submit">
Ingresar
</button>
</form>
<?php if ($mensaje !== ""): ?>
<p class="mensaje-login"><?php echo htmlspecialchars($mensaje, ENT_QUOTES, "UTF-8"); ?></p>
<?php endif; ?>
</div>
<?php endif; ?>