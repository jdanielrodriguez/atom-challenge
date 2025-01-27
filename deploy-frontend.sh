#!/bin/bash

echo "Estableciendo entorno de producción para el build..."
export NG_APP_ENV=production

echo "Compilando el frontend..."
cd apps/frontend
yarn build

echo "Copiando build al contenedor de Firebase..."
docker cp dist atom_challenge_firebase:/firebase/hosting

echo "Haciendo deploy desde el contenedor de Firebase..."
docker exec -it atom_challenge_firebase firebase deploy --only hosting --public /hosting/browser
