import { Request, Response } from "express";
import { generatePDFBuffer } from "../services/pdf.service";
import { uploadPDF } from "../services/s3.service";

// POST /generate
// Body: {
//   "id": 123,
//   "folio": "FOLIO-1772912265164",
//   "total": 5000,
//   "cliente": { "razon_social": "...", "rfc": "...", "correo": "...", "telefono": "..." },
//   "direccion_facturacion": { ... },
//   "direccion_envio": { ... },
//   "detalle": [ { "producto": "...", "cantidad": 12, "precio_unitario": 500, "importe": 6000 } ]
// }

// Response 200: {
//   "url": "https://7bucket-name.s3.amazonaws.com/dsvdsf/FOLIO-1772912265164.pdf",
// }
export async function generatePDF(req: Request, res: Response) {
    try {
        const nota = req.body;

        // Validación mínima: nos aseguramos de tener lo esencial
        if (!nota || !nota.cliente || !nota.folio || !nota.id) {
            return res.status(400).json({
                message: "Body inválido: se requiere id, folio, cliente y detalle"
            });
        }

        // 1. Generar el PDF en memoria
        const pdfBuffer = await generatePDFBuffer(nota);

        // 2. Subir a S3 con metadatos
        const { bucket, key, url } = await uploadPDF(
            pdfBuffer,
            nota.cliente.rfc,
            nota.folio,
            nota.id
        );

        return res.status(201).json({
            message: "PDF generado y subido a S3",
            key,
            url
        });

    } catch (error) {
        console.error("Error generando PDF:", error);
        return res.status(500).json({
            message: "Error interno al generar PDF",
            error: String(error)
        });
    }
}