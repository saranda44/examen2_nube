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
        const message = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h2 style="color: #2c3e50; margin-bottom: 20px;">Tu nota de venta está lista</h2>

                    <p style="margin-bottom: 25px;">Hola,</p>

                    <p style="margin-bottom: 25px;">Se ha generado tu nota de venta. Haz clic en el botón a continuación para descargarla:</p>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${downloadUrl}" style="display: inline-block; background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Descargar Nota de Venta</a>
                    </div>

                    <p style="margin-bottom: 15px; color: #666; font-size: 13px;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                    <p style="margin-bottom: 25px; word-break: break-all; background-color: #f5f5f5; padding: 10px; border-left: 3px solid #3498db; font-size: 12px;">
                        <code>${downloadUrl}</code>
                    </p>

                    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

                    <p style="margin-bottom: 10px; font-size: 14px;">Gracias por tu confianza.</p>

                    <p style="color: #999; font-size: 12px; margin-top: 20px;">
                        Este es un mensaje automático. Por favor no respondas a este correo.
                    </p>
                </div>
            </body>
            </html>
        `.trim();

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