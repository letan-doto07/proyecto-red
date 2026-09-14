<?php
$conexion = new mysqli("localhost", "root", "", "drawery");
if ($conexion->connect_error) {
die("Error de conexión: " . $conexion->connect_error);
}
if ($_SERVER["REQUEST_METHOD"] == "POST") {
$usuario = $_POST["usuario"];
$contraseña = $_POST["contraseña"];
$sql = "INSERT INTO usuario (usuario, contraseña)
VALUES ('$usuario', '$contraseña')";
$conexion->query($sql);
}
?>

<?php
$conexion->close();
?>


<?php
$conexion = new mysqli("localhost", "root", "", "drawery");
if ($conexion->connect_error) {
die("Error de conexión: " . $conexion->connect_error);
}
$mensaje = "";
if ($_SERVER["REQUEST_METHOD"] == "POST") {
$usuario = $_POST["usuario"];
$contraseña = $_POST["contraseña"];
$sql = "SELECT * FROM usuario
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