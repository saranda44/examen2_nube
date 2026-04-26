import { getDbPool } from "../database/connection";
import { PoolClient } from "pg";

//interface para definir la estructura de un producto
export interface Producto {
    id?: number;
    nombre: string;
    unidad_medida: string;
    precio_base: number;
}
export const ProductoModel = {
    findAll,
    findById,
    create,
    update,
    remove
};

//query para obtener todos los productos
async function findAll() {
    const pool = await getDbPool();
    const result = await pool.query("SELECT * FROM productos");
    return result.rows;
}

//query para obtener un producto por su id
async function findById(id: number, client?: PoolClient) {
    const db = client ?? await getDbPool();
    const result = await db.query("SELECT * FROM productos WHERE id = $1", [id]);
    return result.rows[0] || null;
}

//query para insertar un nuevo producto
async function create(producto: Producto) {
    const pool = await getDbPool();
    const result = await pool.query(
        "INSERT INTO productos (nombre, unidad_medida, precio_base) VALUES ($1, $2, $3) RETURNING *",
        [producto.nombre, producto.unidad_medida, producto.precio_base]
    );
    return result.rows[0];
}

//query para actualizar un producto existente
async function update(id: number, producto: Producto) {
    const fields = [];
    const values = [];
    let i = 1;

    for (const [key, value] of Object.entries(producto)) {
        fields.push(`${key} = $${i}`);
        values.push(value);
        i++;
    }

    values.push(id);

    const query = `
    UPDATE productos 
    SET ${fields.join(", ")} 
    WHERE id = $${i}
    RETURNING *;
    `;

    const pool = await getDbPool();
    const result = await pool.query(query, values);
    return result.rows[0];
}

//query para eliminar un producto por su id
async function remove(id: number) {
    const pool = await getDbPool();
    const result = await pool.query("DELETE FROM productos WHERE id = $1 RETURNING *", [id]);
    return result.rows[0] || null;
}