dev:
	pnpm run dev

deploy:
	COMPOSE_BAKE=true docker-compose up --remove-orphans --build