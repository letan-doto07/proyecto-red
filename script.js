const canvas = document.getElementById("canvas");

const ctx = canvas.getContext("2d");

const color = document.getElementById("color");

const tamano = document.getElementById("tamano");


let dibujos = [];

let dibujando = false;

let herramienta = "lapiz";

let galeriaActual = "mis";



// DESHACER Y REHACER


let historial = [];

let historialFuturo = [];


async function solicitarDibujos(opciones = {}, modo = galeriaActual) {

    const url = new URL("dibujos.php", window.location.href);

    if (modo === "todos") {
        url.searchParams.set("modo", "all");
    }

    const respuesta =
        await fetch(url.toString(), opciones);

    const datos =
        await respuesta.json();

    if (!respuesta.ok) {

        throw new Error(
            datos.error || "No se pudo conectar con los dibujos."
        );

    }

    return datos;

}


function enviarAccionDibujo(datos) {

    return solicitarDibujos({

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(datos)

    }, galeriaActual);

}


// Guardar el estado actual

function guardarEstado() {

    historial.push(
        canvas.toDataURL()
    );

    // Evita que el historial crezca demasiado

    if (historial.length > 30) {

        historial.shift();

    }

}



// DESHACER


document
    .getElementById("deshacer")
    .addEventListener(
        "click",
        function() {

            if (historial.length === 0) {

                return;

            }


            // Guardamos el estado actual
            // para poder rehacerlo

            historialFuturo.push(
                canvas.toDataURL()
            );


            const imagen =
                new Image();


            imagen.onload =
                function() {

                    ctx.clearRect(
                        0,
                        0,
                        canvas.width,
                        canvas.height
                    );


                    ctx.drawImage(
                        imagen,
                        0,
                        0
                    );

                };


            imagen.src =
                historial.pop();

        }
    );



// REHACER


document
    .getElementById("rehacer")
    .addEventListener(
        "click",
        function() {

            if (
                historialFuturo.length === 0
            ) {

                return;

            }


            // Guardamos el estado actual

            historial.push(
                canvas.toDataURL()
            );


            const imagen =
                new Image();


            imagen.onload =
                function() {

                    ctx.clearRect(
                        0,
                        0,
                        canvas.width,
                        canvas.height
                    );


                    ctx.drawImage(
                        imagen,
                        0,
                        0
                    );

                };


            imagen.src =
                historialFuturo.pop();

        }
    );



// POSICIÓN DEL MOUSE / TÁCTIL


function obtenerPosicion(e) {

    const rect =
        canvas.getBoundingClientRect();


    return {

        x: Math.floor(
            (e.clientX - rect.left) *
            (canvas.width / rect.width)
        ),

        y: Math.floor(
            (e.clientY - rect.top) *
            (canvas.height / rect.height)
        )

    };

}



// EMPEZAR A DIBUJAR


canvas.addEventListener(
    "pointerdown",
    function(e) {

        const posicion =
            obtenerPosicion(e);


        // CUBETA

        if (
            herramienta === "cubeta"
        ) {

            guardarEstado();

            historialFuturo = [];


            rellenar(
                posicion.x,
                posicion.y,
                color.value
            );


            return;

        }


        // Guardar antes de modificar

        guardarEstado();

        historialFuturo = [];


        dibujando = true;


        canvas.setPointerCapture(
            e.pointerId
        );


        ctx.beginPath();


        ctx.moveTo(
            posicion.x,
            posicion.y
        );

    }
);



// DIBUJAR


canvas.addEventListener(
    "pointermove",
    function(e) {

        if (!dibujando) return;


        const posicion =
            obtenerPosicion(e);


        ctx.lineWidth =
            Number(tamano.value);


        if (
            herramienta === "goma"
        ) {

            ctx.strokeStyle =
                "#ffffff";

        } else {

            ctx.strokeStyle =
                color.value;

        }


        ctx.lineTo(
            posicion.x,
            posicion.y
        );


        ctx.stroke();


        ctx.beginPath();


        ctx.moveTo(
            posicion.x,
            posicion.y
        );

    }
);



