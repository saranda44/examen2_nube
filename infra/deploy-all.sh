#!/bin/bash
set -e
export AWS_PAGER=cat

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Validar que existe el .env
if [ ! -f ".env" ]; then
    echo "ERROR: No se encontró infra/.env"
    echo "Cópialo desde .env.example y llena los valores:"
    echo "  cp .env.example .env"
    echo "  # Edita .env y pon una password real en RDS_DB_PASSWORD"
    exit 1
fi

echo "============================================"
echo "  DEPLOY DE INFRAESTRUCTURA AWS - EXAMEN 2"
echo "============================================"
echo ""
echo "Este script va a crear:"
echo "  1. RDS PostgreSQL"
echo "  2. Bucket S3"
echo "  3. Cola SQS"
echo "  4. Topic SNS"
echo "  5. Secretos en Secrets Manager"
echo "  6. Inicializar la base de datos"
echo ""
read -p "¿Continuar? (s/n): " CONFIRM
if [ "$CONFIRM" != "s" ]; then
    echo "Cancelado."
    exit 0
fi

echo ""
echo "[1/6] Creando RDS..."
bash ./01-create-rds.sh

echo ""
echo "[2/6] Creando SQS..."
bash ./02-create-sqs.sh

echo ""
echo "[3/6] Creando S3..."
bash ./03-create-s3.sh

echo ""
echo "[4/6] Creando SNS..."
bash ./04-create-sns.sh

echo ""
echo "[5/6] Creando secretos..."
bash ./05-create-secrets.sh

echo ""
echo "[6/6] Inicializando base de datos..."
bash ./06-init-database.sh

echo ""
echo "============================================"
echo "  INFRAESTRUCTURA LISTA"
echo "============================================"
echo ""
echo "Resumen:"
source .env
echo "  RDS:        $RDS_ENDPOINT"
echo "  S3 bucket:  $S3_BUCKET"
echo "  SQS:        $SQS_URL"
echo "  SNS topic:  $SNS_TOPIC_ARN"
echo ""
echo "Siguiente: Paso 7 - Crear cluster EKS"