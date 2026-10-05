<?php
session_start();

$conexion = new mysqli("localhost", "root", "", "drawery");
if ($conexion->connect_error) {
die("Error de conexión: " . $conexion->connect_error);
}
if (isset($_SESSION["usuario"]) && !isset($_SESSION["usuario_id"])) {
    $consultaUsuario = $conexion->prepare(
        "SELECT id FROM usuarios WHERE usuario = ?"
    );
    $consultaUsuario->bind_param("s", $_SESSION["usuario"]);
    $consultaUsuario->execute();
    $cuentaActual = $consultaUsuario->get_result()->fetch_assoc();

    if ($cuentaActual) {
        $_SESSION["usuario_id"] = (int) $cuentaActual["id"];
    } else {
        unset($_SESSION["usuario"], $_SESSION["usuario_id"]);
    }
}
if (
    $_SERVER["REQUEST_METHOD"] == "POST" &&
    isset($_POST["accion"]) &&
    $_POST["accion"] === "salir"
) {
    $_SESSION = [];
    session_destroy();
}

if (
    $_SERVER["REQUEST_METHOD"] == "POST" &&
    isset($_POST["accion"]) &&
    $_POST["accion"] === "registro"
) {
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

<div class="registro">
<form method="post">
<input type="hidden" name="accion" value="registro">
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
</div>
<?php
include 'login.php';
?>
    <div class="contenedor">

        <h1>drawery</h1>

        <nav class="menu-principal" aria-label="Menú principal">
            <a href="#galeria">Ver dibujos</a>
            <input type="search" id="buscar-dibujo" placeholder="Buscar dibujo..." aria-label="Buscar dibujos por nombre">
            <div class="usuario-menu">
                <span>Usuario: <?php echo htmlspecialchars($_SESSION["usuario"] ?? "Invitado", ENT_QUOTES, "UTF-8"); ?></span>
                <?php if (isset($_SESSION["usuario"])): ?>
                <form method="post">
                    <input type="hidden" name="accion" value="salir">
                    <button type="submit">Cerrar sesión</button>
                </form>
                <?php endif; ?>
            </div>
        </nav>

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