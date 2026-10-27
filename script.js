const canvas = document.getElementById("canvas");

const ctx = canvas.getContext("2d");

const color = document.getElementById("color");

const tamano = document.getElementById("tamano");

const contenedorLienzo = document.createElement("div");
contenedorLienzo.className = "lienzo-contenedor";
canvas.parentNode.insertBefore(contenedorLienzo, canvas);
contenedorLienzo.appendChild(canvas);

const capaSeleccion = document.createElement("canvas");
capaSeleccion.className = "lienzo-seleccion";
capaSeleccion.width = canvas.width;
capaSeleccion.height = canvas.height;
contenedorLienzo.appendChild(capaSeleccion);

const ctxSeleccion = capaSeleccion.getContext("2d");


let dibujos = [];

let dibujando = false;

let herramienta = "lapiz";

let galeriaActual = "mis";

let seleccion = null;
let rectanguloSeleccion = null;
let accionSeleccion = null;


function actualizarCursor() {

    if (herramienta === "cubeta") {
        canvas.style.cursor = "crosshair";
        return;
    }

    if (herramienta === "seleccionar") {
        canvas.style.cursor = "crosshair";
        return;
    }

    if (herramienta === "cubeta" || herramienta === "texto") {
        canvas.style.cursor = "crosshair";
        return;
    }

    const escala = canvas.clientWidth / canvas.width;
    const tamanoCursor = Math.max(
        4,
        Math.min(64, Math.round(Number(tamano.value) * escala))
    );
    const margen = tamanoCursor >= 8 ? 2.5 : 1;
    const figura = herramienta === "goma"
        ? `<rect x="1" y="1" width="${tamanoCursor - 2}" height="${tamanoCursor - 2}" rx="0.5"/>`
        : `<circle cx="${tamanoCursor / 2}" cy="${tamanoCursor / 2}" r="${(tamanoCursor - 2) / 2}"/>`;
    const figuraInterior = tamanoCursor < 12
        ? ""
        : herramienta === "goma"
            ? `<rect x="${margen}" y="${margen}" width="${tamanoCursor - margen * 2}" height="${tamanoCursor - margen * 2}"/>`
            : `<circle cx="${tamanoCursor / 2}" cy="${tamanoCursor / 2}" r="${(tamanoCursor - margen * 2) / 2}"/>`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${tamanoCursor}" height="${tamanoCursor}" viewBox="0 0 ${tamanoCursor} ${tamanoCursor}"><g fill="white" fill-opacity=".45" stroke="black" stroke-width="1.5">${figura}</g><g fill="none" stroke="white" stroke-width=".7">${figuraInterior}</g></svg>`;
    const imagenCursor = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    const puntoCaliente = Math.floor(tamanoCursor / 2);

    canvas.style.cursor = `url("${imagenCursor}") ${puntoCaliente} ${puntoCaliente}, crosshair`;
}


tamano.addEventListener("input", actualizarCursor);
window.addEventListener("resize", actualizarCursor);
actualizarCursor();



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

            confirmarSeleccion();

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

            confirmarSeleccion();

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
            (e.clientX - rect.left - canvas.clientLeft) *
            (canvas.width / canvas.clientWidth)
        ),

        y: Math.floor(
            (e.clientY - rect.top - canvas.clientTop) *
            (canvas.height / canvas.clientHeight)
        )

    };

}