// TERMINAR


canvas.addEventListener(
    "pointerup",
    function() {

        dibujando = false;

        ctx.beginPath();

    }
);


canvas.addEventListener(
    "pointercancel",
    function() {

        dibujando = false;

        ctx.beginPath();

    }
);



// LÁPIZ


document
    .getElementById("lapiz")
    .addEventListener(
        "click",
        function() {

            herramienta = "lapiz";

        }
    );



// GOMA

document
    .getElementById("goma")
    .addEventListener(
        "click",
        function() {

            herramienta = "goma";

        }
    );



// CUBETA


document
    .getElementById("cubeta")
    .addEventListener(
        "click",
        function() {

            herramienta = "cubeta";

        }
    );



// LIMPIAR


document
    .getElementById("limpiar")
    .addEventListener(
        "click",
        function() {

            guardarEstado();

            historialFuturo = [];


            if (
                confirm(
                    "¿Querés limpiar todo el dibujo?"
                )
            ) {

                ctx.clearRect(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

            }

        }
    );



// GUARDAR DIBUJO


document
    .getElementById("guardar")
    .addEventListener(
        "click",
        async function() {

            const nombreInput =
                document.getElementById(
                    "nombre"
                );


            let nombre =
                nombreInput.value.trim();


            if (nombre === "") {

                nombre =
                    "Dibujo sin nombre";

            }


            const imagen =
                canvas.toDataURL(
                    "image/png"
                );

            const editando =
                window.dibujoEditando !== undefined;

            const dibujo =
                editando ? dibujos[window.dibujoEditando] : null;

            try {

                await enviarAccionDibujo({
                    accion: editando ? "editar" : "crear",
                    id: dibujo?.id,
                    nombre: nombre,
                    imagen: imagen
                });

                window.dibujoEditando = undefined;
                nombreInput.value = "";

                await cargarGaleria();

                alert(
                    editando
                        ? "¡Dibujo actualizado! 🎨"
                        : "¡Dibujo guardado! 🎨"
                );

            } catch (error) {

                alert(error.message);

            }

        }
    );



// CARGAR GALERÍA


async function cargarGaleria(modo = galeriaActual) {

    galeriaActual = modo;

    const galeria =
        document.getElementById(
            "galeria"
        );


    try {

        dibujos = await solicitarDibujos({}, modo);

    } catch (error) {

        galeria.innerHTML = "<p>No se pudieron cargar los dibujos.</p>";
        return;

    }


    galeria.innerHTML = "";


    if (dibujos.length === 0) {

        galeria.innerHTML =
            "<p>Todavía no hay dibujos guardados.</p>";

        return;

    }


    dibujos.forEach(
        function(dibujo, indice) {

            const tarjeta =
                document.createElement(
                    "div"
                );


            tarjeta.className =
                "tarjeta";

            const autorHtml = galeriaActual === "todos"
                ? `<p class="autor">Por: ${dibujo.usuario || "Usuario"}</p>`
                : "";

            const botonesHtml = galeriaActual === "todos"
                ? `<button onclick="descargarDibujo(${indice})">📥 Descargar</button>`
                : `
                    <button onclick="editarDibujo(${indice})">✏️ Editar</button>
                    <button onclick="descargarDibujo(${indice})">📥 Descargar</button>
                    <button onclick="eliminarDibujo(${indice})">🗑️ Eliminar</button>
                `;

            tarjeta.innerHTML = `

                <img
                    src="${dibujo.imagen}"
                >

                <h3>
                    ${dibujo.nombre}
                </h3>

                ${autorHtml}

                <div class="valoracion">

                    <span>
                        Valoración:
                    </span>

                    <div class="estrellas">

                        ${crearEstrellas(
                            indice,
                            dibujo.valoracion || 0,
                            dibujo.mi_valoracion || 0
                        )}

                    </div>

                    <small class="promedio-valoracion">
                        ${Number(dibujo.valoracion || 0).toFixed(1)} / 5
                    </small>

                </div>

                ${botonesHtml}

            `;


            galeria.appendChild(
                tarjeta
            );

        }
    );

    filtrarGaleria();

}


function filtrarGaleria() {

    const campoBusqueda =
        document.getElementById("buscar-dibujo");

    if (!campoBusqueda) {

        return;

    }

    const busqueda =
        campoBusqueda.value.trim().toLocaleLowerCase();

    document
        .querySelectorAll("#galeria .tarjeta")
        .forEach(function(tarjeta) {

            const nombre =
                tarjeta.querySelector("h3").textContent.toLocaleLowerCase();

            tarjeta.hidden = !nombre.includes(busqueda);

        });

}


// ESTRELLAS


function crearEstrellas(
    indice,
    valoracion,
    miValoracion = 0
) {

    const valor = Math.round(Number(miValoracion) || Number(valoracion) || 0);
    let resultado = "";


    for (
        let i = 1;
        i <= 5;
        i++
    ) {

        if (i <= valor) {

            resultado += `

                <span
                    class="estrella activa"
                    onclick="valorarDibujo(
                        ${indice},
                        ${i}
                    )"
                >
                    ★
                </span>

            `;

        } else {

            resultado += `

                <span
                    class="estrella"
                    onclick="valorarDibujo(
                        ${indice},
                        ${i}
                    )"
                >
                    ★
                </span>

            `;

        }

    }


    return resultado;

}



// VALORAR


async function valorarDibujo(
    indice,
    valor
) {

    const dibujo = dibujos[indice];

    if (!dibujo) {
        return;
    }

    const usuarioActual = Number(document.body.dataset.usuarioId || 0);
    if (!usuarioActual) {
        alert("Iniciá sesión para valorar dibujos.");
        return;
    }

    try {

        await enviarAccionDibujo({
            accion: "valorar",
            id: dibujo.id,
            estrellas: valor
        });

        await cargarGaleria(galeriaActual);

    } catch (error) {

        alert(error.message);

    }

}



// EDITAR DIBUJO


function editarDibujo(
    indice
) {

    const dibujo =
        dibujos[indice];

    if (!dibujo) {
        return;
    }


    const imagen =
        new Image();


    imagen.onload =
        function() {

            ctx.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );


            ctx.drawImage(
                imagen,
                0,
                0,
                canvas.width,
                canvas.height
            );


            document.getElementById(
                "nombre"
            ).value =
                dibujo.nombre;


            window.dibujoEditando =
                indice;


            window.scrollTo({

                top: 0,

                behavior: "smooth"

            });

        };


    imagen.src =
        dibujo.imagen;

}



