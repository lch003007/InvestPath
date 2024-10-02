projectName = invest-path

up:
	cd docker && docker-compose -p $(projectName) up -d

# 停止並移除容器
down:
	docker-compose -p $(projectName) down

# 查看容器日誌
logs:
	docker-compose -p $(projectName) logs

# 重新啟動容器
restart:
	docker-compose -p $(projectName) down && docker-compose -p $(projectName) up -d

# 檢查容器狀態
ps:
	docker-compose -p $(projectName) ps

# 執行命令到容器內 (例如進入 PostgreSQL 容器)
exec-postgres:
	docker-compose -p $(projectName) exec postgres bash

install:
	cd server && npm install

migrate:
	cd server && npx prisma migrate dev --name init

seeder:
	cd server && npm run seeder

all:up install migrate seedar