# Команды проекта (make help). Разработка — yarn (package.json), здесь — Docker и деплой.
#
# Локально (без .env.deploy):
#   make local-up | local-down | local-logs | local-ps — production-сборка в Docker на этой
#     машине: vite --mode docker, VITE_* из .env.docker (создаётся из .env.docker.example);
#     порт LOCAL_PORT=4175, образ с тегом LOCAL_TAG=local
#
# Деплой по SSH. Настройки — .env.deploy (образец .env.deploy.example); адрес API для
# сервера — ENV_FILE (кладёт `make env`). Любое значение — в команде: make deploy SSH_HOST=…
#   make deploy — исходники на хост, сборка образа там же, запуск (sync build up)
#   make env    — env-файл сборки (ENV_FILE) на хост
#   make sync | build | up | down | status | logs | restart
LOCAL_GOALS := help local-up local-down local-logs local-ps
ifneq ($(filter-out $(LOCAL_GOALS),$(MAKECMDGOALS)),)
ifeq ($(wildcard .env.deploy),)
$(error Нет .env.deploy — скопируйте .env.deploy.example и заполните)
endif
include .env.deploy
endif

SSH = ssh $(SSH_USER)@$(SSH_HOST)
# Версия сборки — из git этой копии (на хост .git не уходит): тег или SHA.
APP_VERSION ?= $(shell git describe --tags --always --dirty 2>/dev/null)
APP_COMMIT ?= $(shell git rev-parse --short HEAD 2>/dev/null)
APP_BUILT_AT := $(shell date -u +%Y-%m-%dT%H:%M:%SZ)
BUILD_INFO = APP_VERSION=$(APP_VERSION) APP_COMMIT=$(APP_COMMIT) APP_BUILT_AT=$(APP_BUILT_AT)
REMOTE = cd $(SSH_PROJECT_DIR) && export APP_PORT=$(APP_PORT) $(BUILD_INFO) && docker compose

LOCAL_ENV_FILE := .env.docker
LOCAL_PORT ?= 4175
LOCAL_TAG ?= local
LOCAL = export APP_PORT=$(LOCAL_PORT) TAG=$(LOCAL_TAG) BUILD_MODE=docker $(BUILD_INFO) && docker compose

.PHONY: help deploy sync env build up down status logs restart local-up local-down local-logs local-ps

help:
	@sed -n '1,/^LOCAL_GOALS/p' Makefile | sed -n 's/^# \{0,1\}//p'

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

# --- Локально: production-сборка в Docker на этой машине ---
local-up:
	@test -f $(LOCAL_ENV_FILE) || { cp .env.docker.example $(LOCAL_ENV_FILE) && echo "Создан $(LOCAL_ENV_FILE) из .env.docker.example"; }
	$(LOCAL) up -d --build

local-down:
	$(LOCAL) down

local-logs:
	$(LOCAL) logs -f --tail=200

local-ps:
	$(LOCAL) ps
