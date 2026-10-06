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

$errorRegistro = "";

if (
    $_SERVER["REQUEST_METHOD"] == "POST" &&
    isset($_POST["accion"]) &&
    $_POST["accion"] === "registro"
) {
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
        }
    }
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

<body data-usuario-id="<?php echo (int) ($_SESSION["usuario_id"] ?? 0); ?>">

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
    <div class="contenedor">

        <h1>drawery</h1>

        <nav class="menu-principal" aria-label="Menú principal">
            <a href="index.php" class="btn-galeria activo" id="ver-mis-dibujos">Mis dibujos</a>
            <a href="explorar.php" class="btn-galeria" id="ver-otros-dibujos">Ver dibujos de otros</a>
            <input type="search" id="buscar-dibujo" placeholder="Buscar dibujo..." aria-label="Buscar dibujos por nombre">
            <div class="usuario-menu">
                <span id="mi-usuario">Usuario: <?php echo htmlspecialchars($_SESSION["usuario"] ?? "Invitado", ENT_QUOTES, "UTF-8"); ?></span>
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