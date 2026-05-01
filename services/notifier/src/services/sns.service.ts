import { 
    SNSClient, 
    PublishCommand, 
    SubscribeCommand,
    ListSubscriptionsByTopicCommand
} from "@aws-sdk/client-sns";
import { getSecret } from "./secrets.service";

const snsClient = new SNSClient({
    region: process.env.AWS_REGION,
});

// Suscribe al cliente al topic con un FilterPolicy basado en su cliente_id
// Si ya está suscrito, SNS NO duplica la suscripción ni manda otro correo de confirmación
export async function subscribeClient(email: string, clienteId: number) {
    const topicArn = await getSecret('examen2-sns-topic-arn');
    
    // Verificar si ya existe una suscripción 
    const listResponse = await snsClient.send(new ListSubscriptionsByTopicCommand({
        TopicArn: topicArn
    }));

    const existingSubscription = listResponse.Subscriptions?.find(
        s => s.Endpoint === email && s.SubscriptionArn !== 'PendingConfirmation'
    );

    if (existingSubscription) {
        // Ya está suscrito y confirmado, no hacer nada
        console.log(`Cliente ${email} ya tiene suscripción confirmada`);
        return;
    }

    const command = new SubscribeCommand({
        TopicArn: topicArn,
        Protocol: "email",
        Endpoint: email,
        Attributes: {
            FilterPolicy: JSON.stringify({
                cliente_id: [String(clienteId)]
            })
        }
    });

    return await snsClient.send(command);
}

// Publica un mensaje al topic. El MessageAttribute cliente_id permite que SNS
// solo entregue el mensaje a la suscripción cuyo FilterPolicy haga match
export async function publishNotification(
    clienteId: number,
    subject: string,
    message: string
) {
    const topicArn = await getSecret('examen2-sns-topic-arn');

    const command = new PublishCommand({
        TopicArn: topicArn,
        Subject: subject,
        Message: message,
        MessageAttributes: {
            cliente_id: {
                DataType: "String",
                StringValue: String(clienteId)
            }
        }
    });

    return await snsClient.send(command);
}