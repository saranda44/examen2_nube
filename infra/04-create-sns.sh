#!/bin/bash
set -e
export AWS_PAGER=cat

# Cargar variables del .env
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/.env"

echo "==> Creando topic SNS: $SNS_TOPIC_NAME"

# verificar si ya existe
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
EXPECTED_ARN="arn:aws:sns:${AWS_REGION}:${ACCOUNT_ID}:${SNS_TOPIC_NAME}"

EXISTING_ARN=$(aws sns list-topics \
    --region "$AWS_REGION" \
    --query "Topics[?TopicArn=='$EXPECTED_ARN'].TopicArn" \
    --output text 2>/dev/null || echo "")

if [ -n "$EXISTING_ARN" ]; then
    echo "El topic $SNS_TOPIC_NAME ya existe, usando ARN existente..."
    SNS_TOPIC_ARN="$EXISTING_ARN"
else
    # Crear topic
    SNS_TOPIC_ARN=$(aws sns create-topic \
        --name "$SNS_TOPIC_NAME" \
        --region "$AWS_REGION" \
        --query 'TopicArn' \
        --output text)

    echo "Topic creado."
fi

echo "SNS Topic ARN: $SNS_TOPIC_ARN"

# Guardar output en el .env
sed -i.bak "s|^SNS_TOPIC_ARN=.*|SNS_TOPIC_ARN=$SNS_TOPIC_ARN|" "$SCRIPT_DIR/.env"

echo ""
echo "==> SNS listo. Siguiente: bash 05-create-secrets.sh"
echo ""
echo "Las suscripciones de email se crean manualmente."
echo "Cuando crees clientes, suscríbelos al topic con FilterPolicy basado en cliente_id."
echo "Ejemplo:"
echo "  aws sns subscribe \\"
echo "    --topic-arn $SNS_TOPIC_ARN \\"
echo "    --protocol email \\"
echo "    --notification-endpoint cliente@iteso.mx \\"
echo "    --attributes 'FilterPolicy={\"cliente_id\":[\"1\"]}'"