// DESCARGAR


function descargarDibujo(
    indice
) {

    const enlace =
        document.createElement(
            "a"
        );


    enlace.href =
        dibujos[indice].imagen;


    enlace.download =
        dibujos[indice].nombre +
        ".png";


    enlace.click();

}



// ELIMINAR


async function eliminarDibujo(
    indice
) {

    if (
        confirm(
            "¿Querés eliminar este dibujo?"
        )
    ) {

        const dibujo = dibujos[indice];

        if (!dibujo) {
            return;
        }

        try {

            await enviarAccionDibujo({
                accion: "eliminar",
                id: dibujo.id
            });

            await cargarGaleria();

        } catch (error) {

            alert(error.message);

        }

    }

}



// CUBETA


function rellenar(
    x,
    y,
    nuevoColor
) {

    const imagen =
        ctx.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
        );


    const datos =
        imagen.data;


    const inicio =
        (y * canvas.width + x) * 4;


    const rojo =
        datos[inicio];


    const verde =
        datos[inicio + 1];


    const azul =
        datos[inicio + 2];


    const alfa =
        datos[inicio + 3];


    const numero =
        parseInt(
            nuevoColor.substring(1),
            16
        );


    const nuevoRojo =
        (numero >> 16) & 255;


    const nuevoVerde =
        (numero >> 8) & 255;


    const nuevoAzul =
        numero & 255;


    if (

        rojo === nuevoRojo &&

        verde === nuevoVerde &&

        azul === nuevoAzul &&

        alfa === 255

    ) {

        return;

    }


    const pila = [];


    pila.push([
        x,
        y
    ]);


    while (
        pila.length > 0
    ) {

        const punto =
            pila.pop();


        const px =
            punto[0];


        const py =
            punto[1];


        if (

            px < 0 ||

            py < 0 ||

            px >= canvas.width ||

            py >= canvas.height

        ) {

            continue;

        }


        const posicion =
            (
                py *
                canvas.width +
                px
            ) * 4;


        if (

            datos[posicion] !==
                rojo ||

            datos[posicion + 1] !==
                verde ||

            datos[posicion + 2] !==
                azul ||

            datos[posicion + 3] !==
                alfa

        ) {

            continue;

        }


        datos[posicion] =
            nuevoRojo;


        datos[posicion + 1] =
            nuevoVerde;


        datos[posicion + 2] =
            nuevoAzul;


        datos[posicion + 3] =
            255;


        pila.push([
            px + 1,
            py
        ]);


        pila.push([
            px - 1,
            py
        ]);


        pila.push([
            px,
            py + 1
        ]);


        pila.push([
            px,
            py - 1
        ]);

    }


    ctx.putImageData(
        imagen,
        0,
        0
    );

}



