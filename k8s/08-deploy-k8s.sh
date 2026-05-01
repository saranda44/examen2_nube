#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

CLUSTER_NAME="examen2-cluster"
REGION="us-east-1"

echo "============================================"
echo "  DEPLOY DE MANIFIESTOS A KUBERNETES"
echo "============================================"
echo ""

# 1. ConfigMap
echo "[1/3] Aplicando ConfigMap..."
kubectl apply -f configmap.yaml

# 2. Services
echo ""
echo "[2/3] Aplicando Services..."
kubectl apply -f api-service.yaml
kubectl apply -f pdf-generator-service.yaml
kubectl apply -f notifier-service.yaml

# 3. Deployments
echo ""
echo "[3/3] Aplicando Deployments..."
kubectl apply -f api-deployment.yaml
kubectl apply -f pdf-generator-deployment.yaml
kubectl apply -f notifier-deployment.yaml
kubectl apply -f receipt-worker-deployment.yaml

# Esperar a que los pods estén Running
echo ""
echo "Esperando a que los pods estén Running ..."
kubectl wait --for=condition=ready pod -l app=api --timeout=180s || echo "(api aún no está ready, revisa con kubectl get pods)"
kubectl wait --for=condition=ready pod -l app=pdf-generator --timeout=180s || echo "(pdf-generator aún no está ready)"
kubectl wait --for=condition=ready pod -l app=notifier --timeout=180s || echo "(notifier aún no está ready)"
kubectl wait --for=condition=ready pod -l app=receipt-worker --timeout=180s || echo "(receipt-worker aún no está ready)"

echo ""
echo "Estado actual de los recursos:"
echo ""
echo "--- Pods ---"
kubectl get pods
echo ""
echo "--- Services ---"
kubectl get services
echo ""

# Obtener URL del LoadBalancer del api
echo "Obteniendo URL del api LoadBalancer..."
API_URL=""
for i in {1..30}; do
    API_URL=$(kubectl get service api-service -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "")
    if [ -n "$API_URL" ]; then
        break
    fi
    echo "  Esperando provisión del LoadBalancer... ($i/30)"
    sleep 10
done

if [ -n "$API_URL" ]; then
    FULL_URL="http://$API_URL"
    SECRET_NAME="examen2-api-url"

    echo ""
    echo "Registrando URL del api en Secrets Manager..."

    # Crear o actualizar el secreto 
    if aws secretsmanager describe-secret --secret-id "$SECRET_NAME" --region "$REGION" 2>/dev/null | grep -q "ARN"; then
        echo "  Actualizando secreto existente..."
        aws secretsmanager update-secret \
            --secret-id "$SECRET_NAME" \
            --secret-string "$FULL_URL" \
            --region "$REGION" > /dev/null
    else
        echo "  Creando secreto nuevo..."
        aws secretsmanager create-secret \
            --name "$SECRET_NAME" \
            --secret-string "$FULL_URL" \
            --region "$REGION" > /dev/null
    fi

    # Reiniciar el notifier para que tome la nueva URL
    echo "Reiniciando deployment del notifier..."
    kubectl rollout restart deployment/notifier-deployment

    echo ""
    echo "============================================"
    echo "  DEPLOY COMPLETO"
    echo "============================================"
    echo ""
    echo "URL del api: $FULL_URL"
    echo ""
else
    echo ""
    echo "La URL del LoadBalancer aún no está lista."
    echo "Verifica con: kubectl get service api-service"
    echo "Y configurar manualmente el secreto $SECRET_NAME y reiniciar el notifier si es necesario."
    echo ""
fi