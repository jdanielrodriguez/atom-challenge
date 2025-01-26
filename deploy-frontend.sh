#!/bin/bash

# 1. Compilar el frontend
echo "Compilando el frontend..."
cd apps/frontend
yarn build

# 2. Hacer el deploy desde el contenedor de Firebase
echo "Haciendo deploy desde el contenedor de Firebase..."
docker exec -it atom_challenge_firebase firebase deploy --only hosting --public /hosting/browser
