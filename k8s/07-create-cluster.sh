#!/bin/bash
set -e
export AWS_PAGER=cat

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

CLUSTER_NAME="examen2-cluster"
REGION="us-east-1"

echo "============================================"
echo "  CREACIÓN DE CLUSTER EKS"
echo "============================================"
echo ""

# Validar que eksctl está instalado
if ! command -v eksctl &> /dev/null; then
    echo "ERROR: eksctl no está instalado."
    exit 1
fi

# Validar que kubectl está instalado
if ! command -v kubectl &> /dev/null; then
    echo "ERROR: kubectl no está instalado."
    exit 1
fi

# verificar si el cluster ya existe
if eksctl get cluster --name "$CLUSTER_NAME" --region "$REGION" 2>/dev/null | grep -q "$CLUSTER_NAME"; then
    echo "El cluster $CLUSTER_NAME ya existe."
    echo "Configurando kubectl para conectar al cluster..."
    aws eks update-kubeconfig --name "$CLUSTER_NAME" --region "$REGION"
    echo ""
    echo "Cluster listo. Verifica con: kubectl get nodes"
    exit 0
fi

# Obtener Account ID para sustituir en cluster.yaml
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "Account ID: $ACCOUNT_ID"

# Generar cluster.yaml con valores reales
echo "Generando cluster.generated.yaml..."
sed "s|<ACCOUNT_ID>|$ACCOUNT_ID|g" cluster.yaml > cluster.generated.yaml

echo ""
echo "Configuración del cluster:"
echo "  Nombre: $CLUSTER_NAME"
echo "  Región: $REGION"
echo "  Nodos: 2 x t3.medium"
echo ""
echo ""
read -p "¿Continuar? (s/n): " CONFIRM
if [ "$CONFIRM" != "s" ]; then
    echo "Cancelado."
    rm -f cluster.generated.yaml
    exit 0
fi

# Crear el cluster
echo ""
echo "Creando cluster EKS..."
eksctl create cluster -f cluster.generated.yaml

# Configurar kubectl
# configura ~/.kube/config para que kubectl sepa cómo hablar con el cluster
echo ""
echo "Configurando kubectl..."
aws eks update-kubeconfig --name "$CLUSTER_NAME" --region "$REGION"

# Verificar que kubectl puede hablar con el cluster
echo ""
echo "Verificando conexión al cluster..."
kubectl get nodes

echo ""
echo "============================================"
echo "  CLUSTER LISTO"
echo "============================================"
echo ""
echo "Siguiente: Paso 8 - Manifiestos de Kubernetes"