HOST_IP := $(shell ipconfig getifaddr en0)

.PHONY: up down restart logs build

up:
	HOST_IP=$(HOST_IP) docker-compose up

down:
	docker-compose down

restart:
	docker-compose down
	HOST_IP=$(HOST_IP) docker-compose up

logs:
	docker-compose logs -f

build:
	HOST_IP=$(HOST_IP) docker-compose up --build
