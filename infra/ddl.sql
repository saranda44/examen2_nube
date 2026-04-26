CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    razon_social TEXT NOT NULL,
    nombre_comercial TEXT NOT NULL,
    rfc TEXT UNIQUE NOT NULL,
    correo TEXT NOT NULL,
    telefono TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE domicilios (
    id SERIAL PRIMARY KEY,
    cliente_id INT NOT NULL,
    domicilio TEXT NOT NULL,
    colonia TEXT NOT NULL,
    municipio TEXT NOT NULL,
    estado TEXT NOT NULL,
    tipo VARCHAR(15) NOT NULL CHECK (tipo IN ('FACTURACION','ENVIO')),
    
    CONSTRAINT fk_domicilio_cliente
        FOREIGN KEY (cliente_id)
        REFERENCES clientes(id)
        ON DELETE CASCADE
);

CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    unidad_medida TEXT NOT NULL,
    precio_base NUMERIC(10,2) NOT NULL CHECK (precio_base >= 0)
);

CREATE TABLE notas (
    id SERIAL PRIMARY KEY,
    folio TEXT UNIQUE NOT NULL,
    cliente_id INT NOT NULL,
    direccion_facturacion_id INT NOT NULL,
    direccion_envio_id INT NOT NULL,
    total NUMERIC(10,2) NOT NULL CHECK (total >= 0),
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT fk_nota_cliente
        FOREIGN KEY (cliente_id)
        REFERENCES clientes(id),

    CONSTRAINT fk_nota_dir_fact
        FOREIGN KEY (direccion_facturacion_id)
        REFERENCES domicilios(id),

    CONSTRAINT fk_nota_dir_env
        FOREIGN KEY (direccion_envio_id)
        REFERENCES domicilios(id)
);

CREATE TABLE nota_detalle (
    id SERIAL PRIMARY KEY,
    nota_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10,2) NOT NULL CHECK (precio_unitario >= 0),
    importe NUMERIC(10,2) NOT NULL CHECK (importe >= 0),

    CONSTRAINT fk_detalle_nota
        FOREIGN KEY (nota_id)
        REFERENCES notas(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_detalle_producto
        FOREIGN KEY (producto_id)
        REFERENCES productos(id)
);

CREATE INDEX idx_detalle_nota ON nota_detalle(nota_id);
CREATE INDEX idx_detalle_producto ON nota_detalle(producto_id);