// MODO CLARO / OSCURO


const botonModo =
    document.getElementById(
        "modo"
    );


botonModo.addEventListener(
    "click",
    function() {

        document.body.classList.toggle(
            "modo-claro"
        );


        if (
            document.body.classList.contains(
                "modo-claro"
            )
        ) {

            botonModo.textContent =
                "🌙 Modo oscuro";


            localStorage.setItem(
                "modo",
                "claro"
            );

        } else {

            botonModo.textContent =
                "☀️ Modo claro";


            localStorage.setItem(
                "modo",
                "oscuro"
            );

        }

    }
);



// RECORDAR MODO


const modoGuardado =
    localStorage.getItem(
        "modo"
    );


if (
    modoGuardado === "claro"
) {

    document.body.classList.add(
        "modo-claro"
    );


    botonModo.textContent =
        "🌙 Modo oscuro";

}



// INICIAR


function activarBotonGaleria(tipo) {

    const botonMisDibujos =
        document.getElementById("ver-mis-dibujos");

    const botonOtrosDibujos =
        document.getElementById("ver-otros-dibujos");

    if (!botonMisDibujos || !botonOtrosDibujos) {
        return;
    }

    const activo = tipo === "todos";

    botonMisDibujos.classList.toggle("activo", !activo);
    botonOtrosDibujos.classList.toggle("activo", activo);

}


const botonMisDibujos = document.getElementById("ver-mis-dibujos");
const botonOtrosDibujos = document.getElementById("ver-otros-dibujos");
const buscaDibujo = document.getElementById("buscar-dibujo");

if (botonMisDibujos && botonOtrosDibujos) {
    botonMisDibujos.addEventListener(
        "click",
        function() {
            activarBotonGaleria("mis");
            cargarGaleria("mis");
        }
    );

    botonOtrosDibujos.addEventListener(
        "click",
        function() {
            activarBotonGaleria("todos");
            cargarGaleria("todos");
        }
    );
}

if (buscaDibujo) {
    buscaDibujo.addEventListener(
        "input",
        filtrarGaleria
    );
}


if (window.location.pathname.toLowerCase().endsWith("explorar.php")) {
    cargarGaleria("todos");
} else {
    cargarGaleria("mis");
}

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