function dibujarCapaSeleccion() {

    ctxSeleccion.clearRect(0, 0, capaSeleccion.width, capaSeleccion.height);

    if (seleccion) {
        ctxSeleccion.drawImage(
            seleccion.imagen,
            seleccion.x,
            seleccion.y,
            seleccion.ancho,
            seleccion.alto
        );

        ctxSeleccion.save();
        ctxSeleccion.setLineDash([6, 4]);
        ctxSeleccion.lineWidth = 1;
        ctxSeleccion.strokeStyle = "#ffffff";
        ctxSeleccion.strokeRect(seleccion.x, seleccion.y, seleccion.ancho, seleccion.alto);
        ctxSeleccion.setLineDash([6, 4]);
        ctxSeleccion.lineDashOffset = 6;
        ctxSeleccion.strokeStyle = "#111111";
        ctxSeleccion.strokeRect(seleccion.x, seleccion.y, seleccion.ancho, seleccion.alto);
        ctxSeleccion.restore();

        const tamanoManija = 10;
        const esquinas = [
            [seleccion.x, seleccion.y],
            [seleccion.x + seleccion.ancho, seleccion.y],
            [seleccion.x, seleccion.y + seleccion.alto],
            [seleccion.x + seleccion.ancho, seleccion.y + seleccion.alto]
        ];

        ctxSeleccion.fillStyle = "#ffffff";
        ctxSeleccion.strokeStyle = "#111111";
        ctxSeleccion.lineWidth = 1.5;
        esquinas.forEach(([x, y]) => {
            ctxSeleccion.fillRect(x - tamanoManija / 2, y - tamanoManija / 2, tamanoManija, tamanoManija);
            ctxSeleccion.strokeRect(x - tamanoManija / 2, y - tamanoManija / 2, tamanoManija, tamanoManija);
        });
    }

    if (rectanguloSeleccion) {
        const x = Math.min(rectanguloSeleccion.inicioX, rectanguloSeleccion.finX);
        const y = Math.min(rectanguloSeleccion.inicioY, rectanguloSeleccion.finY);
        const ancho = Math.abs(rectanguloSeleccion.finX - rectanguloSeleccion.inicioX);
        const alto = Math.abs(rectanguloSeleccion.finY - rectanguloSeleccion.inicioY);

        ctxSeleccion.save();
        ctxSeleccion.setLineDash([5, 3]);
        ctxSeleccion.strokeStyle = "#111111";
        ctxSeleccion.strokeRect(x, y, ancho, alto);
        ctxSeleccion.lineDashOffset = 4;
        ctxSeleccion.strokeStyle = "#ffffff";
        ctxSeleccion.strokeRect(x, y, ancho, alto);
        ctxSeleccion.restore();
    }
}


function confirmarSeleccion() {

    if (seleccion) {
        ctx.drawImage(seleccion.imagen, seleccion.x, seleccion.y, seleccion.ancho, seleccion.alto);
        seleccion = null;
        dibujarCapaSeleccion();
    }
}


function escalarSeleccion(factor) {

    if (!seleccion) return;

    const ancho = Math.max(1, seleccion.ancho * factor);
    const alto = Math.max(1, seleccion.alto * factor);
    seleccion.x -= (ancho - seleccion.ancho) / 2;
    seleccion.y -= (alto - seleccion.alto) / 2;
    seleccion.ancho = ancho;
    seleccion.alto = alto;
    dibujarCapaSeleccion();
}



// EMPEZAR A DIBUJAR


