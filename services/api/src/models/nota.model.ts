import { getDbPool } from "../database/connection";
import { PoolClient } from "pg";

export interface Nota {
  id?: number;
  folio?: string;
  cliente_id: number;
  direccion_facturacion_id: number;
  direccion_envio_id: number;
  total?: number;
}
export const NotaModel = {
  create,
  updateTotal,
  findById
};

//query para obtener nota, detalle, cliente, domicilios y productos
async function findById(id: number) {
  const pool = await getDbPool();
  const result = await pool.query(
    `SELECT 
        n.id,
        n.folio,
        n.total,
        n.created_at,

        -- Cliente
        json_build_object(
            'id', c.id,
            'razon_social', c.razon_social,
            'nombre_comercial', c.nombre_comercial,
            'rfc', c.rfc,
            'correo', c.correo,
            'telefono', c.telefono
        ) AS cliente,

        -- Dirección de facturación
        json_build_object(
            'id', df.id,
            'domicilio', df.domicilio,
            'colonia', df.colonia,
            'municipio', df.municipio,
            'estado', df.estado,
            'tipo', df.tipo
        ) AS direccion_facturacion,

        -- Dirección de envío
        json_build_object(
            'id', de.id,
            'domicilio', de.domicilio,
            'colonia', de.colonia,
            'municipio', de.municipio,
            'estado', de.estado,
            'tipo', de.tipo
        ) AS direccion_envio,

        -- Detalle
        COALESCE(
            json_agg(
                json_build_object(
                    'id', nd.id,
                    'producto_id', p.id,
                    'producto', p.nombre,
                    'unidad_medida', p.unidad_medida,
                    'cantidad', nd.cantidad,
                    'precio_unitario', nd.precio_unitario,
                    'importe', nd.importe
                )
            ) FILTER (WHERE nd.id IS NOT NULL),
            '[]'
        ) AS detalle

    FROM notas n

    INNER JOIN clientes c 
        ON c.id = n.cliente_id

    INNER JOIN domicilios df 
        ON df.id = n.direccion_facturacion_id

    INNER JOIN domicilios de 
        ON de.id = n.direccion_envio_id

    LEFT JOIN nota_detalle nd 
        ON nd.nota_id = n.id

    LEFT JOIN productos p 
        ON p.id = nd.producto_id

    WHERE n.id = $1

    GROUP BY 
        n.id,
        c.id,
        df.id,
        de.id;`,
    [id]
  );
  return result.rows[0];
}

//query para crear nota base
//total inicial = 0
async function create(nota: Nota, client?: PoolClient) {
  const db = client ?? await getDbPool();
  const result = await db.query(
    `INSERT INTO notas 
       (folio, cliente_id, direccion_facturacion_id, direccion_envio_id, total)
       VALUES ($1,$2,$3,$4, 0)
       RETURNING id`,
    [nota.folio, nota.cliente_id, nota.direccion_facturacion_id, nota.direccion_envio_id]
  );

  return result.rows[0];
}

//query para actalizar el total
async function updateTotal(notaId: number, total: number, client?: PoolClient) {
  const db = client ?? await getDbPool();
  await db.query(
    "UPDATE notas SET total = $1 WHERE id = $2",
    [total, notaId]
  );
}