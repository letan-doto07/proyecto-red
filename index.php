<?php
$conexion = new mysqli("localhost", "root", "", "drawery");
if ($conexion->connect_error) {
die("Error de conexión: " . $conexion->connect_error);
}
if ($_SERVER["REQUEST_METHOD"] == "POST") {
$usuario = $_POST["usuario"];
$contraseña = $_POST["contraseña"];
$sql = "INSERT INTO usuarios (usuario, contraseña)
VALUES ('$usuario', '$contraseña')";
$conexion->query($sql);
}
?>


<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>drawery</title>

    <link rel="stylesheet" href="style.css">
</head>

<body>

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
Crear usuario
</button>
</form>
<?php
include 'login.php';
?>
    <div class="contenedor">

        <h1>drawery</h1>

        <!-- BARRA DE HERRAMIENTAS -->

        <div class="barra">

            <label>Color:</label>

            <input type="color" id="color" value="#000000">

            <label>Grosor:</label>

            <input type="range" id="tamano" min="1" max="40" value="5">

            <button id="lapiz">
                 Lápiz
            </button>

            <button id="goma">
                 Goma
            </button>

            <button id="cubeta">
                 Cubeta
            </button>

            <button id="deshacer">
                ↩ Deshacer
            </button>

            <button id="rehacer">
                ↪ Rehacer
            </button>

            <button id="limpiar">
                 Limpiar
            </button>

            <button id="modo">
                ☀️ Modo claro
            </button>

        </div>


        <!-- LIENZO -->

        <canvas
            id="canvas"
            width="1000"
            height="600">
        </canvas>


        <!-- GUARDAR -->

        <div class="guardar">

            <input
                type="text"
                id="nombre"
                placeholder="Nombre del dibujo">

            <button id="guardar">
                 Guardar dibujo
            </button>

        </div>


        <!-- GALERÍA -->

        <h2>🖼️ Galería</h2>

        <div id="galeria" class="galeria"></div>

       
    </div>


    <script src="script.js"></script>

</body>

</html>

<?php
$conexion->close();
?>