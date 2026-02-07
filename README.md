# tasks-api

REST API para gestionar tareas (CRUD) usando Node.js, Express, PostgreSQL y Prisma.

## Objetivo

Construir una API pequeña pero bien estructurada para practicar:

- Diseño REST (endpoints, códigos de estado, validaciones)
- Acceso a datos con PostgreSQL + Prisma
- Estructura de proyecto backend (routes / controllers / services)
- Buenas prácticas con Git y documentación

## Stack

- Node.js + Express
- PostgreSQL
- Prisma

## Endpoints (plan)

- GET `/tasks` — listar tareas
- GET `/tasks/:id` — obtener una tarea
- POST `/tasks` — crear una tarea
- PUT `/tasks/:id` — actualizar una tarea
- DELETE `/tasks/:id` — eliminar una tarea

## Estado

En desarrollo. Próximo paso: inicializar el proyecto y crear el modelo `Task`.

# tasks-api

## Setup

1. Install deps
   npm install

2. Configure env
   Copy .env.example to .env and set DATABASE_URL

3. Run migrations
   npx prisma migrate dev

4. Start
   npm run dev
