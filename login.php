<?php
$conexion = new mysqli("localhost", "root", "", "drawery");
if ($conexion->connect_error) {
die("Error de conexión: " . $conexion->connect_error);
}
$mensaje = "";
if ($_SERVER["REQUEST_METHOD"] == "POST") {
$usuario = $_POST["usuario"];
$contraseña = $_POST["contraseña"];
$sql = "SELECT * FROM usuarios
WHERE usuario = '$usuario'
AND contraseña = '$contraseña'";
$resultado = $conexion->query($sql);
if ($resultado->num_rows > 0) {
$mensaje = "Ingreso correcto. Bienvenido, " . $usuario;
} else {
$mensaje = "Usuario o contraseña incorrectos.";
}
}
?>
<!DOCTYPE html>

<html lang="es">
<head>
<meta charset="UTF-8">
<title>Ingreso al sistema</title>
</head>
<body>
<h1>Ingreso al sistema</h1>
<form method="post">
<p>
<label>Usuario:</label>
<input type="text" name="usuario">
</p>
<p>
<label>Contraseña:</label>
<input type="password" name="contraseña">
</p>
<button type="submit">
Ingresar
</button>
</form>
<p>
<?php echo $mensaje; ?>
</p>
</body>
</html>
<?php
$conexion->close();
?>