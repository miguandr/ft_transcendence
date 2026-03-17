OS := $(shell uname -s)

ifeq ($(OS),Darwin)
	HOST_IP := $(shell ipconfig getifaddr en0)
	OPEN_CMD := open
else
	HOST_IP := $(shell hostname -I | awk '{print $$1}')
	OPEN_CMD := xdg-open
endif

APP_URL := http://localhost:5173

.PHONY: up down restart logs build remove

up:
	@echo "Starting Async Scrum Hub..."
	HOST_IP=$(HOST_IP) docker-compose up -d
	@echo "Waiting for app to be ready..."
	@until docker-compose ps | grep -q "healthy" || docker-compose logs frontend 2>&1 | grep -q "ready in"; do \
		sleep 2; \
	done
	@echo "Opening browser at $(APP_URL)"
	@$(OPEN_CMD) $(APP_URL) &
	@docker-compose logs -f

down:
	docker-compose down

restart:
	docker-compose down
	HOST_IP=$(HOST_IP) docker-compose up -d
	@$(OPEN_CMD) $(APP_URL) &
	@docker-compose logs -f

logs:
	docker-compose logs -f

build:
	@echo "Building and starting Async Scrum Hub..."
	HOST_IP=$(HOST_IP) docker-compose up --build -d
	@echo "Waiting for app to be ready..."
	@until docker-compose logs frontend 2>&1 | grep -q "ready in"; do \
		sleep 2; \
	done
	@echo "Opening browser at $(APP_URL)"
	@$(OPEN_CMD) $(APP_URL) &
	@docker-compose logs -f

remove:
	docker-compose down -v
