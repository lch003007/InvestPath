all:install migrate seeder

install:
	cd server && npm install
	cd web && npm install

migrate:
	cd server && npx prisma migrate dev --name init

seeder:
	cd server && npm run seeder

