#!/bin/bash

echo "Compilando el frontend..."
cd apps/frontend
yarn build

echo "Haciendo deploy desde el contenedor de Firebase..."
docker exec -it atom_challenge_firebase firebase deploy --only hosting --public /hosting/browser
