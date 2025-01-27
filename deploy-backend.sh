#!/bin/bash
PROJECT_ID="atom-challenge-bdcd0"  
SERVICE_NAME="atom-challenge-backend" 
REGION="us-central1" 
DOCKER_IMAGE="gcr.io/$PROJECT_ID/backend" 
DOCKERFILE_PATH="infra/docker/backend/Dockerfile.prod"  
BACKEND_PATH="apps/backend" 

echo "Construyendo la imagen Docker..."
docker build -t $DOCKER_IMAGE -f $DOCKERFILE_PATH $BACKEND_PATH || exit 1

echo "Haciendo push de la imagen a Google Artifact Registry..."
docker push $DOCKER_IMAGE || exit 1

echo "Desplegando el backend en Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $DOCKER_IMAGE \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 3000 || exit 1

echo "¡Deploy del backend completado exitosamente!"
