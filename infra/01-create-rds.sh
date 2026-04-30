#!/bin/bash
set -e
export AWS_PAGER=cat

# Cargar variables del .env
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/.env"

echo "==> Creando RDS PostgreSQL: $RDS_INSTANCE_ID"

# verificar si ya existe
if aws rds describe-db-instances --db-instance-identifier "$RDS_INSTANCE_ID" --region "$AWS_REGION" 2>/dev/null | grep -q "DBInstanceStatus"; then
    echo "La instancia $RDS_INSTANCE_ID ya existe, obteniendo endpoint..."
    RDS_ENDPOINT=$(aws rds describe-db-instances \
        --db-instance-identifier "$RDS_INSTANCE_ID" \
        --query 'DBInstances[0].Endpoint.Address' \
        --output text \
        --region "$AWS_REGION")
    SG_ID=$(aws rds describe-db-instances \
        --db-instance-identifier "$RDS_INSTANCE_ID" \
        --query 'DBInstances[0].VpcSecurityGroups[0].VpcSecurityGroupId' \
        --output text \
        --region "$AWS_REGION")
else
    # Detectar VPC default
    VPC_ID=$(aws ec2 describe-vpcs \
        --filters "Name=isDefault,Values=true" \
        --query 'Vpcs[0].VpcId' \
        --output text \
        --region "$AWS_REGION")
    echo "VPC default: $VPC_ID"

    # Detectar security group default de la VPC
    SG_ID=$(aws ec2 describe-security-groups \
        --filters "Name=vpc-id,Values=$VPC_ID" "Name=group-name,Values=default" \
        --query 'SecurityGroups[0].GroupId' \
        --output text \
        --region "$AWS_REGION")
    echo "Security group: $SG_ID"

    # Asegurar que el security group tenga regla de entrada para Postgres (5432)
    # Si la regla ya existe, AWS lanza error pero lo ignoramos con || true
    echo "Agregando regla de entrada para puerto 5432 (0.0.0.0/0)..."
    aws ec2 authorize-security-group-ingress \
        --group-id "$SG_ID" \
        --protocol tcp \
        --port 5432 \
        --cidr 0.0.0.0/0 \
        --region "$AWS_REGION" 2>/dev/null || echo "(Regla ya existe, continuando...)"

    # Crear instancia RDS
    echo "Creando instancia RDS..."
    aws rds create-db-instance \
        --db-instance-identifier "$RDS_INSTANCE_ID" \
        --db-name "$RDS_DB_NAME" \
        --engine postgres \
        --engine-version "$RDS_ENGINE_VERSION" \
        --db-instance-class "$RDS_INSTANCE_CLASS" \
        --allocated-storage "$RDS_ALLOCATED_STORAGE" \
        --master-username "$RDS_DB_USER" \
        --master-user-password "$RDS_DB_PASSWORD" \
        --vpc-security-group-ids "$SG_ID" \
        --publicly-accessible \
        --backup-retention-period 0 \
        --no-multi-az \
        --region "$AWS_REGION"

    echo "Esperando a que la instancia esté disponible..."
    aws rds wait db-instance-available \
        --db-instance-identifier "$RDS_INSTANCE_ID" \
        --region "$AWS_REGION"

    RDS_ENDPOINT=$(aws rds describe-db-instances \
        --db-instance-identifier "$RDS_INSTANCE_ID" \
        --query 'DBInstances[0].Endpoint.Address' \
        --output text \
        --region "$AWS_REGION")
fi

echo "RDS endpoint: $RDS_ENDPOINT"
echo "Security group: $SG_ID"

# Guardar outputs en el .env
sed -i.bak "s|^RDS_ENDPOINT=.*|RDS_ENDPOINT=$RDS_ENDPOINT|" "$SCRIPT_DIR/.env"
sed -i.bak "s|^RDS_SECURITY_GROUP_ID=.*|RDS_SECURITY_GROUP_ID=$SG_ID|" "$SCRIPT_DIR/.env"

echo "==> RDS listo. Siguiente: bash 02-create-sqs.sh"