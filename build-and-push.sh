#!/bin/bash
set -e

DOCKER_USER="saranda06"
TAG="latest"

# servicios a buildear
SERVICES=("api" "pdf-generator" "notifier" "receipt-worker")

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "============================================"
echo "  BUILD Y PUSH DE IMÁGENES A DOCKER HUB"
echo "============================================"
echo ""
echo "Usuario Docker Hub: $DOCKER_USER"
echo "Tag: $TAG"
echo "Servicios: ${SERVICES[*]}"
echo ""

# Buildear y pushear cada servicio
for SERVICE in "${SERVICES[@]}"; do
    IMAGE_NAME="$DOCKER_USER/$SERVICE-examen2:$TAG"
    SERVICE_DIR="services/$SERVICE"

    echo ""
    echo "============================================"
    echo "  Procesando: $SERVICE"
    echo "============================================"

    if [ ! -d "$SERVICE_DIR" ]; then
        echo "ERROR: No se encontró el directorio $SERVICE_DIR"
        exit 1
    fi

    echo "Build: $IMAGE_NAME"
    docker build -t "$IMAGE_NAME" "$SERVICE_DIR"

    echo ""
    echo "Push: $IMAGE_NAME"
    docker push "$IMAGE_NAME"

    echo ""
    echo "✓ $SERVICE listo"
done

echo ""
echo "============================================"
echo "  TODAS LAS IMÁGENES SUBIDAS"
echo "============================================"
echo ""
echo "Imágenes en Docker Hub:"
for SERVICE in "${SERVICES[@]}"; do
    echo "  - https://hub.docker.com/r/$DOCKER_USER/$SERVICE-examen2"
done
echo ""
echo "Siguiente: Paso 10 - Despliegue y pruebas E2E"