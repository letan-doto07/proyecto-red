const menuToggle = document.getElementById("menu-acciones-toggle");
const menuPanel = document.getElementById("menu-acciones");

if (menuToggle && menuPanel) {
    menuToggle.addEventListener("click", function () {
        const abrir = !menuPanel.classList.contains("active");
        menuPanel.classList.toggle("active", abrir);
        menuToggle.setAttribute("aria-expanded", String(abrir));
    });

    const crearUsuarioBtn = document.getElementById("menu-crear-usuario");
    if (crearUsuarioBtn) {
        crearUsuarioBtn.addEventListener("click", function () {
            window.location.href = "registro.php";
        });
    }

    const iniciarSesionBtn = document.getElementById("menu-iniciar-sesion");
    if (iniciarSesionBtn) {
        iniciarSesionBtn.addEventListener("click", function () {
            window.location.href = "login.php";
        });
    }

    const miUsuarioBtn = document.getElementById("menu-mi-usuario");
    if (miUsuarioBtn) {
        miUsuarioBtn.addEventListener("click", function () {
            window.location.href = "perfil.php";
        });
    }

    const misDibujosBtn = document.getElementById("menu-mis-dibujos");
    if (misDibujosBtn) {
        misDibujosBtn.addEventListener("click", function () {
            window.location.href = "index.php#galeria";
        });
    }

    const otrosDibujosBtn = document.getElementById("menu-otros-dibujos");
    if (otrosDibujosBtn) {
        otrosDibujosBtn.addEventListener("click", function () {
            window.location.href = "explorar.php";
        });
    }
}

const inputFoto = document.getElementById("input-foto");
const hiddenFoto = document.getElementById("foto_perfil");
const previewFoto = document.getElementById("perfil-foto-preview");

if (inputFoto && hiddenFoto && previewFoto) {
    inputFoto.addEventListener("change", function () {
        const archivo = inputFoto.files[0];
        if (!archivo) return;

        const lector = new FileReader();
        lector.onload = function () {
            const dataUrl = lector.result;
            previewFoto.src = dataUrl;
            hiddenFoto.value = dataUrl;
        };
        lector.readAsDataURL(archivo);
    });
}
