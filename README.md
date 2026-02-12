# tasks-api

REST API para gestionar tareas (CRUD) usando Node.js, Express, PostgreSQL y Prisma.

## Objetivo

Construir una API pequeña pero bien estructurada para practicar:

- Diseño REST (endpoints, códigos de estado, validaciones)
- Acceso a datos con PostgreSQL + Prisma
- Estructura de proyecto backend (routes / controllers / services)
- Borrado lógico (soft delete) y restauración
- Buenas prácticas con Git y documentación

## Stack

- Node.js + Express
- PostgreSQL
- Prisma

## Endpoints

- GET `/tasks` — listar tareas (con filtros, paginación y ordenación)
- GET `/tasks/:id` — obtener una tarea
- POST `/tasks` — crear una tarea
- PUT `/tasks/:id` — actualizar una tarea
- DELETE `/tasks/:id` — borrado lógico (soft delete)
- PATCH `/tasks/:id/restore` — restaurar tarea borrada

## Estado

API funcional con:

- CRUD completo
- Soft delete y restore
- Paginación (`page`, `limit`)
- Filtros (`done`, `search`, rango de fechas)
- Ordenación (`sort`, `order`)
- Inclusión y filtrado de tareas borradas

## Setup

1. Install deps  
   `npm install`

2. Configure env  
   Create a `.env` file and set `DATABASE_URL`

3. Run migrations  
   `npx prisma migrate dev`  
   `npx prisma generate`

4. Start  
   `npm run dev`
