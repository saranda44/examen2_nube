#!/bin/bash
set -e
export AWS_PAGER=cat

# Cargar variables del .env
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/.env"

echo "==> Inicializando base de datos en RDS"

# Validar que tenemos el endpoint
if [ -z "$RDS_ENDPOINT" ]; then
    echo "ERROR: RDS_ENDPOINT no está en el .env. Corre 01-create-rds.sh primero."
    exit 1
fi

# Validar que existe el archivo DDL
DDL_FILE="$SCRIPT_DIR/ddl.sql"
if [ ! -f "$DDL_FILE" ]; then
    echo "ERROR: No se encontró $DDL_FILE"
    exit 1
fi

# Validar que psql está instalado
if ! command -v psql &> /dev/null; then
    echo "ERROR: psql no está instalado."
    exit 1
fi

echo "Conectando a $RDS_ENDPOINT..."
echo "Ejecutando DDL: $DDL_FILE"

# Ejecutar el DDL
# PGPASSWORD permite pasar la password sin que pregunte interactivamente
# -v ON_ERROR_STOP=1 hace que el script falle si alguna query falla
PGPASSWORD="$RDS_DB_PASSWORD" psql \
    -h "$RDS_ENDPOINT" \
    -U "$RDS_DB_USER" \
    -d "$RDS_DB_NAME" \
    -p 5432 \
    -v ON_ERROR_STOP=1 \
    -f "$DDL_FILE"

echo ""
echo "==> Base de datos inicializada."
echo ""
echo "Verificación: tablas creadas"
PGPASSWORD="$RDS_DB_PASSWORD" psql \
    -h "$RDS_ENDPOINT" \
    -U "$RDS_DB_USER" \
    -d "$RDS_DB_NAME" \
    -p 5432 \
    -c "\dt"

echo ""
echo "==> Siguiente: Paso 7 (cluster EKS)."
