import axios from "axios";

const NOTIFIER_URL = process.env.NOTIFIER_URL;

if (!NOTIFIER_URL) {
    throw new Error("La variable de entorno NOTIFIER_URL no está definida");
}

interface NotifyPayload {
    cliente_id: number;
    email: string;
    rfc: string;
    folio: string;
}

// Llama al notifier para enviar el correo al cliente y actualizar metadatos en S3
export async function notifyClient(payload: NotifyPayload): Promise<void> {
    await axios.post(
        `${NOTIFIER_URL}/notify`,
        payload,
        {
            headers: { "Content-Type": "application/json" },
            timeout: 15000   // 15s de timeout
        }
    );
}