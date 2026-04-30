#!/bin/bash
set -e
export AWS_PAGER=cat

# Cargar variables del .env
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/.env"

echo "==> Creando secretos en Secrets Manager"

# Validar que tenemos los outputs de los scripts anteriores
if [ -z "$RDS_ENDPOINT" ] || [ -z "$SQS_URL" ] || [ -z "$SNS_TOPIC_ARN" ]; then
    echo "ERROR: Faltan valores en el .env (RDS_ENDPOINT, SQS_URL o SNS_TOPIC_ARN)"
    echo "Asegúrate de haber corrido los scripts 01, 02 y 04 primero."
    exit 1
fi

# Función helper para crear o actualizar un secreto
create_or_update_secret() {
    local SECRET_NAME=$1
    local SECRET_VALUE=$2

    if aws secretsmanager describe-secret --secret-id "$SECRET_NAME" --region "$AWS_REGION" 2>/dev/null | grep -q "ARN"; then
        echo "  Actualizando secreto existente: $SECRET_NAME"
        aws secretsmanager update-secret \
            --secret-id "$SECRET_NAME" \
            --secret-string "$SECRET_VALUE" \
            --region "$AWS_REGION" > /dev/null
    else
        echo "  Creando secreto nuevo: $SECRET_NAME"
        aws secretsmanager create-secret \
            --name "$SECRET_NAME" \
            --secret-string "$SECRET_VALUE" \
            --region "$AWS_REGION" > /dev/null
    fi
}

# 1. Credenciales de RDS (JSON con todos los campos)
echo "Secreto 1: $SECRET_DB_CREDENTIALS"
DB_CREDS_JSON=$(cat <<EOF
{
  "host": "$RDS_ENDPOINT",
  "user": "$RDS_DB_USER",
  "password": "$RDS_DB_PASSWORD",
  "dbname": "$RDS_DB_NAME",
  "port": 5432
}
EOF
)
create_or_update_secret "$SECRET_DB_CREDENTIALS" "$DB_CREDS_JSON"

# 2. URL de la cola SQS 
echo "Secreto 2: $SECRET_SQS_URL"
create_or_update_secret "$SECRET_SQS_URL" "$SQS_URL"

# 3. Nombre del bucket S3 
echo "Secreto 3: $SECRET_S3_BUCKET"
create_or_update_secret "$SECRET_S3_BUCKET" "$S3_BUCKET"

# 4. ARN del topic SNS 
echo "Secreto 4: $SECRET_SNS_TOPIC_ARN"
create_or_update_secret "$SECRET_SNS_TOPIC_ARN" "$SNS_TOPIC_ARN"

echo ""
echo "==> Secretos listos. Siguiente: bash 06-init-database.sh"
echo ""
echo "NOTA: El secreto $SECRET_API_URL se crea después de desplegar el cluster"
echo "      (cuando se conozca la URL del LoadBalancer del api)."