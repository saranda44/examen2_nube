import { receiveMessage } from "./services/sqs.service";
import { processMessage } from "./worker";

async function main() {
    console.log("receipt-worker iniciado. Escuchando mensajes de SQS...");

    while (true) {
        try {
            const messages = await receiveMessage();

            if (messages.length === 0) {
                // No hay mensajes, el long polling ya esperó 20s.
                // Volvemos al while y hacemos otro poll.
                continue;
            }

            // Procesar cada mensaje
            for (const message of messages) {
                try {
                    await processMessage(message);
                } catch (error) {
                    // Si processMessage falla, NO borramos el mensaje.
                    // SQS lo hará visible de nuevo después del VisibilityTimeout
                    console.error("Error procesando mensaje:", error);
                }
            }
        } catch (error) {
            // Errores en el receiveMessage
            console.error("Error en el polling de SQS:", error);

            // Esperar 5 segundos antes de reintentar para no saturar logs
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

main();