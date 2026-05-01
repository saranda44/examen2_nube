#!/bin/bash
set -e
export AWS_PAGER=cat

CLUSTER_NAME="examen2-cluster"
REGION="us-east-1"

echo "============================================"
echo "  DESTROY DE CLUSTER EKS"
echo "============================================"
echo ""

read -p "Escribe 'DESTROY' para confirmar: " CONFIRM
if [ "$CONFIRM" != "DESTROY" ]; then
    echo "Cancelado."
    exit 0
fi

# Verificar que el cluster existe
if ! eksctl get cluster --name "$CLUSTER_NAME" --region "$REGION" 2>/dev/null | grep -q "$CLUSTER_NAME"; then
    echo "El cluster $CLUSTER_NAME no existe (saltando)."
    exit 0
fi

# Eliminar cluster
echo ""
echo "Eliminando cluster ..."
eksctl delete cluster --name "$CLUSTER_NAME" --region "$REGION"

# Limpiar archivo generado
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
rm -f "$SCRIPT_DIR/cluster.generated.yaml"

echo ""
echo "============================================"
echo "  CLUSTER ELIMINADO"
echo "============================================"