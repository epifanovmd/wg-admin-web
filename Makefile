# Деплой по SSH: исходники на хост и сборка образа там же. Настройки — .env.deploy
# (образец .env.deploy.example); адрес API для сервера — ENV_FILE (кладёт `make env`).
-include .env.deploy

SSH_TARGETS := deploy sync env build up down status logs restart

ifneq ($(filter $(SSH_TARGETS),$(MAKECMDGOALS)),)
ifeq ($(wildcard .env.deploy),)
$(error Нет .env.deploy — скопируйте .env.deploy.example и заполните)
endif
endif

SSH = ssh $(SSH_USER)@$(SSH_HOST)
# Версия сборки — из git этой копии (на хост .git не уходит): тег или SHA.
APP_VERSION ?= $(shell git describe --tags --always --dirty 2>/dev/null)
APP_COMMIT ?= $(shell git rev-parse --short HEAD 2>/dev/null)
APP_BUILT_AT := $(shell date -u +%Y-%m-%dT%H:%M:%SZ)
BUILD_INFO = APP_VERSION=$(APP_VERSION) APP_COMMIT=$(APP_COMMIT) APP_BUILT_AT=$(APP_BUILT_AT)
REMOTE = cd $(SSH_PROJECT_DIR) && export APP_PORT=$(APP_PORT) $(BUILD_INFO) && docker compose
LOCAL = APP_PORT=$(APP_PORT) $(BUILD_INFO) docker compose

.PHONY: $(SSH_TARGETS) local-up local-down local-logs

deploy: sync build up

sync:
	$(SSH) 'mkdir -p $(SSH_PROJECT_DIR)'
	rsync -az --delete --exclude-from=.deployignore ./ $(SSH_USER)@$(SSH_HOST):$(SSH_PROJECT_DIR)/

env:
	$(SSH) 'mkdir -p $(SSH_PROJECT_DIR)'
	scp $(ENV_FILE) $(SSH_USER)@$(SSH_HOST):$(SSH_PROJECT_DIR)/$(ENV_FILE)

build:
	$(SSH) '$(REMOTE) build'

up:
	$(SSH) '$(REMOTE) up -d --remove-orphans && docker image prune -f'

down:
	$(SSH) '$(REMOTE) down'

status:
	$(SSH) '$(REMOTE) ps'

logs:
	$(SSH) '$(REMOTE) logs -f --tail=200'

restart:
	$(SSH) '$(REMOTE) restart'

# --- Локально (docker на этой машине) ---
local-up:
	$(LOCAL) up -d --build

local-down:
	$(LOCAL) down

local-logs:
	$(LOCAL) logs -f --tail=200
