import { NotaDetalleModel } from "../models/nota.detalle.model";
import { NotaModel } from "../models/nota.model";
import { ProductoModel } from "../models/producto.model";
import { publishNoteCreated } from "./sqs.service";
import { descargarPDF as descargaPDFS3 } from "./s3.service";
import { getDbPool } from "../database/connection";

export const NotaService = {
    findById,
    createNota,
    descargarPDF
};

//funcion para leer una nota por su id regresa un json
//nota, detalle, cliente, domicilios y productos
async function findById(id: number) {
    const result = await NotaModel.findById(id);
    return result;
}

// Metodo para crear una nota con sus detalles
//recibe un objeto nota con los datos principales y un arreglo de detalles con los productos y cantidades
async function createNota(nota: any, detalles: any[]) {
    const pool = await getDbPool();
    const client = await pool.connect();

    try{
        await client.query('BEGIN'); // Iniciar transacción
        // 1. Crear la nota base
        nota.folio = `FOLIO-${Date.now()}`;
        const createdNota = await NotaModel.create(nota, client);
        const notaId = createdNota.id;

        let totalNota = 0; // Variable para ir acumulando el total

        // 2. Iterar sobre los detalles (producto_id y cantidad)
        for (const detalle of detalles) {
            detalle.nota_id = notaId;
    
            //obtener el precio unitario del producto
            const producto = await ProductoModel.findById(detalle.producto_id, client);
            if (!producto) {
                throw new Error("Producto no encontrado");
            }
            detalle.precio_unitario = producto.precio_base;
    
            // CALCULAR IMPORTE: cantidad x precio_unitario
            detalle.importe = detalle.cantidad * detalle.precio_unitario;
    
            // ACUMULAR AL TOTAL DE LA NOTA
            totalNota += detalle.importe;
    
            // Crear el registro del detalle en la DB
            await NotaDetalleModel.create(detalle, client);
        }
        // 3. Actualizar el total en la nota base
        await NotaModel.updateTotal(notaId, totalNota, client);

        await client.query('COMMIT');

        // 4. Publicar mensaje a SQS para indicar que se creó una nota nueva
        try {
            await publishNoteCreated(notaId);
            console.log("Mensaje NOTA_CREATED enviado a SQS");
        } catch (error) {
            console.error("Error publicando mensaje a SQS:", error);
        }

        // 5. Regresar la nota completa
        const notaCompleta = await NotaModel.findById(notaId);

        return notaCompleta;

    }
    catch (error) {
        await client.query('ROLLBACK');
        console.error("Error creando nota:", error);
        throw error;
    }
    finally {
        client.release();
    }
}

// Método para endpoint de descarga
async function descargarPDF(rfc: string, folio: string) {
    const pdfBuffer = await descargaPDFS3(rfc, folio);
    return pdfBuffer;
}
