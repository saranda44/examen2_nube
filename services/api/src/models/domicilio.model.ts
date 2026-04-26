import { getDbPool } from "../database/connection";

//interface para definir la estructura de un domicilio
export interface Domicilio {
    id?: number;
    cliente_id: number;
    domicilio: string;
    colonia: string;
    municipio: string;
    estado: string;
    tipo: "FACTURACION" | "ENVIO";

}

export const DomicilioModel = {
    findAll,
    findById,
    findByIdCliente,
    create,
    update,
    remove
};

//query para obtener todos los domicilios
async function findAll() {
    const pool = await getDbPool();
    const result = await pool.query("SELECT * FROM domicilios");
    return result.rows;
}

//query para obtener un domicilio por su id
async function findById(id: number) {
    const pool = await getDbPool();
    const result = await pool.query("SELECT * FROM domicilios WHERE id = $1", [id]);
    return result.rows[0] || null;
}


//query para obtener los domicilios de un cliente por su id
async function findByIdCliente(cliente_id: number) {
    const pool = await getDbPool();
    const result = await pool.query("SELECT * FROM domicilios WHERE cliente_id = $1", [cliente_id]);
    return result.rows;
}

//query para insertar un nuevo domicilio
async function create(domicilio: Domicilio) {
    const pool = await getDbPool();
    const result = await pool.query(
        "INSERT INTO domicilios (cliente_id, domicilio, colonia, municipio, estado, tipo) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [domicilio.cliente_id, domicilio.domicilio, domicilio.colonia, domicilio.municipio, domicilio.estado, domicilio.tipo]
    );
    return result.rows[0];
}

//query para actualizar un domicilio existente
async function update(id: number, domicilio: Domicilio) {
    const fields = [];
    const values = [];
    let i = 1;

    for (const [key, value] of Object.entries(domicilio)) {
        fields.push(`${key} = $${i}`);
        values.push(value);
        i++;
    }

    values.push(id);

    const query = `
    UPDATE domicilios 
    SET ${fields.join(", ")} 
    WHERE id = $${i}
    RETURNING *;
    `;

    const pool = await getDbPool();
    const result = await pool.query(query, values);
    return result.rows[0];
}

//query para eliminar un domicilio por su id
async function remove(id: number) {
    const pool = await getDbPool();
    const result = await pool.query("DELETE FROM domicilios WHERE id = $1 RETURNING *", [id]);
    return result.rows[0] || null;
}