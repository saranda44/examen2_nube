import { Request, Response } from "express";
import { subscribeClient, publishNotification } from "../services/sns.service";
import { actualizarMetadatosEnvio } from "../services/s3.service";
import { getSecret } from "../services/secrets.service";

// POST /notify
// Body: { cliente_id, email, rfc, folio }
export async function notifyClient(req: Request, res: Response) {
    try {
        const { cliente_id, email, rfc, folio } = req.body;

        // Validación mínima
        if (!cliente_id || !email || !rfc || !folio) {
            return res.status(400).json({
                message: "Body inválido: se requiere cliente_id, email, rfc y folio"
            });
        }

        // 1. Suscribir al cliente al topic con su FilterPolicy
        await subscribeClient(email, cliente_id);

        // 2. Construir la URL del endpoint de descarga del api
        const apiUrl = await getSecret('examen2-api-url');
        const downloadUrl = `${apiUrl}/api/notas/${rfc}/${folio}/descargar`;

        // 3. Publicar el mensaje a SNS con MessageAttribute cliente_id
        const subject = "Tu nota de venta está lista";
        const message = `Hola,

        Se ha generado tu nota de venta. Puedes descargarla en el siguiente enlace:

        ${downloadUrl}

        Si el enlace no abre directamente desde tu correo, cópialo y pégalo en una nueva pestaña de tu navegador.
        
        Gracias.`;

        await publishNotification(cliente_id, subject, message);

        // 4. Actualizar metadatos del PDF en S3
        const { vecesEnviado, horaEnvio } = await actualizarMetadatosEnvio(rfc, folio);

        return res.status(200).json({
            message: "Notificación enviada",
            vecesEnviado,
            horaEnvio
        });

    } catch (error) {
        console.error("Error notificando al cliente:", error);
        return res.status(500).json({
            message: "Error interno al enviar notificación",
            error: String(error)
        });
    }
}