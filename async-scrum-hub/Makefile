OS := $(shell uname -s)

ifeq ($(OS),Darwin)
	OPEN_CMD := open
else
	OPEN_CMD := xdg-open
endif

# Read HOST_IP from .env if set; otherwise auto-detect the network IP
HOST_IP := $(shell grep -E '^HOST_IP=' .env 2>/dev/null | cut -d= -f2)
ifeq ($(strip $(HOST_IP)),)
ifeq ($(OS),Darwin)
	HOST_IP := $(shell ipconfig getifaddr en0)
else
	HOST_IP := $(shell hostname -I | awk '{print $$1}')
endif
endif

APP_URL := http://localhost:8080

.PHONY: up down restart logs build remove

up:
	@[ -f .env ] || (cp .env.example .env && echo "Created .env from .env.example")
	@echo "Starting Async Scrum Hub..."
	HOST_IP=$(HOST_IP) docker compose up -d
	@echo "Waiting for app to be ready..."
	@until docker compose logs frontend 2>&1 | grep -q "ready in"; do \
		sleep 1; \
	done
	@echo "Waiting for nginx to be ready..."
	@until curl -s http://$(HOST_IP):8080 > /dev/null 2>&1; do \
		sleep 1; \
	done
	@echo "Opening browser at $(APP_URL)"
	@$(OPEN_CMD) $(APP_URL) &
	@docker compose logs -f

down:
	docker compose down

restart:
	docker compose down
	HOST_IP=$(HOST_IP) docker compose up -d
	@echo "Waiting for app to be ready..."
	@until docker compose logs frontend 2>&1 | grep -q "ready in"; do \
		sleep 1; \
	done
	@echo "Waiting for nginx to be ready..."
	@until curl -s http://localhost:8080 > /dev/null 2>&1; do \
		sleep 1; \
	done
	@$(OPEN_CMD) $(APP_URL) &
	@docker compose logs -f

logs:
	docker compose logs -f

build:
	@[ -f .env ] || (cp .env.example .env && echo "Created .env from .env.example")
	@echo "Building and starting Async Scrum Hub..."
	HOST_IP=$(HOST_IP) docker compose up --build -d
	@echo "Waiting for app to be ready..."
	@until docker compose logs frontend 2>&1 | grep -q "ready in"; do \
		sleep 1; \
	done
	@echo "Waiting for nginx to be ready..."
	@until curl -s http://$(HOST_IP):8080 > /dev/null 2>&1; do \
		sleep 1; \
	done
	@echo "Opening browser at $(APP_URL)"
	@$(OPEN_CMD) $(APP_URL) &
	@docker compose logs -f

remove:
	docker compose down -v
