import { getDbPool } from "../database/connection";

//interface para definir la estructura de un cliente
export interface Cliente {
    id?: number;
    razon_social: string;
    nombre_comercial: string;
    rfc: string;
    correo: string;
    telefono: string;
}

export const ClienteModel = {
    findAll,
    findById,
    create,
    update,
    remove
};

//funciones para interactuar con la base de datos

//query para obtener todos los clientes
async function findAll() {
    const pool = await getDbPool();
    const result = await pool.query("SELECT * FROM clientes");
    return result.rows;
}

//query para obtener un cliente por su id
async function findById(id: number) {
    const pool = await getDbPool();
    const result = await pool.query(`
        SELECT 
        c.id,
        c.razon_social,
        c.nombre_comercial,
        c.rfc,
        c.correo,
        c.telefono,
        c.created_at,
        COALESCE(
            json_agg(
                json_build_object(
                    'id', d.id,
                    'domicilio', d.domicilio,
                    'colonia', d.colonia,
                    'municipio', d.municipio,
                    'estado', d.estado,
                    'tipo', d.tipo
                )
            ) FILTER (WHERE d.id IS NOT NULL),
            '[]'
        ) AS domicilios
    FROM clientes c
    LEFT JOIN domicilios d 
        ON d.cliente_id = c.id
    WHERE c.id = $1
    GROUP BY c.id;`, [id]);
    return result.rows[0] || null;
}

//query para insertar un nuevo cliente
async function create(cliente: Cliente) {
    const pool = await getDbPool();
    const result = await pool.query(
        "INSERT INTO clientes (razon_social, nombre_comercial, rfc, correo, telefono) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [cliente.razon_social, cliente.nombre_comercial, cliente.rfc, cliente.correo, cliente.telefono]
    );
    return result.rows[0];
}

//query para actualizar un cliente existente
async function update(id: number, cliente: Cliente) {
    const fields = [];
    const values = [];
    let i = 1;

    for (const [key, value] of Object.entries(cliente)) {
        fields.push(`${key} = $${i}`);
        values.push(value);
        i++;
    }

    values.push(id);

    const query = `
    UPDATE clientes 
    SET ${fields.join(", ")} 
    WHERE id = $${i}
    RETURNING *;
    `;

    const pool = await getDbPool();
    const result = await pool.query(query, values);
    return result.rows[0];
}

//query para eliminar un cliente por su id
async function remove(id: number) {
    const pool = await getDbPool();
    const result = await pool.query("DELETE FROM clientes WHERE id = $1 RETURNING *", [id]);
    return result.rows[0] || null;
}