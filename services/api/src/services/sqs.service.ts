import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { getSecret } from "./secrets.service";

const sqsClient = new SQSClient({
    region: "us-east-1",
});

// Publicar mensaje a SQS cuando se crea una nota
export async function publishNoteCreated(notaId: number) {
    const queueUrl = await getSecret("examen2-sqs-url");

    const command = new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify({
            eventType: "NOTA_CREATED",
            notaId: notaId
        })
    });

    return await sqsClient.send(command);
}