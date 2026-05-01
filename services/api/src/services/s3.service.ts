import { S3Client, GetObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3';
import { getSecret } from './secrets.service';

const s3Client = new S3Client({
    region: process.env.AWS_REGION
});

//funcion para descargar pdf -> devuelve Buffer
export async function descargarPDF(rfc: string, folio: string) {
    //obtener nombre del bucket desde Secrets Manager
    const bucketName = await getSecret('examen2-s3-bucket');

    //nombre del objeto a descargar
    const objectKey = `${rfc}/${folio}.pdf`;
    
    try {
        //obtener objeto
        const getCommand = new GetObjectCommand({
            Bucket: bucketName,
            Key: objectKey,
        });

        const response = await s3Client.send(getCommand);

        // Para archivos binarios (PDF, Imágenes), transformamos a Uint8Array 
        // y luego a Buffer para su manejo en Node.js
        const byteArray = await response.Body?.transformToByteArray();

        if (!byteArray) throw new Error("El cuerpo del objeto está vacío");

        //modificar metadatos
        const copyCommand = new CopyObjectCommand({
            Bucket: bucketName,
            Key: objectKey,
            CopySource: `${bucketName}/${objectKey}`, // El origen es el mismo archivo
            MetadataDirective: "REPLACE",
            ContentType: "application/pdf",
            Metadata: {
                ...response.Metadata,
                "nota-descargada": "true"
            }
        });
        await s3Client.send(copyCommand);

        return Buffer.from(byteArray);
    } catch (error) {
        console.error("Error descargando el objeto:", error);
        throw error;
    }

}