import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand, Message } from "@aws-sdk/client-sqs";
import { getSecret } from "./secrets.service";

const sqsClient = new SQSClient({
    region: process.env.AWS_REGION || "us-east-1",
});

// para no llamar a Secrets Manager en cada poll
let queueUrl: string | null = null;

async function getQueueUrl(): Promise<string> {
    if (queueUrl) return queueUrl;
    queueUrl = await getSecret('examen2-sqs-url');
    return queueUrl!;
}

// Recibe hasta 1 mensaje de la cola con long polling de 20 segundos
// Si no hay mensajes, devuelve un array vacío
export async function receiveMessage(): Promise<Message[]> {
    const url = await getQueueUrl();

    const command = new ReceiveMessageCommand({
        QueueUrl: url,
        MaxNumberOfMessages: 1,
        WaitTimeSeconds: 20,        // long polling
        VisibilityTimeout: 60       // 60s para procesar antes de que vuelva a ser visible
    });

    const response = await sqsClient.send(command);
    return response.Messages || [];
}

// Borra un mensaje de la cola usando su ReceiptHandle
// Llamar después de procesar un mensaje
export async function deleteMessage(receiptHandle: string): Promise<void> {
    const url = await getQueueUrl();

    const command = new DeleteMessageCommand({
        QueueUrl: url,
        ReceiptHandle: receiptHandle
    });

    await sqsClient.send(command);
}