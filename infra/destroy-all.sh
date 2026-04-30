#!/bin/bash
set -e
export AWS_PAGER=cat

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Cargar variables del .env
if [ ! -f ".env" ]; then
    echo "ERROR: No se encontró infra/.env"
    exit 1
fi
source .env

echo "============================================"
echo "  DESTROY DE INFRAESTRUCTURA AWS - EXAMEN 2"
echo "============================================"
echo ""
echo "ADVERTENCIA: Este script va a eliminar PERMANENTEMENTE:"
echo "  - Instancia RDS: $RDS_INSTANCE_ID (todos los datos se perderán)"
echo "  - Bucket S3: $S3_BUCKET (todos los PDFs se perderán)"
echo "  - Cola SQS: $SQS_QUEUE_NAME"
echo "  - Topic SNS: $SNS_TOPIC_NAME"
echo "  - 5 secretos de Secrets Manager"
echo ""
read -p "Escribe 'DESTROY' para confirmar: " CONFIRM
if [ "$CONFIRM" != "DESTROY" ]; then
    echo "Cancelado."
    exit 0
fi

# ============================================
# 1. Eliminar secretos
# ============================================
echo ""
echo "[1/5] Eliminando secretos..."

for SECRET in "$SECRET_DB_CREDENTIALS" "$SECRET_SQS_URL" "$SECRET_S3_BUCKET" "$SECRET_SNS_TOPIC_ARN" "$SECRET_API_URL"; do
    if aws secretsmanager describe-secret --secret-id "$SECRET" --region "$AWS_REGION" 2>/dev/null | grep -q "ARN"; then
        echo "  Eliminando: $SECRET"
        aws secretsmanager delete-secret \
            --secret-id "$SECRET" \
            --force-delete-without-recovery \
            --region "$AWS_REGION" > /dev/null
    else
        echo "  No existe: $SECRET (saltando)"
    fi
done

# ============================================
# 2. Eliminar topic SNS
# ============================================
echo ""
echo "[2/5] Eliminando topic SNS..."

if [ -n "$SNS_TOPIC_ARN" ]; then
    if aws sns get-topic-attributes --topic-arn "$SNS_TOPIC_ARN" --region "$AWS_REGION" 2>/dev/null | grep -q "TopicArn"; then
        echo "  Eliminando topic y todas sus suscripciones: $SNS_TOPIC_NAME"
        aws sns delete-topic --topic-arn "$SNS_TOPIC_ARN" --region "$AWS_REGION"
    else
        echo "  Topic no existe (saltando)"
    fi
fi

# ============================================
# 3. Eliminar cola SQS
# ============================================
echo ""
echo "[3/5] Eliminando cola SQS..."

if [ -n "$SQS_URL" ]; then
    if aws sqs get-queue-attributes --queue-url "$SQS_URL" --region "$AWS_REGION" 2>/dev/null | grep -q "Attributes"; then
        echo "  Eliminando cola: $SQS_QUEUE_NAME"
        aws sqs delete-queue --queue-url "$SQS_URL" --region "$AWS_REGION"
    else
        echo "  Cola no existe (saltando)"
    fi
fi

# ============================================
# 4. Vaciar y eliminar bucket S3
# ============================================
echo ""
echo "[4/5] Eliminando bucket S3..."

if aws s3api head-bucket --bucket "$S3_BUCKET" --region "$AWS_REGION" 2>/dev/null; then
    echo "  Vaciando bucket: $S3_BUCKET"
    aws s3 rm "s3://$S3_BUCKET" --recursive --region "$AWS_REGION" || true

    echo "  Eliminando bucket: $S3_BUCKET"
    aws s3api delete-bucket --bucket "$S3_BUCKET" --region "$AWS_REGION"
else
    echo "  Bucket no existe (saltando)"
fi

# ============================================
# 5. Eliminar instancia RDS
# ============================================
echo ""
echo "[5/5] Eliminando RDS..."

if aws rds describe-db-instances --db-instance-identifier "$RDS_INSTANCE_ID" --region "$AWS_REGION" 2>/dev/null | grep -q "DBInstanceStatus"; then
    echo "  Eliminando instancia RDS: $RDS_INSTANCE_ID (esto tarda ~5 min)"
    aws rds delete-db-instance \
        --db-instance-identifier "$RDS_INSTANCE_ID" \
        --skip-final-snapshot \
        --delete-automated-backups \
        --region "$AWS_REGION" > /dev/null

    echo "  Esperando a que se elimine completamente..."
    aws rds wait db-instance-deleted \
        --db-instance-identifier "$RDS_INSTANCE_ID" \
        --region "$AWS_REGION"

    echo "  RDS eliminada."
else
    echo "  Instancia RDS no existe (saltando)"
fi

# ============================================
# Limpiar el .env de outputs
# ============================================
echo ""
echo "Limpiando outputs en .env..."
sed -i.bak "s|^RDS_ENDPOINT=.*|RDS_ENDPOINT=|" .env
sed -i.bak "s|^SQS_URL=.*|SQS_URL=|" .env
sed -i.bak "s|^SNS_TOPIC_ARN=.*|SNS_TOPIC_ARN=|" .env
sed -i.bak "s|^RDS_SECURITY_GROUP_ID=.*|RDS_SECURITY_GROUP_ID=|" .env

echo ""
echo "============================================"
echo "  INFRAESTRUCTURA ELIMINADA"
echo "============================================"
echo ""
