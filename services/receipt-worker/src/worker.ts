import { Message } from "@aws-sdk/client-sqs";
import { NotaModel } from "./models/nota.model";
import { generatePDF } from "./services/pdfGenerator.client";
import { notifyClient } from "./services/notifier.client";
import { deleteMessage } from "./services/sqs.service";

// Procesa un solo mensaje de SQS 
// Si todo sale bien, borra el mensaje de la cola
// Si algo falla, NO borra el mensaje (SQS lo reintenta)
export async function processMessage(message: Message): Promise<void> {
    if (!message.Body || !message.ReceiptHandle) {
        throw new Error("Mensaje SQS inválido: falta Body o ReceiptHandle");
    }

    // 1. Parsear el mensaje y extraer notaId
    const body = JSON.parse(message.Body);
    const notaId = body.notaId;

    if (!notaId) {
        throw new Error(`Mensaje sin notaId: ${message.Body}`);
    }

    console.log(`Procesando nota ${notaId}...`);

    // 2. Consultar la nota completa en la DB
    const notaCompleta = await NotaModel.findById(notaId);
    if (!notaCompleta) {
        throw new Error(`Nota ${notaId} no encontrada en la base de datos`);
    }

    // 3. Llamar al pdf-generator para crear el PDF y subirlo a S3
    const { url } = await generatePDF(notaCompleta);
    console.log(`PDF generado: ${url}`);

    // 4. Llamar al notifier para enviar el correo y actualizar metadatos
    await notifyClient({
        cliente_id: notaCompleta.cliente.id,
        email: notaCompleta.cliente.correo,
        rfc: notaCompleta.cliente.rfc,
        folio: notaCompleta.folio
    });
    console.log(`Notificación enviada al cliente ${notaCompleta.cliente.correo}`);

    // 5. Si todo fue exitoso, borrar el mensaje de SQS
    await deleteMessage(message.ReceiptHandle);
    console.log(`Mensaje SQS borrado para nota ${notaId}`);
}