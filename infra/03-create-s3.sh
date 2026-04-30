#!/bin/bash
set -e
export AWS_PAGER=cat

# Cargar variables del .env
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/.env"

echo "==> Creando bucket S3: $S3_BUCKET"

# verificar si ya existe
if aws s3api head-bucket --bucket "$S3_BUCKET" --region "$AWS_REGION" 2>/dev/null; then
    echo "El bucket $S3_BUCKET ya existe, saltando creación..."
else
    aws s3api create-bucket \
        --bucket "$S3_BUCKET" \
        --region "$AWS_REGION"

    echo "Bucket $S3_BUCKET creado."
fi

echo "==> S3 listo. Siguiente: bash 04-create-sns.sh"