#!/bin/bash
set -e
export AWS_PAGER=cat

# Cargar variables del .env
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/.env"

echo "==> Creando cola SQS: $SQS_QUEUE_NAME"

# verificar si ya existe
EXISTING_URL=$(aws sqs get-queue-url \
    --queue-name "$SQS_QUEUE_NAME" \
    --region "$AWS_REGION" \
    --query 'QueueUrl' \
    --output text 2>/dev/null || echo "")

if [ -n "$EXISTING_URL" ]; then
    echo "La cola $SQS_QUEUE_NAME ya existe, usando URL existente..."
    SQS_URL="$EXISTING_URL"
else
    # Crear cola estándar
    SQS_URL=$(aws sqs create-queue \
        --queue-name "$SQS_QUEUE_NAME" \
        --attributes "VisibilityTimeout=60,MessageRetentionPeriod=345600,ReceiveMessageWaitTimeSeconds=20" \
        --region "$AWS_REGION" \
        --query 'QueueUrl' \
        --output text)

    echo "Cola creada."
fi

echo "SQS URL: $SQS_URL"

# Guardar output en el .env
sed -i.bak "s|^SQS_URL=.*|SQS_URL=$SQS_URL|" "$SCRIPT_DIR/.env"

echo "==> SQS listo. Siguiente: bash 03-create-s3.sh"