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

let dibujos = [];

async function cargarGaleriaPublica() {
    const galeria = document.getElementById("galeria");
    const buscador = document.getElementById("buscar-dibujo");

    if (!galeria) {
        return;
    }

    try {
        const respuesta = await fetch("dibujos.php?modo=all");
        const datos = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(datos.error || "No se pudo cargar la galería.");
        }

        dibujos = datos;
        galeria.innerHTML = "";

        if (dibujos.length === 0) {
            galeria.innerHTML = "<p>Todavía no hay dibujos de otros usuarios.</p>";
            return;
        }

        dibujos.forEach(function (dibujo) {
            const tarjeta = document.createElement("div");
            tarjeta.className = "tarjeta";

            tarjeta.innerHTML = `
                <img src="${dibujo.imagen}" alt="${dibujo.nombre}">
                <h3>${dibujo.nombre}</h3>
                <p class="autor">Por: ${dibujo.usuario || "Usuario"}</p>
                <div class="valoracion">
                    <span>Valoración:</span>
                    <div class="estrellas">${crearEstrellasPublicas(dibujo.valoracion || 0, dibujo.mi_valoracion || 0, dibujo.id)}</div>
                    <small class="promedio-valoracion">${Number(dibujo.valoracion || 0).toFixed(1)} / 5</small>
                </div>
                <button onclick="descargarDibujoPublico('${dibujo.id}', '${dibujo.nombre}', '${dibujo.imagen}')">📥 Descargar</button>
            `;

            galeria.appendChild(tarjeta);
        });

        if (buscador) {
            buscador.addEventListener("input", filtrarGaleriaPublica);
        }

    } catch (error) {
        galeria.innerHTML = `<p>${error.message}</p>`;
    }
}

function crearEstrellasPublicas(valoracion, miValoracion = 0, dibujoId) {
    const valor = Math.round(Number(miValoracion) || Number(valoracion) || 0);
    let resultado = "";

    for (let i = 1; i <= 5; i++) {
        const activa = i <= valor ? ' activa' : '';
        resultado += `<span class="estrella${activa}" onclick="valorarDibujoPublico(${dibujoId}, ${i})">★</span>`;
    }

    return resultado;
}

async function valorarDibujoPublico(dibujoId, valor) {
    const usuarioActual = Number(document.body.dataset.usuarioId || 0);
    if (!usuarioActual) {
        alert("Iniciá sesión para valorar dibujos.");
        return;
    }

    try {
        const respuesta = await fetch("dibujos.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accion: "valorar", id: dibujoId, estrellas: valor })
        });

        const datos = await respuesta.json();
        if (!respuesta.ok) {
            throw new Error(datos.error || "No se pudo guardar la valoración.");
        }

        await cargarGaleriaPublica();
    } catch (error) {
        alert(error.message);
    }
}

function filtrarGaleriaPublica() {
    const campoBusqueda = document.getElementById("buscar-dibujo");
    const galeria = document.getElementById("galeria");

    if (!campoBusqueda || !galeria) {
        return;
    }

    const busqueda = campoBusqueda.value.trim().toLowerCase();

    galeria.querySelectorAll(".tarjeta").forEach(function (tarjeta) {
        const nombre = tarjeta.querySelector("h3").textContent.toLowerCase();
        tarjeta.hidden = !nombre.includes(busqueda);
    });
}

function descargarDibujoPublico(id, nombre, imagen) {
    const enlace = document.createElement("a");
    enlace.href = imagen;
    enlace.download = nombre + ".png";
    enlace.click();
}

cargarGaleriaPublica();
