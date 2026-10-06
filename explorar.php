<?php
session_start();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Explorar dibujos</title>
    <link rel="stylesheet" href="style.css">
</head>
<body data-usuario-id="<?php echo (int) ($_SESSION["usuario_id"] ?? 0); ?>">

<div class="contenedor">
    <h1>Explorar dibujos</h1>

    <nav class="menu-principal" aria-label="Menú principal">
        <a href="index.php" class="btn-galeria">Volver a mis dibujos</a>
        <input type="search" id="buscar-dibujo" placeholder="Buscar dibujo..." aria-label="Buscar dibujos por nombre">
        <div class="usuario-menu">
            <span id="mi-usuario">Usuario: <?php echo htmlspecialchars($_SESSION["usuario"] ?? "Invitado", ENT_QUOTES, "UTF-8"); ?></span>
            <?php if (isset($_SESSION["usuario"])): ?>
            <form method="post" action="index.php">
                <input type="hidden" name="accion" value="salir">
                <button type="submit">Cerrar sesión</button>
            </form>
            <?php endif; ?>
        </div>
    </nav>

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

    <div id="galeria" class="galeria"></div>
</div>

<script src="explorar.js"></script>
</body>
</html>