canvas.addEventListener(
    "pointerdown",
    function(e) {

        const posicion =
            obtenerPosicion(e);

        if (herramienta === "seleccionar") {
            canvas.setPointerCapture(e.pointerId);

            if (seleccion) {
                const esquinas = [
                    { x: seleccion.x, y: seleccion.y, tipo: "arriba-izquierda" },
                    { x: seleccion.x + seleccion.ancho, y: seleccion.y, tipo: "arriba-derecha" },
                    { x: seleccion.x, y: seleccion.y + seleccion.alto, tipo: "abajo-izquierda" },
                    { x: seleccion.x + seleccion.ancho, y: seleccion.y + seleccion.alto, tipo: "abajo-derecha" }
                ];
                const manija = esquinas.find(esquina =>
                    Math.abs(posicion.x - esquina.x) <= 12 &&
                    Math.abs(posicion.y - esquina.y) <= 12
                );

                if (manija) {
                    accionSeleccion = {
                        tipo: "redimensionar",
                        esquina: manija.tipo,
                        x: posicion.x,
                        y: posicion.y,
                        seleccion: { ...seleccion }
                    };
                } else if (
                    posicion.x >= seleccion.x &&
                    posicion.x <= seleccion.x + seleccion.ancho &&
                    posicion.y >= seleccion.y &&
                    posicion.y <= seleccion.y + seleccion.alto
                ) {
                    accionSeleccion = {
                        tipo: "mover",
                        x: posicion.x,
                        y: posicion.y,
                        seleccion: { ...seleccion }
                    };
                } else {
                    confirmarSeleccion();
                    rectanguloSeleccion = {
                        inicioX: posicion.x,
                        inicioY: posicion.y,
                        finX: posicion.x,
                        finY: posicion.y
                    };
                    accionSeleccion = { tipo: "marcar" };
                }
            } else {
                rectanguloSeleccion = {
                    inicioX: posicion.x,
                    inicioY: posicion.y,
                    finX: posicion.x,
                    finY: posicion.y
                };
                accionSeleccion = { tipo: "marcar" };
            }

            dibujarCapaSeleccion();
            return;
        }

        if (herramienta === "texto") {
            const texto = prompt("Escribe el texto para agregar al dibujo:");
            if (!texto) return;

            const tamanoTexto = Math.max(12, Number(tamano.value) * 4);
            guardarEstado();
            historialFuturo = [];
            ctx.save();
            ctx.fillStyle = color.value;
            ctx.font = `${tamanoTexto}px Arial, sans-serif`;
            ctx.textBaseline = "top";
            texto.split("\n").forEach((linea, indice) => {
                ctx.fillText(linea, posicion.x, posicion.y + indice * tamanoTexto * 1.2);
            });
            ctx.restore();
            return;
        }


        // CUBETA

        if (
            herramienta === "cubeta"
        ) {

            if (
                posicion.x < 0 ||
                posicion.y < 0 ||
                posicion.x >= canvas.width ||
                posicion.y >= canvas.height
            ) {
                return;
            }

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

        if (herramienta === "seleccionar" && accionSeleccion) {
            const posicion = obtenerPosicion(e);

            if (accionSeleccion.tipo === "marcar") {
                rectanguloSeleccion.finX = posicion.x;
                rectanguloSeleccion.finY = posicion.y;
            } else if (accionSeleccion.tipo === "mover") {
                seleccion.x = accionSeleccion.seleccion.x + posicion.x - accionSeleccion.x;
                seleccion.y = accionSeleccion.seleccion.y + posicion.y - accionSeleccion.y;
            } else {
                const original = accionSeleccion.seleccion;
                const deltaX = posicion.x - accionSeleccion.x;
                const deltaY = posicion.y - accionSeleccion.y;
                let ancho = original.ancho;
                let alto = original.alto;
                let x = original.x;
                let y = original.y;

                if (accionSeleccion.esquina.includes("derecha")) ancho += deltaX;
                else {
                    ancho -= deltaX;
                    x += deltaX;
                }

                if (accionSeleccion.esquina.includes("abajo")) alto += deltaY;
                else {
                    alto -= deltaY;
                    y += deltaY;
                }

                if (ancho > 4 && alto > 4) {
                    seleccion.x = x;
                    seleccion.y = y;
                    seleccion.ancho = ancho;
                    seleccion.alto = alto;
                }
            }

            dibujarCapaSeleccion();
            return;
        }

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

        if (herramienta === "seleccionar" && accionSeleccion) {
            if (accionSeleccion.tipo === "marcar" && rectanguloSeleccion) {
                const x = Math.max(0, Math.min(rectanguloSeleccion.inicioX, rectanguloSeleccion.finX));
                const y = Math.max(0, Math.min(rectanguloSeleccion.inicioY, rectanguloSeleccion.finY));
                const derecha = Math.min(canvas.width, Math.max(rectanguloSeleccion.inicioX, rectanguloSeleccion.finX));
                const abajo = Math.min(canvas.height, Math.max(rectanguloSeleccion.inicioY, rectanguloSeleccion.finY));
                const ancho = Math.floor(derecha - x);
                const alto = Math.floor(abajo - y);

                if (ancho > 1 && alto > 1) {
                    guardarEstado();
                    historialFuturo = [];
                    const imagenSeleccionada = document.createElement("canvas");
                    imagenSeleccionada.width = ancho;
                    imagenSeleccionada.height = alto;
                    imagenSeleccionada.getContext("2d").drawImage(canvas, x, y, ancho, alto, 0, 0, ancho, alto);
                    ctx.clearRect(x, y, ancho, alto);
                    seleccion = { imagen: imagenSeleccionada, x, y, ancho, alto };
                }
            }

            rectanguloSeleccion = null;
            accionSeleccion = null;
            dibujarCapaSeleccion();
            return;
        }

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

            confirmarSeleccion();
            herramienta = "lapiz";
            actualizarCursor();

        }
    );



// GOMA

document
    .getElementById("goma")
    .addEventListener(
        "click",
        function() {

            confirmarSeleccion();
            herramienta = "goma";
            actualizarCursor();

        }
    );



// CUBETA


document
    .getElementById("cubeta")
    .addEventListener(
        "click",
        function() {

            confirmarSeleccion();
            herramienta = "cubeta";
            actualizarCursor();

        }
    );


document.getElementById("texto").addEventListener("click", function() {
    confirmarSeleccion();
    herramienta = "texto";
    actualizarCursor();
});


document.getElementById("seleccionar").addEventListener("click", function() {
    confirmarSeleccion();
    herramienta = "seleccionar";
    actualizarCursor();
});

document.getElementById("agrandar-seleccion").addEventListener("click", function() {
    escalarSeleccion(1.1);
});

document.getElementById("achicar-seleccion").addEventListener("click", function() {
    escalarSeleccion(0.9);
});



// LIMPIAR


document
    .getElementById("limpiar")
    .addEventListener(
        "click",
        function() {

            confirmarSeleccion();

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

            confirmarSeleccion();

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


    const rojo = datos[inicio];
    const verde = datos[inicio + 1];
    const azul = datos[inicio + 2];
    const alfa = datos[inicio + 3];


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


    if (rojo === nuevoRojo && verde === nuevoVerde && azul === nuevoAzul && alfa === 255) {
        return;
    }


    const tolerancia = 24;
    const coincide = posicion =>
        Math.abs(datos[posicion] - rojo) <= tolerancia &&
        Math.abs(datos[posicion + 1] - verde) <= tolerancia &&
        Math.abs(datos[posicion + 2] - azul) <= tolerancia &&
        Math.abs(datos[posicion + 3] - alfa) <= tolerancia;
    const pila = [[x, y]];

    while (pila.length > 0) {
        const [semillaX, semillaY] = pila.pop();
        const indiceSemilla = (semillaY * canvas.width + semillaX) * 4;

        if (!coincide(indiceSemilla)) {
            continue;
        }

        let izquierda = semillaX;
        let derecha = semillaX;

        while (izquierda > 0 && coincide((semillaY * canvas.width + izquierda - 1) * 4)) {
            izquierda--;
        }

        while (derecha < canvas.width - 1 && coincide((semillaY * canvas.width + derecha + 1) * 4)) {
            derecha++;
        }

        let buscarArriba = true;
        let buscarAbajo = true;

        for (let px = izquierda; px <= derecha; px++) {
            const posicion = (semillaY * canvas.width + px) * 4;

            datos[posicion] = nuevoRojo;
            datos[posicion + 1] = nuevoVerde;
            datos[posicion + 2] = nuevoAzul;
            datos[posicion + 3] = 255;

            if (semillaY > 0) {
                const arriba = posicion - canvas.width * 4;
                if (coincide(arriba)) {
                    if (buscarArriba) pila.push([px, semillaY - 1]);
                    buscarArriba = false;
                } else {
                    buscarArriba = true;
                }
            }

            if (semillaY < canvas.height - 1) {
                const abajo = posicion + canvas.width * 4;
                if (coincide(abajo)) {
                    if (buscarAbajo) pila.push([px, semillaY + 1]);
                    buscarAbajo = false;
                } else {
                    buscarAbajo = true;
                }
            }
        }
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


async function copiarLienzo() {

    confirmarSeleccion();

    if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
        alert("Tu navegador no permite copiar imágenes desde esta página.");
        return;
    }

    try {
        const imagen = await new Promise((resolver, rechazar) => {
            canvas.toBlob(blob => {
                if (blob) resolver(blob);
                else rechazar(new Error("No se pudo crear la imagen."));
            }, "image/png");
        });

        await navigator.clipboard.write([
            new ClipboardItem({ "image/png": imagen })
        ]);
    } catch (error) {
        alert("No se pudo copiar la imagen. Revisa los permisos del portapapeles del navegador.");
    }
}


function colocarImagenEnLienzo(imagen) {

    const escala = Math.min(
        canvas.width / imagen.width,
        canvas.height / imagen.height,
        1
    );
    const ancho = imagen.width * escala;
    const alto = imagen.height * escala;
    const x = (canvas.width - ancho) / 2;
    const y = (canvas.height - alto) / 2;

    guardarEstado();
    historialFuturo = [];
    ctx.drawImage(imagen, x, y, ancho, alto);
    canvas.focus({ preventScroll: true });
}


function cargarImagenArchivo(archivo) {
    if (typeof createImageBitmap === "function") {
        return createImageBitmap(archivo);
    }

    return new Promise((resolver, rechazar) => {
        const imagen = new Image();
        const url = URL.createObjectURL(archivo);

        imagen.onload = function() {
            URL.revokeObjectURL(url);
            resolver(imagen);
        };
        imagen.onerror = function() {
            URL.revokeObjectURL(url);
            rechazar(new Error("No se pudo cargar la imagen."));
        };
        imagen.src = url;
    });
}


async function pegarImagenDelPortapapeles() {

    if (!navigator.clipboard?.read || typeof createImageBitmap === "undefined") {
        alert("Tu navegador no permite pegar imágenes desde el portapapeles.");
        return;
    }

    try {
        const elementos = await navigator.clipboard.read();

        for (const elemento of elementos) {
            const tipoImagen = elemento.types.find(tipo => tipo.startsWith("image/"));
            if (!tipoImagen) continue;

            const bitmap = await createImageBitmap(await elemento.getType(tipoImagen));
            colocarImagenEnLienzo(bitmap);
            bitmap.close();
            return;
        }

        alert("El portapapeles no contiene una imagen.");
    } catch (error) {
        alert("No se pudo leer la imagen. Revisa los permisos del portapapeles del navegador.");
    }
}


document.getElementById("copiar-imagen").addEventListener("click", copiarLienzo);
document.getElementById("pegar-imagen").addEventListener("click", pegarImagenDelPortapapeles);

const selectorImagen = document.getElementById("archivo-imagen");
document.getElementById("abrir-imagen").addEventListener("click", function() {
    selectorImagen.click();
});

selectorImagen.addEventListener("change", async function() {
    const archivo = selectorImagen.files[0];
    if (!archivo) return;

    try {
        const bitmap = await cargarImagenArchivo(archivo);
        colocarImagenEnLienzo(bitmap);
        bitmap.close?.();
    } catch (error) {
        alert("No se pudo abrir esa imagen.");
    }

    selectorImagen.value = "";
});

canvas.addEventListener("copy", function(e) {
    e.preventDefault();
    copiarLienzo();
});

canvas.addEventListener("paste", async function(e) {
    const itemImagen = Array.from(e.clipboardData?.items || [])
        .find(item => item.type.startsWith("image/"));

    if (!itemImagen) return;

    e.preventDefault();

    try {
        const bitmap = await createImageBitmap(itemImagen.getAsFile());
        colocarImagenEnLienzo(bitmap);
        bitmap.close();
    } catch (error) {
        alert("No se pudo pegar esa imagen en el lienzo.");
    }
});