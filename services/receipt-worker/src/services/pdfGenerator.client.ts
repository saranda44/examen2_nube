import axios from "axios";

const PDF_GENERATOR_URL = process.env.PDF_GENERATOR_URL;

if (!PDF_GENERATOR_URL) {
    throw new Error("La variable de entorno PDF_GENERATOR_URL no está definida");
}

// Llama al pdf-generator para crear y subir el PDF a S3
// Devuelve key y URL del objeto creado
export async function generatePDF(nota: any): Promise<{
    key: string;
    url: string;
}> {
    const response = await axios.post(
        `${PDF_GENERATOR_URL}/generate`,
        nota,
        {
            headers: { "Content-Type": "application/json" },
            timeout: 30000   // 30s de timeout
        }
    );

    return {
        key: response.data.key,
        url: response.data.url
    };
}