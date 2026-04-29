import { S3Client, HeadObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3';
import { getSecret } from './secrets.service';

const s3Client = new S3Client({
    region: process.env.AWS_REGION || "us-east-1"
});

// Incrementa veces-enviado en 1 y actualiza hora-envio al timestamp actual.
// Usa CopyObject con MetadataDirective: REPLACE (igual que en el api para descargas).
export async function actualizarMetadatosEnvio(rfc: string, folio: string) {
    const bucketName = await getSecret('examen2-s3-bucket');
    const objectKey = `${rfc}/${folio}.pdf`;

    // 1. Leer los metadatos actuales con HEAD (no descarga el body, solo headers)
    const headCommand = new HeadObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
    });
    const headResponse = await s3Client.send(headCommand);
    const metadataActual = headResponse.Metadata || {};

    // 2. Calcular nuevo valor de veces-enviado
    const vecesEnviadoActual = parseInt(metadataActual['veces-enviado'] || '0', 10);
    const vecesEnviadoNuevo = vecesEnviadoActual + 1;

    // 3. Sobrescribir metadatos: copy del objeto sobre sí mismo con metadatos nuevos
    const copyCommand = new CopyObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
        CopySource: `${bucketName}/${objectKey}`,
        MetadataDirective: "REPLACE",
        ContentType: "application/pdf",
        Metadata: {
            ...metadataActual,
            'hora-envio': new Date().toISOString(),
            'veces-enviado': String(vecesEnviadoNuevo)
        }
    });

    await s3Client.send(copyCommand);

    return {
        vecesEnviado: vecesEnviadoNuevo,
        horaEnvio: new Date().toISOString()
    };
}