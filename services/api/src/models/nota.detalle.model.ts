import { getDbPool } from "../database/connection";
import { PoolClient } from "pg";

export interface NotaDetalle {
  id?: number;
  nota_id?: number;
  producto_id: number;
  cantidad: number;
  precio_unitario?: number;
  importe?: number;
}

export const NotaDetalleModel = {
  create
};

//query para crear lo detalles de una nota
async function create(notaDetalle: NotaDetalle, client?: PoolClient) {
  const db = client ?? await getDbPool();
  await db.query(
    `INSERT INTO nota_detalle
        (nota_id, producto_id, cantidad, precio_unitario, importe)
        VALUES ($1,$2,$3,$4,$5)`,
    [notaDetalle.nota_id, notaDetalle.producto_id, notaDetalle.cantidad, notaDetalle.precio_unitario, notaDetalle.importe]
  );
}
