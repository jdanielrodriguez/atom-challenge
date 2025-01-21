NETWORK=atom_challenge_network
SUBNET=192.168.100.0/24

.PHONY: check-network create-network check-volumes create-volumes up down clean

check-network:
	@if ! docker network inspect $(NETWORK) >/dev/null 2>&1; then \
		echo "Network $(NETWORK) no existe. Creando..."; \
		docker network create --driver bridge --subnet=$(SUBNET) $(NETWORK); \
	else \
		echo "Network $(NETWORK) ya existe."; \
	fi

create-volumes:
	@if ! docker volume inspect atom_challenge_firebase_volume >/dev/null 2>&1; then \
		docker volume create atom_challenge_firebase_volume; \
		echo "Creado volumen atom_challenge_firebase_volume"; \
	fi

check-volumes: create-volumes

up: check-network check-volumes
	docker-compose -f infra/docker-compose.yml up -d --build

down:
	docker-compose -f infra/docker-compose.yml down

clean: down
	docker volume rm atom_challenge_firebase_volume || true
	docker network rm $(NETWORK) || true
