import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSecret } from './secrets.service';

const s3Client = new S3Client({
    region: 'us-east-1'
});

// Sube un PDF a S3 con los 3 metadatos requeridos.
// Devuelve el bucket y la key del objeto creado.
export async function uploadPDF(
    pdfBuffer: Buffer,
    rfc: string,
    folio: string,
    notaId: number
): Promise<{ bucket: string; key: string; url: string }> {

    const bucketName = await getSecret('examen2-s3-bucket');
    const objectKey = `${rfc}/${folio}.pdf`;
    const region = process.env.AWS_REGION || 'us-east-1';

    const putCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
        Body: pdfBuffer,
        ContentType: 'application/pdf',
        Metadata: {
            'hora-envio': new Date().toISOString(),
            'nota-descargada': 'false',
            'veces-enviado': '1'
        }
    });

    await s3Client.send(putCommand);
    const url = `https://${bucketName}.s3.${region}.amazonaws.com/${objectKey}`;

    return {
        bucket: bucketName,
        key: objectKey,
        url: url
    };
}