const canvas = document.getElementById("canvas");

const ctx = canvas.getContext("2d");

const color = document.getElementById("color");

const tamano = document.getElementById("tamano");


let dibujando = false;

let herramienta = "lapiz";


// ==============================
// CONFIGURACIÓN
// ==============================

ctx.lineCap = "round";

ctx.lineJoin = "round";


// ==============================
// POSICIÓN DEL MOUSE
// ==============================

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


// ==============================
// EMPEZAR A DIBUJAR
// ==============================

canvas.addEventListener(
    "pointerdown",
    function(e) {

        const posicion =
            obtenerPosicion(e);


        // CUBETA

        if (herramienta === "cubeta") {

            rellenar(
                posicion.x,
                posicion.y,
                color.value
            );

            return;

        }


        // LÁPIZ / GOMA

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


// ==============================
// DIBUJAR
// ==============================

canvas.addEventListener(
    "pointermove",
    function(e) {

        if (!dibujando) return;


        const posicion =
            obtenerPosicion(e);


        ctx.lineWidth =
            Number(tamano.value);


        if (herramienta === "goma") {

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


// ==============================
// TERMINAR DIBUJO
// ==============================

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


// ==============================
// LÁPIZ
// ==============================

document
    .getElementById("lapiz")
    .addEventListener(
        "click",
        function() {

            herramienta = "lapiz";

        }
    );


// ==============================
// GOMA
// ==============================

document
    .getElementById("goma")
    .addEventListener(
        "click",
        function() {

            herramienta = "goma";

        }
    );


// ==============================
// CUBETA
// ==============================

document
    .getElementById("cubeta")
    .addEventListener(
        "click",
        function() {

            herramienta = "cubeta";

        }
    );


// ==============================
// LIMPIAR
// ==============================

document
    .getElementById("limpiar")
    .addEventListener(
        "click",
        function() {

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


// ==============================
// GUARDAR DIBUJO
// ==============================

document
    .getElementById("guardar")
    .addEventListener(
        "click",
        function() {

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


            const dibujos =
                JSON.parse(
                    localStorage.getItem(
                        "dibujos"
                    ) || "[]"
                );


            // SI ESTAMOS EDITANDO
            if (
                window.dibujoEditando !==
                undefined
            ) {

                dibujos[
                    window.dibujoEditando
                ].nombre = nombre;


                dibujos[
                    window.dibujoEditando
                ].imagen = imagen;


                window.dibujoEditando =
                    undefined;


                alert(
                    "¡Dibujo actualizado! 🎨"
                );

            }

            // SI ES UN DIBUJO NUEVO
            else {

                dibujos.push({

                    nombre: nombre,

                    imagen: imagen,

                    valoracion: 0

                });


                alert(
                    "¡Dibujo guardado! 🎨"
                );

            }


            localStorage.setItem(
                "dibujos",
                JSON.stringify(dibujos)
            );


            nombreInput.value = "";


            cargarGaleria();

        }
    );


// ==============================
// CARGAR GALERÍA
// ==============================

function cargarGaleria() {

    const galeria =
        document.getElementById(
            "galeria"
        );


    const dibujos =
        JSON.parse(
            localStorage.getItem(
                "dibujos"
            ) || "[]"
        );


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


            tarjeta.innerHTML = `

                <img
                    src="${dibujo.imagen}"
                >

                <h3>
                    ${dibujo.nombre}
                </h3>


                <div class="valoracion">

                    <span>
                        Valoración:
                    </span>

                    <div class="estrellas">

                        ${crearEstrellas(
                            indice,
                            dibujo.valoracion || 0
                        )}

                    </div>

                </div>


                <button
                    onclick="editarDibujo(${indice})"
                >
                    ✏️ Editar
                </button>


                <button
                    onclick="descargarDibujo(${indice})"
                >
                    📥 Descargar
                </button>


                <button
                    onclick="eliminarDibujo(${indice})"
                >
                    🗑️ Eliminar
                </button>

            `;


            galeria.appendChild(
                tarjeta
            );

        }
    );

}


// ==============================
// CREAR ESTRELLAS
// ==============================

function crearEstrellas(
    indice,
    valoracion
) {

    let resultado = "";


    for (
        let i = 1;
        i <= 5;
        i++
    ) {

        if (i <= valoracion) {

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


// ==============================
// VALORAR DIBUJO
// ==============================

function valorarDibujo(
    indice,
    valor
) {

    const dibujos =
        JSON.parse(
            localStorage.getItem(
                "dibujos"
            ) || "[]"
        );


    dibujos[indice].valoracion =
        valor;


    localStorage.setItem(
        "dibujos",
        JSON.stringify(dibujos)
    );


    cargarGaleria();

}


// ==============================
// EDITAR DIBUJO
// ==============================

function editarDibujo(indice) {

    const dibujos =
        JSON.parse(
            localStorage.getItem(
                "dibujos"
            ) || "[]"
        );


    const dibujo =
        dibujos[indice];


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


// ==============================
// DESCARGAR
// ==============================

function descargarDibujo(
    indice
) {

    const dibujos =
        JSON.parse(
            localStorage.getItem(
                "dibujos"
            ) || "[]"
        );


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


// ==============================
// ELIMINAR
// ==============================

function eliminarDibujo(
    indice
) {

    const dibujos =
        JSON.parse(
            localStorage.getItem(
                "dibujos"
            ) || "[]"
        );


    if (
        confirm(
            "¿Querés eliminar este dibujo?"
        )
    ) {

        dibujos.splice(
            indice,
            1
        );


        localStorage.setItem(
            "dibujos",
            JSON.stringify(dibujos)
        );


        cargarGaleria();

    }

}


// ==============================
// CUBETA DE PINTURA
// ==============================

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


    // CONVERTIR COLOR

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


    // MISMO COLOR

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


        // LÍMITES

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


        // COMPROBAR COLOR

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


        // CAMBIAR COLOR

        datos[posicion] =
            nuevoRojo;


        datos[posicion + 1] =
            nuevoVerde;


        datos[posicion + 2] =
            nuevoAzul;


        datos[posicion + 3] =
            255;


        // VECINOS

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


// ==============================
// INICIAR GALERÍA
// ==============================

cargarGaleria();