import {
    SecretsManagerClient,
    GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({ region: process.env.AWS_REGION });

export async function getSecret(secretName: string): Promise<any> {
    const command = new GetSecretValueCommand({ SecretId: secretName });
    const response = await client.send(command);
    const secretString = response.SecretString!;

    // Si el secreto es un JSON, lo regresamos como objeto. Si no, como string.
    try {
        return JSON.parse(secretString);
    } catch {
        return secretString;
    }
}