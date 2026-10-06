CREATE DATABASE IF NOT EXISTS drawery
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE drawery;


-- =========================================
-- USUARIOS
-- =========================================

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    contraseña VARCHAR(255) NOT NULL,
    foto_perfil LONGTEXT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================================
-- DIBUJOS
-- =========================================

CREATE TABLE dibujos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    imagen LONGTEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
);


-- =========================================
-- VALORACIONES
-- =========================================

CREATE TABLE valoraciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dibujo_id INT NOT NULL,
    usuario_id INT NOT NULL,
    estrellas INT NOT NULL,

    FOREIGN KEY (dibujo_id)
        REFERENCES dibujos(id)
        ON DELETE CASCADE,

    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    -- Un usuario solamente puede valorar
    -- una vez cada dibujo
    UNIQUE (dibujo_id, usuario_id),

    -- Solo permite valores de 1 a 5
    CHECK (estrellas BETWEEN 1 AND 5)
);


-- =========================================
-- ME GUSTA
-- =========================================

CREATE TABLE me_gusta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dibujo_id INT NOT NULL,
    usuario_id INT NOT NULL,

    FOREIGN KEY (dibujo_id)
        REFERENCES dibujos(id)
        ON DELETE CASCADE,

    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    -- Un usuario no puede dar dos likes
    UNIQUE (dibujo_id, usuario_id)
);
